
CURRENT_DEPLOY_PATH=$(cat current_deploy.txt)
echo "Deployed version path: $CURRENT_DEPLOY_PATH"

cd $CURRENT_DEPLOY_PATH/apps/tx-processor
yarn prod:test