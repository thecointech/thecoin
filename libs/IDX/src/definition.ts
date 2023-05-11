
export async function getDefintions() {
  const def = await import(`./__generated__/${process.env.CONFIG_NAME}-definition`);
  return def.definition;
}
