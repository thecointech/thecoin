import { getEnvVars } from '@thecointech/setenv';
const vars = getEnvVars();

const devScript = process.env.NODE_ENV === "development" ? "'unsafe-eval'" : "";
const devStyle = process.env.NODE_ENV === "development" ? "'unsafe-inline'" : "";

export const getCSP = () =>
  "default-src 'self' ;" +
  "img-src 'self' data: ; " +
  `script-src 'self' ${devScript}; ` +
  `style-src 'self' ${devStyle} fonts.googleapis.com; ` +
  "media-src 'self' https://storage.googleapis.com/tccc-releases/Tutorials/; " +
  `connect-src 'self'  localhost:* data: ${vars.POLYGONSCAN_URL} ${vars.INFURA_URL} ${vars.CERAMIC_URL} ${vars.URL_SERVICE_RATES}/;` +
  "font-src 'self' data: fonts.gstatic.com; " +
  "object-src 'none' "
