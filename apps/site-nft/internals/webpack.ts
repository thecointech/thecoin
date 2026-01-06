import { getConfig } from "@thecointech/site-base/internal/webpack";

const config = await getConfig([], {
  port: 3003
});

export default config;
