The dev:live environment:

A full, live environment living entirely on localhost.

Does not (?) require env vars.  Runnable by any developer

ethereum emulator
 - DONE contract is automatically deployed
  - DONE Random account for TheCoin/BrokerCAD/Testing
  - DONE Random transfers to TestingAccount
 - DONE 10000 coin is minted and sent to client1

Rates-Service:
 - DONE Connects to Firestore emulators
 - DONE Seeds with random values for past year
 - DONE does not update (requires restart each day)

utilities:
 - GetContract loads from ganache
 - Replace GetWallet with GetSigner
 - Tests for all of the above
    - Can we test

Broker-CAD:
 - Connects to ethereum emulator for accounts (?)
 - processes transactions and submits to emulated ethers chain
 - locally-mocked (temp) storage for google drive.
