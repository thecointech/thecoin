# The sequence of commands used to deploy ceramic to azure.

if ($null -eq $Env:INFURA_PROJECT_ID) {
  echo "Missing Infura ID"
  exit 1
}

# Interactive login to azure account
docker login azure

# # Create the azure Container Instances
# docker context create aci ceramic-node
docker context use ceramic-node

# In Azure, create a storage account and mount volume for persistent IPFS data.
docker volume create ipfs-data --storage-account ceramicstore

docker run `
  -d `
  -p 4011:4011 `
  -p 5011:5011 `
  -v ceramicstore/ipfs-data:ipfs-data `
  -e CERAMIC_NETWORK=ELP `
  -e IPFS_PATH="/ipfs-data" `
  --name ipfs-daemon ceramicnetwork/ipfs-daemon:latest

# Get the IP address of the above
$jsonString = docker inspect ipfs-daemon
$jsonObj = $jsonString | ConvertFrom-Json
$ipAddress = $jsonObj.Ports[0].HostIP
echo "IP address: " $ipAddress

# In Azure, create a volumes for state data & logs (could we merge these?)
docker volume create state-data --storage-account ceramicstore
docker volume create state-logs --storage-account ceramicstore

# run docker file with configuration.
docker run -d `
  -p 7007:7007 `
  -v ceramicstore/state-data:/root/.ceramic `
  -v ceramicstore/state-logs:/root/.ceramic/logs `
  --name js-ceramic `
  ceramicnetwork/js-ceramic:latest
  # NOTE: Passing config by argument here doesn't appear to have issues (in windows?),
  # so we are using json file instead
  # --network ELP `
  # --ethereum-rpc https://mainnet.infura.io/v3/$Env:INFURA_PROJECT_ID% `
  # --log-to-files `
  # --ipfs-api http://$ipAddress:5011 `


