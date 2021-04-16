
Environments:

 - dev - local machine env
    *env: NODE_ENV=development, SETTINGS: undefined*
    THIS IS THE DEFAULT ENVIRONMENT
    Each project is self-contained, with all external calls mocked.
    Most, if not all, development should be done in this mode.
    * no data persistance
    * mocked inter-service calls
    * mocked ethereum connection
    * Site includes unlocked account
    * Deployment: No deployment step
 - dev:live - local machine env
    *env: NODE_ENV=development, SETTINGS: live*
    All projects assumed to be live and running on localhost.  Requires
    firestore emulator, ethereum emulator, ceramic daemon running.
    Systems tests take place in this mode, as well as stress-testing etc.
    * semi-permanent data persistence
    * inter-service calls, no mocking
    * emulated ethereum connection
    * Deployment: Base level yarn script to start all dependencies
 - prod:test
    *env: NODE_ENV=production, SETTINGS: testing*
    System-wide deployment to sandbox projects in GAE.
    Testnet deployment for contract.  All projects are
    automatically updated on successful merge to dev.  Read/write access
    for all devs.
    * permanent data persistence
    * sandbox accounts for TheCoin/BrokerCAD etc etc.
    * code identical to production
    * testnet (ropsten) ethereum connection, live IDX/rates etc
    * Deployment: merge to 'dev'
    * (?) periodically new contract, with data duplicated from back live contract
 - prod:next
    *env: NODE_ENV=production, SETTINGS: release*
    System-wide deployment to projects in GAE.  Automatically
    deployed on merge to 'main'.  Live data with live $$$.
    Used to do final sanity check before enabling live traffic.
    Identical code to what runs live.  Restricted(?s) access.
    * full data persistence
    * live system, identical to prod
    * production accounts
    * mainnet ethereum connection (TODO: gas prices are prohibitive.  We will remain on ropsten until EthV2)
    * public, but not default traffic.
    * Deployment: merge to 'release'
 - prod
    *env: NODE_ENV=production, SETTINGS: release*
    Once prod:staging has been tested & verified, we update default version
    on GAE to direct public traffic to this version.  No actual deployment happens
    Reverting an update happens by moving live version back one step.
    * Deployment: yarn script to update all versions to latest.

How it works:

- dev vs dev:live

All external calls run through mockable classes

- dev:live vs testing vs prod*

We use a set of environment files to set endpoints appropriately.  The correct .env file can be
chosing using the --appyaml tag on GAE deploy.

Secret keys should be stored in secret manager
https://cloud.google.com/secret-manager/docs,
how do we access in dev:live (we don't)

We will need different accounts across different projects (eg, not use the same
wallet for testing & release).

What do we need to do;

All service calls are made through mock-able API's.
 - ethereum calls in ethers
 - all internal API calls
