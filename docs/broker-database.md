## Database structure for broker-cad (tccc)
### and probably anyone else.

The TCCC is running on Google Cloud using Firestore NoSQL DB as it's data store.

The DB should:
 - Be non-destructive (no new info should change existing info)
 - Be exhaustive (every state change should be tracked)
 - Be anonymous (no identifying data should be present in the DB)
 - Be reconstructible (to the degree possible) from primary sources.

Our ID's for buy/sell/bill are random.  Although it is tempting to rely on external
identifiers (eg - using txHash for Sale/uniqueId for purchases) we cannot do this because sales/bills do not have an appropriate identifier to use.  Any failed tx recovery would need to rely on searching the action list anyway, which negates teh primary benefit of determinstic ID's.  There is also no consistent identifier for e-transfers & direct deposits.  Given this lack of consistency, it is best to simply use a random ID, index the event data, then perform searches to ensure new data is assigned to the appropriate actions events.

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
Layout:
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
          // Timestamp represents when the event is -for-, not when it happened.
          // Eg, a 'settled' event will have a timestamp for when the action
          // settled, not when the event was created (and may be very different)
          - timestamp
          { // First entry in any deposit, how much is deposited & how
            type: 'etransfer'|'deposit'|'other'
            data: number (Fiat Value)
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


    + [Bill]: signature[40]
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
