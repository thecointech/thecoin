#!/usr/bin/env python3

from pathlib import Path
import sys
import os
import shutil

home = Path.home()
base = home / 'thecoin' / 'deploy'
deploy = base / 'current'
old_deploy = base / 'old'
new_deploy = base / 'new'

if not os.environ.get('THECOIN_ENVIRONMENTS'):
    tc_env = home / 'thecoin' / 'env'
    print(f"Setting default evironment location: {tc_env}")
    os.putenv('THECOIN_ENVIRONMENTS', tc_env)

print(f"Deploying to {new_deploy}")

# check no existing checkout
if new_deploy.exists():
    print("Cannot deploy: existing installation found")
    exit(1)

# First, create a new checkout,
new_deploy.mkdir(parents=True, exist_ok=True)
os.chdir(new_deploy)
os.system('git clone https://github.com/thecointech/thecoin.git .') # Cloning

# switch to publish/Test
os.system('git checkout publish/prod')

# Merge in latest changes
success = os.system('git merge origin/dev --no-ff')
if success != 0:
    print("Merge Failed")
    exit(1)

# Try to run a publish
os.environ["CONFIG_NAME"] = "prodtest"
success = os.system('yarn');
if success != 0: throw Exception("Couldn't install")

success = os.system('yarn build')
if success != 0: throw Exception("Couldn't build")

# First, deploy the libraries
success = os.system('yarn _deploy:lib')
if success != 0: throw Exception("Couldn't deploy libraries")

# Rebuild apps so we get the right versions
success = os.system('yarn _deploy:app:rebuild')
if success != 0: throw Exception("Couldn't re-build")

# deploy online services
success = os.system('yarn _deploy:app:gcloud')
if success != 0: throw Exception("Error deploying to gcloud")

# Try to run a publish
print(f"Deploy Success: {success}")
if success == 0:
    if Path(old_deploy).exists():
        print("delete old deploy");
        shutil.rmtree(old_deploy)

    if Path(deploy).exists():
        print("move current to old");
        os.rename(deploy, old_deploy)

    print("move new to current")
    os.rename(new_deploy, deploy)

    print('COMPLETE')
else:
    print('DEPLOY FAILED')
