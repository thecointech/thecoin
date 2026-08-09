A variety of services:

### tx-processor
Completes transactions

Runs within a docker container on a schedule.  Docker service is executed directly, althouth the ./run-processor.sh script can be used to trigger manual runs

the docker-compose file can either bind to a folder or use a volume for it's data.  However, this is a writeable volume, so permissions need to be set on the host OS to allow the container to write to it.  This can be achieved either manually or using a pre-start docker script.  Prod currently uses a bind, prodtest uses a volume.

TO CONSIDER: Migrate to volumes, no bind mounts: for consistency.  (I think I used bind to allow easier access to the log data for debugging)

Use systemctl to trigger runs on linux.
Use launchd to trigger runs on macos.

prodtest: currently running every 4 hours using launchd -> docker compose up
 - see tx-processor/docker/com.thecoin.txprocessor.plist
prod: currently running every 1 hours using systemd -> docker compose up
 - see tx-processor/docker/txprocessor.service & timer

 ### Logging
 ### rates-service
 ### broker-service
