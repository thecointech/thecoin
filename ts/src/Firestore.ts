
async function BuildFirestore() {
  // Verify that in production, we have connection credentials
  if (process.env.NODE_ENV == "production") {
    // We should either be running on GAE or have a service account
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.GAE_ENV) {
      throw new Error("Firestore Connect: No Service Account enabled");
    }
  } else {
    // If we are development environment, then we should not have release credentials
    if (!!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      throw new Error(
        "Firestore Connect: Credentials supplied in development environment"
      );
    }

    // Set default firestore path
    process.env['FIRESTORE_EMULATOR_HOST'] = '[::1]:8377';
    if (process.env.FIRESTORE_ENV)
    {
      const dotenv = await import('dotenv')
      dotenv.config({ path: process.env.FIRESTORE_ENV })
    }
    console.log(`\n!-- Connecting to Firestore Debug environment on ${process.env.FIRESTORE_EMULATOR_HOST} --!`);
  }

  // We delay importing until here, mostly in case it's not used,
  // but also so we don't automatically import google-gax which
  // is being a pain in the ass
  const { Firestore } = await import("@google-cloud/firestore");
  const settings: FirebaseFirestore.Settings = {
    projectId: "broker-cad" // project id is random for each run
  };
  return new Firestore(settings);
}

let __firestore: FirebaseFirestore.Firestore|null = null;
async function GetFirestore()
{
  return __firestore ? 
    __firestore : 
    __firestore = await BuildFirestore();
}

export { GetFirestore };
