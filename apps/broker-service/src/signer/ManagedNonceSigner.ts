import { Provider, TransactionRequest, TransactionResponse } from '@ethersproject/abstract-provider';
import { FirestoreAdmin, Timestamp, getFirestore } from '@thecointech/firestore';
import { log } from '@thecointech/logging';
import { Bytes, Signer, utils } from 'ethers';
import { DateTime } from 'luxon';
import { sleep } from '@thecointech/async';

export class ManagedNonceSigner extends Signer {
  private baseSigner: Signer;
  // _isSigner: boolean;

  constructor(signer: Signer) {
    super();
    this.baseSigner = signer;
    this.provider = signer.provider;
  }
  provider?: Provider | undefined;
  // Required overrides
  getAddress(): Promise<string> {
    return this.baseSigner.getAddress();
  }
  signMessage(message: string | Bytes): Promise<string> {
    return this.baseSigner.signMessage(message);
  }
  signTransaction(transaction: utils.Deferrable<TransactionRequest>): Promise<string> {
    return this.baseSigner.signTransaction(transaction);
  }
  connect(provider: Provider): Signer {
    return new ManagedNonceSigner(this.baseSigner.connect(provider));
  }

  // Optional overrides

  sendTransaction(transaction: utils.Deferrable<TransactionRequest>): Promise<TransactionResponse> {
    if (transaction.nonce == undefined) {
      // Because there are multiple versions of this service running, we
      // need to lock the nonce while in-use and ensure it is always up-to-date
      return guardFn<TransactionResponse>(async (lastNonce) => {
        if (lastNonce !== undefined) {
          transaction = utils.shallowCopy(transaction);
          const pendingNonce = await this.getTransactionCount("pending")
          transaction.nonce = Math.max(pendingNonce, lastNonce + 1);
        }
        return await this.baseSigner.sendTransaction(transaction);
      });
    }
    else {
      // If a nonce is set explicitly (eg replay tx), then no modifications
      return this.baseSigner.sendTransaction(transaction);
    }
  }
}

export async function guardFn<T extends { nonce?: number }>(fn: (lastNonce: number|undefined) => Promise<T>): Promise<T> {
  const guard = await enterCS();

  if (!guard) {
    throw new Error("Cannot submit transaction - someone else holds the critical section");
  }

  log.debug(`CS acquired ManagedNonce: ${guard.lastNonce}`);

  let usedNonce = guard.lastNonce;
  try {
    const tx = await fn(guard.lastNonce);
    // Do not update the nonce unless the transaction is
    // successfully submitted.
    usedNonce = tx.nonce;
    return tx;
  }
  finally {
    await exitCS(guard.timestamp, usedNonce);
  }
}

const cs_doc = "BrokerTransferAssistant/__nonce_cs";
const start_key = "started";
const complete_key = "complete";
const lastNonce_key = "lastNonce";
async function enterCS() {
  const db = getFirestore() as FirestoreAdmin;
  const ref = db.doc(cs_doc);
  // Back-off & retry 10 times over 55 seconds
  for (let i = 0; i < 10; i++) {
    const r = await db.runTransaction(async t => {
      const doc = await t.get(ref);

      if (doc.exists) {
        const startKey = doc.get(start_key);
        const completeKey = doc.get(complete_key);
        log.info(
          { startKey: startKey?.toDate(), completeKey: completeKey?.toDate() },
          'CS state: {startKey} {completeKey}'
        )

        // Check if someone else currently holds the lock
        if (startKey?.toMillis() != completeKey?.toMillis()) {

          if (completeKey?.toMillis() < DateTime.now().minus({minutes: 15}).toMillis()) {
            // We assume that a 15-min gap means that someone else has crashed
            log.error("Expired Nonce-lock detected, ignoring");
          }
          else {
            // Someone else holds the lock & is still running, so we can't update
            return false;
          }
        }
      }

      const timestamp = Timestamp.now();
      // Enable set for dev:live
      if (!doc.exists) {
        t.set(
          ref,
          { [start_key]: timestamp }
        )
      }
      else {
        t.update(
          ref,
          { [start_key]: timestamp },
          { lastUpdateTime: doc.updateTime }
        );
      }

      return {
        lastNonce: doc.get(lastNonce_key) as number|undefined,
        timestamp,
      }
    });
    if (r) {
      return r;
    }
    await sleep(1000 * i);
  }
  return false;
}

function exitCS(guard: Timestamp, lastNonce: number|undefined) {
  const db: FirestoreAdmin = getFirestore() as any;
  const doc = db.doc(cs_doc);
  if (lastNonce !== undefined) {
    return doc.set(
      {
        [complete_key]: guard,
        [lastNonce_key]: lastNonce,
      },
      { merge: true }
    )
  }
  else {
    return doc.set(
      {
        [complete_key]: guard,
      },
      { merge: true }
    )
  }
}
