echo "Restart IDX script at $(Get-Date)"
$cg = Get-AzContainerGroup -ResourceGroupName idx-resources -Name ipfs-daemon
echo "Begin Action"
try {
  Invoke-AzResourceAction -ResourceId $cg.Id -Action restart -Force
  if (!$?) {
    throw "Restart call failed"
  }
}
catch {
  echo "Retrying with start command"
  Invoke-AzResourceAction -ResourceId $cg.Id -Action start -Force
  if (!$?) {
    throw "Unknown error happened, give up and go home..."
  }
}

echo "Done"
