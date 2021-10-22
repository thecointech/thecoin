$ENV:RESOURCE_ID='...'

az container export -g $ENV:RESOURCE_ID --name ipfs-daemon --file ipfs-daemon.yaml
az container create -g $ENV:RESOURCE_ID -f ./ipfs-daemon.yaml

az container export -g $ENV:RESOURCE_ID --name js-ceramic --file js-ceramic.yaml
az container create -g $ENV:RESOURCE_ID -f ./js-ceramic.yaml
