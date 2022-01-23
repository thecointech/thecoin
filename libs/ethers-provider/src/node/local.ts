import { JsonRpcProvider } from "@ethersproject/providers";

export const getProvider = () => {

  const port = process.env.DEPLOY_NETWORK_PORT;
  if (!port)
    throw new Error(`Missing deployment port, cannot connect to localhost`);

  return new JsonRpcProvider(`http://localhost:${port}`);
}
