
SCRIPT_DIR="$(dirname "$0")"
CURRENT_DEPLOY_PATH=$(cat "$SCRIPT_DIR/current_deploy.txt")
echo "Running processor on $(date) for version: $CURRENT_DEPLOY_PATH"

cd $CURRENT_DEPLOY_PATH/apps/tx-processor
yarn prod:test