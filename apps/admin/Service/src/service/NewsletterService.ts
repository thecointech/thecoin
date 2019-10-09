import { Signup, Confirm, Unsubscribe } from '../Newsletter'
import { BrokerCAD } from '@the-coin/types';
/**
 * Confirm email subscription.
 *
 * details SubscriptionDetails 
 * returns BoolResponse
 **/
export async function newsletterConfirm(details: BrokerCAD.SubscriptionDetails) : Promise<BrokerCAD.BoolResponse> {
  try {
    const success = await Confirm(details);
    return { success } 
  } catch (e) {
    console.error("Signup: " + JSON.stringify(e));
  }
  return {success: false};
}


/**
 * Register an email address for our newsletter.
 *
 * email SubscriptionDetails  
 * returns BoolResponse
 **/
export async function newsletterSignup(email: BrokerCAD.SubscriptionDetails) : Promise<BrokerCAD.BoolResponse> {
  try {
    const success = await Signup(email);
    return { success } 
  } catch (e) {
    console.error("Signup: " + JSON.stringify(e));
  }
  return {success: false};
}


/**
 * Register an email address for our newsletter.
 *
 * email String 
 * returns BoolResponse
 **/
export async function newsletterUnsubscribe(email: string) : Promise<BrokerCAD.BoolResponse> {
  try {
    const success = await Unsubscribe(email);
    return { success } 
  } catch (e) {
    console.error("Signup: " + JSON.stringify(e));
  }
  return {success: false};
}

