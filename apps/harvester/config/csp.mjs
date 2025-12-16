import { getEnvVars } from '@thecointech/setenv';
const vars = getEnvVars();

const devScript = process.env.NODE_ENV === "development" ? "'unsafe-eval'" : "";
const devStyle = process.env.NODE_ENV === "development" ? "'unsafe-inline'" : "";
const polygonScanUrl = vars.POLYGONSCAN_URL || 'http://127.0.0.1:9545';

export const getCSP = () =>
  "default-src 'self' ;" +
  "img-src 'self' data: ; " +
  `script-src 'self' ${devScript}; ` +
  `style-src 'self' ${devStyle} fonts.googleapis.com; ` +
  "media-src 'self' https://storage.googleapis.com/tccc-releases/Tutorials/; " +
  `connect-src 'self'  localhost:* data: ${polygonScanUrl} ${vars.INFURA_URL} ${vars.CERAMIC_URL} ${vars.URL_SERVICE_RATES}/;` +
  "font-src 'self' data: fonts.gstatic.com; " +
  "object-src 'none' "
