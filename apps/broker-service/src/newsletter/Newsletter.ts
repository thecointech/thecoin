import { GetFirestore } from "@the-coin/utilities/Firestore";
import { SendTemplate, TemplateId } from "../exchange/AutoMailer";
import { SubscriptionDetails } from "@the-coin/types";
import { Timestamp } from "@google-cloud/firestore";

interface EmailSubscription extends SubscriptionDetails {
  registerDate: Timestamp,
}

const GetCollection = () => 
  GetFirestore().collection("newsletter");

const GetDoc = (id: string) =>
  GetCollection().doc(id);

export async function SubDoc(email: string)
{
  const normalized = email.toLowerCase();
  const collection = GetCollection();
  const snapshot = await collection
                          .where('email', '==', normalized)
                          .limit(1)
                          .get();
  return !snapshot.empty ? 
    collection.doc(snapshot.docs[0].id) : 
    collection.doc(); // new empty document
}

export async function numberOccurrencesEmail(email: string) {
  var numberOccurences = (await (await GetCollection().where("email", "==", email).get()).size);
  return numberOccurences;
}

export function validateEmail(email: string) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

export async function Signup(details: SubscriptionDetails, sendMail: boolean)
{
  const { email } = details;
  // Check it email is OK
  if (!validateEmail(String(email)))
  {
    console.log("Invalid email submitted: " + email);
    return false;
  } 
  if (details.email) {
    details.email = details.email.toLowerCase();

    //Check if email is already here
    var numberOcc = await numberOccurrencesEmail(details.email);
    if (numberOcc > 0){
      console.log("Email already subscribed: " + email );
      return false;
    }
  }

  const register: EmailSubscription = {
    ...details,
    registerDate: Timestamp.now()
  };

  const userDoc = await SubDoc(String(email));
  await userDoc.set(register, {merge: true});
  
  return sendMail  
    ? await SendTemplate(
      "newsletter@thecoin.io", 
      String(email), 
      TemplateId.WelcomeConfirm, 
      {
        confirmUrl: "https://thecoin.io/#/newsletter/confirm?id=" + encodeURI(userDoc.id)
      })
    : true;
  }

export async function Confirm(details: SubscriptionDetails) : Promise<SubscriptionDetails|null>
{
  if (!details.id)
    return null;

  const userDoc = GetDoc(details.id);
  const res = await userDoc.update(details);
  if (!res.writeTime)
    return null;
  
  const newDetails = await userDoc.get();
  return newDetails.data() as SubscriptionDetails;
}

export async function Unsubscribe(id: string)
{
  const userDoc = GetDoc(id);
  await userDoc.delete();
  return true;
}

export async function Details(id: string)
{
  const userDoc = GetDoc(id);
  return await userDoc.get();
}