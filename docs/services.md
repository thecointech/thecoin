A variety of services:

### tx-processor
Completes transactions

Runs within a docker container on a schedule.  Docker service is executed directly, althouth the ./run-processor.sh script can be used to trigger manual runs

the docker-compose file can either bind to a folder or use a volume for it's data.  However, this is a writeable volume, so permissions need to be set on the host OS to allow the container to write to it.  This can be achieved either manually or using a pre-start docker script.  (TODO: The example docker-compose file shows how to do this.)

TO CONSIDER: Migrate to volumes, no bind mounts: for consistency

Use systemctl to trigger runs on linux.
Use launchd to trigger runs on macos.

