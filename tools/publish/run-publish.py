#!/usr/bin/env python3

from pathlib import Path
import sys
import os
import shutil
import stat
import time
import logging

config_name = "prodtest"
os.environ["CONFIG_NAME"] = config_name

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)
file_log_handler = logging.FileHandler('deploy.log')
logger.addHandler(file_log_handler)
stderr_log_handler = logging.StreamHandler()
logger.addHandler(stderr_log_handler)

# nice output format
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s', '%Y-%m-%d %H:%M:%S')
file_log_handler.setFormatter(formatter)
stderr_log_handler.setFormatter(formatter)

logger.info('Beginning publish of %s', config_name)

curr_path = Path(__file__).resolve()
base = curr_path.parent

# Check our path matches deployment
if (config_name != base.name):
    logger.error("Mismatched config: " + config_name + " != " + base.name)
    exit(1)

deploy = base / 'current'
old_deploy = base / 'old'
new_deploy = base / 'new'
temp_deploy = base / 'temp'

if not os.environ.get('THECOIN_ENVIRONMENTS'):
    home = Path.home()
    tc_env = home / 'thecoin' / 'env'
    logger.info(f"Setting default evironment location: {tc_env}")
    os.putenv('THECOIN_ENVIRONMENTS', tc_env)

#
# Check out new deploy and merge in latest dev
def checkout():
  logger.info(f"Deploying to {new_deploy}")

  # check no existing checkout
  if new_deploy.exists():
      logger.error("warning: existing installation found")
      shutil.rmtree(new_deploy, onerror=remove_readonly)
      input("Press Enter to continue...")
      #exit(1)
  else:
    # First, create a new checkout,
    new_deploy.mkdir(parents=True, exist_ok=True)
    os.chdir(new_deploy)
    os.system('git clone https://github.com/thecointech/thecoin.git .') # Cloning

    # switch to publish/Test
    os.system(f'git checkout publish/{config_name}')

    # Merge in latest changes
    success = os.system('git merge origin/dev --no-ff --no-edit')
    if success != 0:
        logger.error("Merge Failed")
        exit(1)

    logger.info("Checkout Complete")
  return True

#
# Build And Deploy
def buildAndDeploy():
  os.chdir(new_deploy)
  # Try to run a publish
  success = os.system('yarn');
  if success != 0: raise RuntimeError("Couldn't install")

  success = os.system('yarn build')
  if success != 0: raise RuntimeError("Couldn't build")

  # First, deploy the libraries
  success = os.system('yarn _deploy:lib --force-publish')
  if success != 0: raise RuntimeError("Couldn't deploy libraries")

  # Rebuild apps so we get the right versions
  for attempt in range(3):
    logger.info(f"Rebuilding Apps attempt: {attempt}")
    success = os.system('yarn _deploy:app:rebuild')
    if success == 0: break
  if success != 0: raise RuntimeError("Couldn't re-build")

  # deploy online services
  success = os.system('yarn _deploy:app:gcloud')
  if success != 0: raise RuntimeError("Error deploying to gcloud")

  logger.info(f"Deploy Success: {success}")
  return True

# Remove read-only access error
def remove_readonly(func, path, excinfo):
    os.chmod(path, stat.S_IWRITE)
    func(path)

def keep_trying(action):
  for attempt in range(10):
    try:
      action()
      return True
    except PermissionError as error:
      logger.error(error)
      time.sleep(attempt * 2 * 60)
  logger.error("Could not complete action")
  exit(1)

#
#  Replace current with new, and remove old
def renameAndComplete():
  # Try to run a publish
  def remove_old():
    if Path(old_deploy).exists():
        logger.info("delete old deploy");
        shutil.rmtree(old_deploy, onerror=remove_readonly)

  def move_current():
    if Path(deploy).exists():
      logger.info("move current to old");
      os.rename(deploy, old_deploy)

  def move_new():
    logger.info("move new to current")
    os.rename(new_deploy, deploy)
    # Re-run yarn so windows updates the soft-links
    os.chdir(deploy)
    os.system('yarn');

  os.chdir(base)
  keep_trying(remove_old)
  keep_trying(move_current)
  keep_trying(move_new)

#
# On complete, create temp checkout to  merge
# the newly published branch back into dev
def mergeBackIntoDev():
    # check no existing checkout
  if temp_deploy.exists():
      logger.error("Cannot merge back into dev: temp folder already exists")
      return

  # First, create a new checkout in dev
  temp_deploy.mkdir(parents=True, exist_ok=True)
  os.chdir(temp_deploy)
  os.system('git clone https://github.com/thecointech/thecoin.git .') # Cloning

  # Merge in publishing changes
  success = os.system(f'git merge origin/publish/{config_name} --no-ff --no-edit')
  if success != 0:
    logger.error("Merge Failed")
    exit(1)
    
  # push changes back
  os.system('git push')
  # cleanup
  os.chdir(base)
  shutil.rmtree(temp_deploy, onerror=remove_readonly)

try:
  logger.info("Ready...")
  checkout()
  buildAndDeploy()
  renameAndComplete()
  # do this last, as it isn't particularily important if it fails
  mergeBackIntoDev()

except BaseException as e:
  logger.exception("Deploy Failed")
  sys.exit(1)

logger.info('COMPLETE')
