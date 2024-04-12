
export async function getDefintions() {
  const def = await import(`./__generated__/${getConfig()}-definition`);
  return def.definition;
}


const getConfig = () => {
  const config = process.env.CONFIG_NAME;
  if (config == "prodbeta") return "prod";
  return config;
}
