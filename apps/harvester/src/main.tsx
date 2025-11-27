import { createRoot } from "react-dom/client";
import { LanguageProvider } from '@thecointech/shared/containers/LanguageProvider';
import translations from "@thecointech/shared/translations";
import { Provider } from 'react-redux';
import { initialize } from './init';
import { routes } from "./App/routes";
import { RouterProvider, createHashRouter } from 'react-router';

// Set the document title based on the channel
const channel = process.env.CONFIG_NAME;
const channelSuffix = channel && channel !== 'prod' ? ` [${channel.toUpperCase()} - ${process.env.TC_DEPLOYED_AT || 'unknown'}]` : '';
document.title = `TheCoin - Harvester${channelSuffix}`;

const MOUNT_NODE = document.getElementById('root') as HTMLElement;
const root = createRoot(MOUNT_NODE);
const store = await initialize()

root.render(
  <Provider store={store}>
    <LanguageProvider languages={translations}>
      <RouterProvider router={
        createHashRouter(routes)
      } />
    </LanguageProvider>
  </Provider>,
);
