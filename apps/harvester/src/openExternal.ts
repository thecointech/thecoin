import { logsFolder } from "./paths";
import open from "open";

export const openLogsFolder = async () => {
  await open(logsFolder);
  return true;
}

export type WebsiteEndpoints = "account" | "simulation"
export const openWebsiteUrl = async (endpoint: WebsiteEndpoints) => {

  switch (endpoint) {
    case "account":
      await open(`${process.env.URL_SITE_APP}`)
      return true;
    case "simulation":
      const compareUrlDetails = "/#/compare?sim=%7B%22adjustForInflation%22%3Afalse%2C%22maxOffsetPercentage%22%3A0.0175%2C%22initialBalance%22%3A50%2C%22income%22%3A%7B%22weekly%22%3A1000%2C%22monthly%22%3A0%2C%22yearly%22%3A0%7D%2C%22cash%22%3A%7B%22weekly%22%3A0%2C%22monthly%22%3A0%2C%22yearly%22%3A0%7D%2C%22credit%22%3A%7B%22weekly%22%3A1000%2C%22monthly%22%3A0%2C%22yearly%22%3A0%2C%22billingCycle%22%3A4%2C%22graceWeeks%22%3A3%2C%22cashBackRate%22%3A0.01%2C%22interestRate%22%3A0.25%7D%2C%22shockAbsorber%22%3A%7B%22cushionDown%22%3A0%2C%22cushionUp%22%3A0%2C%22maximumProtected%22%3A0%2C%22trailingMonths%22%3A0%7D%2C%22years%22%3A10%7D"
      const url = `${process.env.URL_SITE_LANDING}${compareUrlDetails}`
      await open(url);
      return true;
    default:
      throw new Error("Invalid endpoint");
  }
}
