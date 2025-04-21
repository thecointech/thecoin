import { LoggingBunyan } from "@google-cloud/logging-bunyan";


export function getGaeStream() {
  return new LoggingBunyan({
    serviceContext: { service: process.env.LOG_NAME },
  }).stream("info")
}
