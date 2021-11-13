## Ceramic

We use ceramic as a way to store users information off our servers.

Ceramic uses IPFS and the users on private key to store the users data, freeing us from responsibility and risk.

## Setup

Our Ceramic setup is currently running two nodes hosted on azure.

`ceramic-tccc` is an App Service with a Docker container.  It runs on a virtual network to ensure it has a static IP address.  It was deployed manually (via Azure Portal).  The docker CLI appears to have issues with passing command line arguments (azure CLI was not tested).
`ipfs-daemon` is an ACI, which is essentially a lighter version of App Service.  This was deployed via azure CLI.  It probably should be upgraded to a full AppService, rather than an ACI to ensure it's always running.

All data is persisted on a locally-redundant store called `ceramic-store` - this has 3 file shares for ipfs data, ceramic data, and ceramic logs.

The virtual network was setup to ensure our outbound IP address was deterministic.

## Costs

Our nodes are way over-powered for what they need to do, but our Azure Grant covers the costs (if only barely).

## Rambling.

I wouldn't use the docker CLI to deploy this system again.  I might as well have used the azure script (unfamiliarity with docker is to blame there).  It would have been nice to document our setup in code, mais c'est la vie.  Our current setup isn't repeatable because I had to use the GUI to figure out all the stuff that needed to happen, but it would be trivial to create a ps script to do this now I know what is up.


## In Case of Emergency

To break the glass:
```ps
$ENV:RESOURCE_ID='...'

az container export -g $ENV:RESOURCE_ID --name ipfs-daemon --file ipfs-daemon.yaml
az container create -g $ENV:RESOURCE_ID -f ./ipfs-daemon.yaml

// NOTE: This is for containers, we use app services now, not sure what the equivalent is
az container export -g $ENV:RESOURCE_ID --name js-ceramic --file js-ceramic.yaml
az container create -g $ENV:RESOURCE_ID -f ./js-ceramic.yaml
```
