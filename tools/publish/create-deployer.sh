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
is_site=0

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

iam_member="serviceAccount:$agent_name@$project_name.iam.gserviceaccount.com"
gcloud projects add-iam-policy-binding $project_name \
    --member=$iam_member \
    --role="roles/appengine.deployer"

gcloud projects add-iam-policy-binding $project_name \
    --member $iam_member \
    --role "roles/appengine.serviceAdmin"

gcloud projects add-iam-policy-binding $project_name \
    --member $iam_member \
    --role "roles/storage.objectAdmin"

gcloud projects add-iam-policy-binding $project_name \
    --member $iam_member \
    --role "roles/cloudbuild.builds.editor"

if [ $is_site -ne 0 ]; then
    echo "Adding hosting"
    gcloud projects add-iam-policy-binding $project_name \
        --member $iam_member \
        --role "roles/firebasehosting.admin"
fi

gcloud iam service-accounts add-iam-policy-binding \
    $project_name@appspot.gserviceaccount.com \
    --member=$iam_member \
    --role=roles/iam.serviceAccountUser \
    --project=$project_name

echo "\n --- Roles Assign ---\n"

# generate key file
key_file="./service-accounts/$project_name.json"
gcloud iam service-accounts keys create $key_file \
    --project=$project_name \
    --iam-account="$agent_name@$project_name.iam.gserviceaccount.com"

# create publishing config
gcloud config configurations create $config_name
gcloud config configurations activate $config_name

# activate new service account
gcloud auth activate-service-account --key-file=$key_file
gcloud config set account $agent_name@$project_name.iam.gserviceaccount.com
gcloud config set project $project_name

# reset default
gcloud config configurations activate default
