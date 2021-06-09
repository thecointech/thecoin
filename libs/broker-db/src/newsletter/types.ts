import { buildConverter, convertDates } from "../converter";
import { DateTime } from "luxon"

export interface SubscriptionData {
  // The email the user used to register his account
  email: string;
  //Opt-in confirmation of the users subscription
  confirmed?: boolean;
  // Optional name
  givenName?: string;
  familyName?: string;
  country?: string;
  city?: string;
};

export interface Subscription extends SubscriptionData {
  // Date first registered
  registerDate: DateTime,
}

export const subscriptionConverter = buildConverter<Subscription>(
  convertDates<Subscription>("registerDate")
);
