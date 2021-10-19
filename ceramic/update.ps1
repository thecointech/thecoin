az container export -g <ResourceGroupHere> --name ipfs-daemon --file ipfs-daemon.yaml
az container create -g <ResourceGroupHere> -f ./ipfs-daemon.yaml
