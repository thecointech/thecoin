import { getDefintions } from './definition';

it ('gets the right config', async () => {
  process.env.CONFIG_NAME = "prodbeta";
  const def = await getDefintions();
  expect(def).toBeDefined();
})
