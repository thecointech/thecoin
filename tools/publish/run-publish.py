#!/usr/bin/env python3

from pathlib import Path
import sys
import os
import shutil
import stat
import time
import logging
from datetime import datetime, timedelta

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

date_format = "%Y-%m-%d_%H-%M"
now = datetime.now()
date_str = now.strftime(date_format)

new_deploy = base / date_str
temp_deploy = base / 'temp'
current_deploy_link = base / "current_deploy.txt"
keep_count = 2 # Keep the 2 most recent deployments (not including todays)

logger.info("Creating new version at: " + str(new_deploy))

env_path = os.environ.get('THECOIN_ENVIRONMENTS')
if not env_path or not Path(env_path).exists():
    logger.error(f"Cannot deploy, environment \"{env_path}\" does not exist")
    exit(1)

#
# Check out new deploy and merge in latest dev
def checkout():
  logger.info(f"Deploying to {new_deploy}")

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

#
# Update bookmark so subsequent runs use latest deployment
def updateCurrentPath():
  # Create the Zsh script
  with open(current_deploy_link, "w") as f:
      f.write(f"{new_deploy}\n")

  # Make the script executable
  # os.chmod(current_deploy_link, 0o755)  # Equivalent to chmod +x

  print(f"Deployed version path written to {current_deploy_link}")

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
#  Remove older deployments, leaving keep_count most recent
def removeOld():

  subfolders = [folder for folder in base.iterdir() if folder.is_dir()]

  # Filter subfolders based on time format and extract datetime
  one_day_ago = now - timedelta(days=1)
  filtered_subfolders = []
  for folder in subfolders:
      try:
          folder_datetime = datetime.strptime(folder.name, date_format)
          if folder_datetime < one_day_ago:
            filtered_subfolders.append((folder, folder_datetime))
      except ValueError:
          # Skip folders that don't match the time format
          pass

  # Sort subfolders by datetime, most recent first
  filtered_subfolders.sort(key=lambda x: x[1], reverse=True)

  if len(filtered_subfolders) <= keep_count:
    logger.info(f"There are {len(filtered_subfolders)} valid subfolders older than 1 day, which is less than or equal to the keep_count ({keep_count}). Nothing to delete.")
    return

  # Delete older subfolders
  for folder, folder_datetime in filtered_subfolders[keep_count:]:
      try:
        logger.info("delete old deploy: " + str(path));
        shutil.rmtree(str(ofolder), onerror=remove_readonly)
        print(f"Deleted folder: {folder}")
      except Exception as e:
        print(f"Error deleting folder {folder}: {e}")

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
  updateCurrentPath()
  removeOld()
  # do this last, as it isn't particularily important if it fails
  mergeBackIntoDev()

except BaseException as e:
  logger.exception("Deploy Failed")
  sys.exit(1)

logger.info('COMPLETE')
