import { FirestoreAdmin, Timestamp, getFirestore } from '@thecointech/firestore';
import { log } from '@thecointech/logging';
import { AbstractSigner, BytesLike, Provider, Signer, TransactionRequest, TransactionResponse, TypedDataDomain, TypedDataField } from 'ethers';
import { DateTime } from 'luxon';
import { sleep } from '@thecointech/async';

export class ManagedNonceSigner extends AbstractSigner {

  private baseSigner: Signer;
  // _isSigner: boolean;

  constructor(signer: Signer) {
    super(signer.provider);
    this.baseSigner = signer;
  }

  // Required overrides
  override getAddress(): Promise<string> {
    return this.baseSigner.getAddress();
  }
  override signMessage(message: BytesLike): Promise<string> {
    return this.baseSigner.signMessage(message);
  }

  override signTypedData(domain: TypedDataDomain, types: Record<string, TypedDataField[]>, value: Record<string, any>): Promise<string> {
    return this.baseSigner.signTypedData(domain, types, value);
  }
  override signTransaction(transaction: TransactionRequest): Promise<string> {
    return this.baseSigner.signTransaction(transaction);
  }
  override connect(provider: Provider): Signer {
    return new ManagedNonceSigner(this.baseSigner.connect(provider));
  }

  // Optional overrides

  override async sendTransaction(transaction: TransactionRequest): Promise<TransactionResponse> {
    if (transaction.nonce == undefined) {
      // Because there are multiple versions of this service running, we
      // need to lock the nonce while in-use and ensure it is always up-to-date
      const address = await this.baseSigner.getAddress();
      return guardFn<TransactionResponse>(address, async (lastNonce) => {
        if (lastNonce !== undefined) {
          transaction = {
            ...transaction
          }
          const pendingNonce = await this.baseSigner.getNonce();
          // Warn if it seems like the nonce is too far in the future
          if (lastNonce && (pendingNonce + 10) < lastNonce) {
            log.error({ pendingNonce, lastNonce }, "LastNonce {lastNonce} is too far ahead of signers nonce {pendingNonce}");
          }
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

export async function guardFn<T extends { nonce?: number }>(address: string, fn: (lastNonce: number|undefined) => Promise<T>): Promise<T> {
  const guard = await enterCS(address);

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
    await exitCS(address, guard.timestamp, usedNonce);
  }
}

const cs_doc = (address: string) => `SystemNonces/${address}`;
const start_key = "started";
const complete_key = "complete";
const lastNonce_key = "lastNonce";
async function enterCS(address: string) {
  const db = getFirestore() as FirestoreAdmin;
  const ref = db.doc(cs_doc(address));
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
        lastNonce: doc.data()?.[lastNonce_key] as number|undefined,
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

function exitCS(address: string, guard: Timestamp, lastNonce: number|undefined) {
  const db: FirestoreAdmin = getFirestore() as any;
  const doc = db.doc(cs_doc(address));
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
