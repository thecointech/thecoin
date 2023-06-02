

export const devCSP =
"default-src 'self' ;" +
"img-src 'self' data: ; " +
"script-src 'self' 'unsafe-eval'; " +
"style-src 'self' 'unsafe-inline' fonts.googleapis.com; " +
"connect-src 'self'  localhost:* data: https://api.polygonscan.com https://beta-dot-carbon-theorem-283310.nn.r.appspot.com https://tc-ceramic.thecoin.io ; " +
"font-src 'self' data: fonts.gstatic.com; " +
"object-src 'none' "

