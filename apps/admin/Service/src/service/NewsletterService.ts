import { Signup, Confirm, Unsubscribe, Details } from '../Newsletter'
import { BrokerCAD } from '@the-coin/types';
/**
 * Confirm email subscription.
 *
 * details SubscriptionDetails 
 * returns BoolResponse
 **/
export async function newsletterConfirm(details: BrokerCAD.SubscriptionDetails) : Promise<BrokerCAD.SubscriptionDetails> {
  try {
    return await Confirm(details) || {};
  } catch (e) {
    console.error("Confirm: " + JSON.stringify(e));
  }
  return {};
}


/**
 * Register an email address for our newsletter.
 *
 * email SubscriptionDetails  
 * returns BoolResponse
 **/
export async function newsletterSignup(details: BrokerCAD.SubscriptionDetails) : Promise<BrokerCAD.BoolResponse> {
  try {
    const success = await Signup(details, true);
    return { success } 
  } catch (e) {
    console.error("Signup: " + JSON.stringify(e));
  }
  return {success: false};
}


/**
 * Get subscription details.
 *
 * id String 
 * returns SubscriptionDetails
 **/
export async function newsletterDetails(id: string) : Promise<BrokerCAD.SubscriptionDetails> {
  try {
    return await Details(id);
  } catch (e) {
    console.error("Details fetch failed: " + JSON.stringify(e));
  }
  return {
    confirmed: false,
    email: ""
  };
}




/**
 * Unsubscribe an email address from our newsletter.
 *
 * id String 
 * returns BoolResponse
 **/
export async function newsletterUnsubscribe(id: string) : Promise<BrokerCAD.BoolResponse> {
  try {
    const success = await Unsubscribe(id);
    return { success } 
  } catch (e) {
    console.error("Unsubscribe: " + JSON.stringify(e));
  }
  return {success: false};
}

