import { loadEnvVars } from '@thecointech/setenv';
loadEnvVars();

export const getCSP = () =>
  "default-src 'self' ;" +
  "img-src 'self' data: ; " +
  "script-src 'self' 'unsafe-eval'; " +
  "style-src 'self' 'unsafe-inline' fonts.googleapis.com; " +
  `connect-src 'self'  localhost:* data: ${process.env.POLYGONSCAN_URL} ${process.env.INFURA_URL} ${process.env.CERAMIC_URL} ${process.env.URL_SERVICE_RATES}/;` +
  "font-src 'self' data: fonts.gstatic.com; " +
  "object-src 'none' "
