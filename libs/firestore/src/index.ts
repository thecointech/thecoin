export * from './types';
export * from './timestamp';
export { init } from "./init";
export * from './firestore';

// Directly export FieldValue, as it appears to work in both client & server environments
// TODO: redirect to the appropriate library using conditional imports...
export { FieldValue } from "@google-cloud/firestore";
