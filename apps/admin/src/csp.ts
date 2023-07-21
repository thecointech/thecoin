
const connectRates = new URL(process.env.URL_SERVICE_RATES ?? "https://localhost").origin
const connectInfura = process.env.POLYGONSCAN_URL
const connectCeramic = process.env.CERAMIC_URL;
const connectFirestore = "https://firestore.googleapis.com"
// I don't think this is needed anymore?
// const frameCeramic = (process.env.CONFIG_ENV ?? process.env.CONFIG_NAME) == "prod"
//   ? "https://app.3idconnect.org/"
//   : "https://app-clay.3idconnect.org/";

const appCSP = `
  default-src 'self';
  img-src 'self' data: ;
  script-src 'self' 'unsafe-eval' https://apis.google.com https://firestore.googleapis.com;
  style-src 'self' 'unsafe-inline' fonts.googleapis.com;
  connect-src 'self' data: https://oauth2.googleapis.com/token https://www.googleapis.com https://securetoken.googleapis.com ${connectCeramic} ${connectFirestore} ${connectInfura} ${connectRates};
  font-src 'self' data: fonts.gstatic.com;
  frame-src https://broker-cad.firebaseapp.com/ https://${process.env.TCCC_FIRESTORE_AUTH_DOMAIN}/;
`;

const devtoolsCSP = `
  default-src 'self';
  script-src 'self' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
`


const defaultCSP = `
  default-src 'self';
`

export function getCSP(url: URL) {
  switch (url.host) {
    case `localhost:3002`: return appCSP;
    case 'devtools': return devtoolsCSP;
    default: return defaultCSP;
  }
}
