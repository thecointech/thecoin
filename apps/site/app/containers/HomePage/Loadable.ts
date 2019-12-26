/**
 * Asynchronously loads the component for HomePage
 */
import loadable from 'loadable-components';

export default loadable(async () => {
  const homepage = await import('./index');
  return homepage.HomePage
});
