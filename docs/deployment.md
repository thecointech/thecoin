

TheCoin is (currently) a series of micro-services connected together.

Internal Services:

 - rates-service: Simple service to periodically update exchange rates.
 - broker-cad: Backend server to store & process buy/sell orders.
 - site-landing: Static landing website
 - site-app: Static App website.  Connects to broker-cad.
 - site-wallet: Static website runs wallet code. Runs site-app in a sandboxed iframe.
 - admin:

External Services:
 - Ethereum network

Environments:

 - dev - local machine env
    Each project is self-contained, with all external calls mocked.
    All development should be done in this mode.
    * no data persistance
    * mocked inter-service calls
    * mocked ethereum connection
    * Site includes unlocked account
 - dev:live - local machine env
    All projects assumed to be live and running on localhost.  Requires
    firestore emulator, ethereum emulator, ceramic daemon running.
    Systems tests take place in this mode, as well as stress-testing etc.
    * semi-permanent data persistence
    * live inter-service calls
    * emulated ethereum connection
 - testing
    System-wide deployment to sandbox projects in GAE.  All projects are
    automatically updated on successful merge to dev.  Read/write access
    for all devs.
    * permanent data persistence
    * live inter-service calls
    * testnet ethereum connection
 - prod:staging
    System-wide deployment to projects in GAE.  Automatically
    deployed on merge to 'main'.  Live data with live $$$.
    Used to do final sanity check before enabling live traffic.
    Restricted access.
    * full data persistence
    * live system
    * mainnet ethereum connection
    * no live traffic.
 - prod
    Once prod:staging has been tested & verified, we update default version
    on GAE to direct public traffic to this version.  No actual deployment happens
    Reverting an update happens by moving live version back one step.

How it works:

- dev vs dev:live

All external calls run through mockable classes

- dev:live vs testing vs prod*

We use a set of environment files to set endpoints appropriately.  The correct .env file can be
chosing using the --appyaml tag on GAE deploy.

Secret keys should be stored in secret manager
https://cloud.google.com/secret-manager/docs,
how do we access in dev:live?

We will need different accounts across different projects (eg, not use the same
wallet for testing & release).

What do we need to do;

All service calls are made through mock-able API's.
 - ethereum calls in ethers
 - all internal API calls
