## Database structure for broker-cad (tccc)
### and probably anyone else.

The TCCC is running on Google Cloud using Firestore NoSQL DB as it's data store.

The DB should:
 - Be non-destructive (no new info should change existing info)
 - Be exhaustive (every state change should be tracked)
 - Be anonymous (no identifying data should be present in the DB)
 - Be reconstructible (to the degree possible) from primary sources.

## Events
Our DB exists to enable safe offline processing & error-and-recovery for client transactions, and to store minimal user data.  The transaction data is stored entirely in a sequence of events, recording each step of the transaction in a non-destructive manner.  Each event looks like:
```
[key] : {
  timestamp,
  type: string,
  data: any
}
```
#### Key
The key of each timestamp is the timestamp of when that action was created.  Only calculated on the client, this is not completely reliable and only intended to make human-viewing of online content a bit more comprehensible.

We ignore the best practices on this because the events are already shareded by their random ID, and no single transaction will ever incur 500 writes-per-second.

#### Timestamp
represents when the event is -for-, not when the event was written. Eg, a 'settled' event will have a timestamp for when the action settled, not when the event was created (and may be very different)

#### type
Defines what kind of event this is.  One of a pre-existing list of event types (eg 'initial', 'transfer', 'complete') etc.  This value defines what is held in `data`.

#### data
Stores what changes have occured due to this event.  For example, `transfer` may store a transaction hash, or `tofiat` stores the converted fiat value of the transfer at that time.

## Action ID's

Our ID's for buy/sell/bill are random.  Although it is tempting to rely on external
identifiers (eg - using txHash for Sale/uniqueId for purchases) we cannot do this because sales/bills do not have an appropriate identifier to use.  Any failed tx recovery would need to rely on searching the action list anyway, which negates teh primary benefit of determinstic ID's.  There is also no consistent identifier for e-transfers & direct deposits.  Given this lack of consistency, it is best to simply use a random ID, index the event data, then perform searches to ensure new data is assigned to the appropriate actions events.

## Our NoSQL schema notation
Firestore follows an Collection/Document structure, which is basically a map.
I can't find how to do UML in markup, so here goes:
In the docs below it looks like:
```
// A collection of name holds map of documents with key type DocumentID
[Collection Name]: Document ID type

// Leaf node is document data
Bullet points are leaf nodes:
 - LeafNode

// If a documents may be one of several choices
One-of groups are surrounded by brackets
{
  This
}
{
  OrThis
}
```
## Firestore Layout

```
 + [Referrers]: 6-char id
  - address: normalized ethereum address
  - signature: signed by TheCoin (proof this entry is valid)
 // A collection of incomplete actions
 // Used so we don't have to search the DB for things to do
 + [Sell]: randomId
  - ref: path eg /User/0x123.../Sell/random
 + [Buy]: randomId
  - ref: path eg /User/0x123.../Buy/random
 + [Bill]: randomId
  - ref: path eg /User/0x123.../Bill/random

 + [User]: eth address
    - created: DateTime
    - referrer: address
    + [Buy]: RandomID
        + [events]: created-timestamp
          - timestamp
          { // First entry in any deposit
            type: 'initial'
            data: {
              type: 'etransfer'|'deposit'|'other',
              sourceId: etransferId|deposit timestamp,
              amount: number,
            }
          }
          { // Settlement. Logged when deposit is converted.
            type: 'tocoin'
            data: number (Coin Value)
          }
          { // Added before beginning transfer of any kind
            // The next event _must_ be either successful or
            // failed transfer.  If not found, manual
            // resolution is required
            type: 'pretransfer'
            data: 'fiat'|'coin'
          }
          { // 'confirm' means valid deposit and we may disburse
            type: 'confirm'
            { data: deposit confirm }
            { error: error message }
          }
          { // Record of transfer attempt of TC to client
            type: 'transfer'
            { data: txHash }
            { error: error message }
          }
          { // If deposit fails for some reason, we may refund the fiat
            type: 'refund'
            { data: eTransfer comfirmation }
            { error: error message }
          }
          { // Add once no more actions can be taken
            type: 'completed'
            data?: notes
          }

    + [Sell]: RandomID
        + [events]: created-timestamp
          - timestamp
          { // First entry in any sale
            type: 'initial'
            data: InstructionPacket
          },
          { // Added before beginning transfer of any kind
            // The next event _must_ be either successful or
            // failed transfer.  If not found, manual
            // resolution is required
            type: 'pretransfer'
            data: 'fiat'|'coin'
          }
          { // Added once TC transferred to TCCC account
            type: 'confirm'
            { data: txHash }
            { error: error message }
          }
          { // Settlement date.  Conceptually no longer TC now
            type: 'tofiat'
            data: Fiat Value
          },
          { // Logged when e-Transfer attempted.
            type: 'transfer'
            { data: eTransfer confirmation }
            { error: error message }
          }
          { // Logged when reminder email forwarded onto client
            type: 'reminder'
            data: string (eTransfer email id)
          }
          { // Logged if eTransfer rejected
            type: 'rejected'
            data: string (eTransfer email id)
          }
          { // Logged if eTransfer expired.
            type: 'expired'
            data: string (eTransfer email id)
          }
          { // Logged if eTransfer accepted.
            type: 'accepted'
            data: string (eTransfer email id)
          }
          { // If expired/rejected, the fiat may be reclaimed.
            type: 'reclaimed'
            { data: eTransfer confirmation }
            { error: error message }
          }
          { // Convert back to TC for refund
            type: 'tocoin'
            data: Coin Value
          },
          { // If fiat reclaimed, TC may be returned to clients TC account
            type: 'refund'
            { data: txHash }
            { error: error message }
          }
          { // Add once no more actions can be taken
            type: 'completed'
            data?: notes
          }


    + [Bill]: RandomID
        + [events]: typestamp
          - timestamp
          { // First entry records user request
            type: 'initial'
            data: InstructionPacket
          },
          { // Added before beginning transfer of any kind
            // The next event _must_ be either successful or
            // failed transfer.  If not found, manual
            // resolution is required
            type: 'pretransfer'
            data: 'fiat'|'coin'
          }
          { // Added once TC transferred to TCCC account
            type: 'confirm'
            { data: txHash }
            { error: error message }
          }
          { // Settlement date.  Conversion to Fiat
            type: 'tofiat'
            data: number (Fiat Value)
          },
          { // Logged bill payment occurs
            type: 'transfer'
            { data: eTransfer confirmation }
            { error: error message }
          }
          { // If too many bill payment failures, we revert to TC and refund
            type: 'tocoin'
            data: number (Coin Value)
          },
          {
            type: 'refund'
            { data: txHash }
            { error: error message }
          }
          { // Add once no more actions can be taken
            type: 'completed'
            data?: notes
          }
```


## Refactoring efforts

Currently, we do not have a consolidated place for Firestore access.  We will
refactor the current system to move all firestore operations into a single place.

Refactor into:
 firestore => Firestore init and normalization across projects
 broker-db => DB translation: wraps all access to firestore to ensure consistency.

Current areas:
 utils:
  + firestore init => firestore package (done)
  + users => broker-db (done)
  + referrals => broker-db (done)
      used by admin & broker-cad.  Means broker-db will incorporate generating referral code.  Not ideal, but not the biggest deal
 tx-processing:
  + FetchUnsettledRecords => broker-db
      used by tx-processing/admin.  Needs refactoring to separate AddSettlementDate
 tx-firestore:
  + fetchAllUsers => broker-db

 broker-cad:
  + newsletter => broker-db (just for consistencies sake)

Once complete, we will need to implement DB spec above in broker-db

Update all clients.  No client should directly call `set` after this.
 admin:
  + Purchase
  + Sell
  + Refund.
  Ideally - admin would not actually directly use broker-db, and would instead route through tx-processing.
 broker-service
  + CertifiedActionProcess
 tx-processing:
 + MarkComplete
 + storeInDb => storeEvent
 + inProgress (?) how does this fit in?

Finally: Port data from the old spec to the new one.
