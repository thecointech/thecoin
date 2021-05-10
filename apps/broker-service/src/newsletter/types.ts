export interface EmailDetails {
  /**
   * The email the user used to register his account
   */
  email: string;
}

export interface SubscriptionDetails extends EmailDetails {

  /**
   * Opt-in confirmation of the users subscription
   */
  confirmed?: boolean;
  /**
   * Optional name
   */
  givenName?: string;
  familyName?: string;
  country?: string;
  city?: string;
}
