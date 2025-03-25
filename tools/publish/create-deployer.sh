#!/bin/zsh

config_name=$1
project_name=$([[ -n "$2" ]] && echo "$2" || echo "$1")
machine_name=$(hostname)
machine_name="${machine_name//[[:space:].]/-}"
agent_name="publish-agent-$machine_name"

if [[ ${#agent_name} -gt 30 ]]; then
    agent_name="${agent_name:0:30}"
fi
echo $agent_name

is_site=false
if [[ $config_name =~ "tccc-" ]]; then
   is_site=true
fi
echo $is_site

echo "Creating publishing agent for $config_name - $project_name with is_site: $is_site"
printf "%s " "Press enter to continue"
read ans


gcloud iam service-accounts create "$agent_name" \
    --project=$project_name \
    --description="Publishes new versions on $machine_name" \
    --display-name="Offsite Publish Agent"

retVal=$?
if [ $retVal -ne 0 ]; then
    echo "Some Error Happend"
    exit 1
fi
echo "Service Account Created"

service_account="$agent_name@$project_name.iam.gserviceaccount.com"
iam_member="serviceAccount:$service_account"

# Function to assign a role with retry logic
assign_role_with_retry() {
  local role="$1"
  local retries=5
  local delay=2

  while [[ $retries -gt 0 ]]; do
    if gcloud iam service-accounts list --project="$project_name" --filter="email=$service_account" > /dev/null; then
      echo "Service account found. Assigning role: $role"
      gcloud projects add-iam-policy-binding "$project_name" \
        --member=$iam_member \
        --role="$role"
      return 0 # Success
    else
      echo "Service account not found yet. Retrying in $delay seconds..."
      sleep $delay
      retries=$((retries - 1))
    fi
  done

  echo "Failed to find service account after multiple retries for role: $role"
  return 1 # Failure
}

# Assign roles using the retry function
if ! assign_role_with_retry "roles/appengine.deployer"; then
  exit 1
fi
if ! assign_role_with_retry "roles/appengine.serviceAdmin"; then
  exit 1
fi
if ! assign_role_with_retry "roles/appengine.objectAdmin"; then
  exit 1
fi
if ! assign_role_with_retry "roles/cloudbuild.builds.editor"; then
  exit 1
fi

# gcloud projects add-iam-policy-binding $project_name \
#     --member=$iam_member \
#     --role="roles/appengine.deployer"

# gcloud projects add-iam-policy-binding $project_name \
#     --member $iam_member \
#     --role "roles/appengine.serviceAdmin"

# gcloud projects add-iam-policy-binding $project_name \
#     --member $iam_member \
#     --role "roles/storage.objectAdmin"

# gcloud projects add-iam-policy-binding $project_name \
#     --member $iam_member \
#     --role "roles/cloudbuild.builds.editor"

gcloud iam service-accounts add-iam-policy-binding \
    $project_name@appspot.gserviceaccount.com \
    --member=$iam_member \
    --role=roles/iam.serviceAccountUser \
    --project=$project_name

if [ $is_site ]; then
    echo " ---- Adding hosting ----\n\n"
    if ! assign_role_with_retry "roles/firebasehosting.admin"; then
        exit 1
    fi
    if ! assign_role_with_retry "roles/firebase.viewer"; then
        exit 1
    fi
    # gcloud projects add-iam-policy-binding $project_name \
    #     --member $iam_member \
    #     --role "roles/firebasehosting.admin"

    # gcloud projects add-iam-policy-binding $project_name \
    #     --member $iam_member \
    #     --role "roles/firebase.viewer"
fi

echo "\n --- Roles Assigned ---\n"

# generate key file
key_file="./service-accounts/$project_name.json"
gcloud iam service-accounts keys create $key_file \
    --project=$project_name \
    --iam-account="$service_account"

# create publishing config
gcloud config configurations create $config_name
gcloud config configurations activate $config_name

# activate new service account
gcloud auth activate-service-account --key-file=$key_file
gcloud config set account $service_account
gcloud config set project $project_name

# reset default
gcloud config configurations activate default
