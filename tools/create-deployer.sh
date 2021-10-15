config_name="tc-nft-testing"
project_name="tc-nft-testing"

is_site=1

gcloud iam service-accounts create "publish-agent" \
    --project=$project_name \
    --description="Publishes new versions" \
    --display-name="Publish Agent"

retVal=$?
if [ $retVal -ne 0 ]; then
    echo "Some Error Happend"
    exit 1
fi
echo "Service Account Created"

iam_member="serviceAccount:publish-agent@$project_name.iam.gserviceaccount.com"
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

# generate key file
key_file="./service-accounts/testing/$project_name.json"
gcloud iam service-accounts keys create $key_file \
    --project=$project_name \
    --iam-account="publish-agent@$project_name.iam.gserviceaccount.com"

# create publishing config
gcloud config configurations create $config_name
gcloud config configurations activate $config_name

# activate new service account
gcloud auth activate-service-account --key-file=$key_file
gcloud config set account publish-agent@$project_name.iam.gserviceaccount.com
gcloud config set project $project_name

# reset default
gcloud config configurations activate default
