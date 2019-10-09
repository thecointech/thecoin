import { GetFirestore } from "@the-coin/utilities/lib/Firestore";
import { SendTemplate, TemplateId } from "../exchange/AutoMailer";
import { firestore } from "firebase-admin";
import { BrokerCAD } from "@the-coin/types";

interface EmailSubscription extends BrokerCAD.SubscriptionDetails {
  registerDate: firestore.Timestamp,
}

function SubDoc(email: string)
{
  const fs = GetFirestore();
  return fs.collection("newsletter").doc(email.toLowerCase());
}

export async function Signup(details: BrokerCAD.SubscriptionDetails)
{
  const { email } = details;
  if (email.indexOf("@") < 0)
  {
    console.log("Invalid email submitted: " + email)
    return;
  }

  const register: EmailSubscription = {
    ...details,
    registerDate: firestore.Timestamp.now()
  };

  const userDoc = SubDoc(email);
  await userDoc.set(register, {merge: true});
  
  return await SendTemplate(
    "newsletter@thecoin.io", 
    email, 
    TemplateId.WelcomeConfirm, 
    {
      confirmUrl: "https://thecoin.io/newsletter/confirm?email=" + encodeURI(email)
    });
}

export async function Confirm(details: BrokerCAD.SubscriptionDetails)
{
  const userDoc = SubDoc(details.email);
  var res = await userDoc.update(details);
  return res.writeTime.seconds > 0;
}

export async function Unsubscribe(email: string)
{
  const userDoc = SubDoc(email);
  var res = await userDoc.delete();
  return true;
}