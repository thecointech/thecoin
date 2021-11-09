import args from './argv.mjs';

export const port = parseInt(args.port || process.env.PORT || '3001', 10);
