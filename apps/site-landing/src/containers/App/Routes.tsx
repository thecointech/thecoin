import { HomePage } from 'containers/HomePage/index';
import { NotFoundPage } from '@thecointech/shared/containers/NotFoundPage';
import { Healthier } from 'containers/Healthier';
import { WeDoMore } from 'containers/WeDoMore';
import { Compare } from 'containers/Compare';
import { Confirm } from 'containers/Subscribe/Confirm';
import { Learn } from 'containers/Learn';
import { HelpDocs } from 'containers/HelpDocs';
import { Blog } from 'containers/Blog';
import { TOS } from 'containers/TOS';
import { Privacy } from 'containers/Privacy';

export const routes = {
  open: {
    "/": HomePage,
    learn: Learn,
    newsletter: {
      confirm: {
        component: Confirm,
        exact: true,
      }
    },
    healthier: Healthier,
    wedomore: WeDoMore,
    compare: Compare,
    help: HelpDocs,
    blog: Blog,
    faq: {
      ":category?": HelpDocs,
    },
    tos: TOS,
    privacy: Privacy,
  },
  fallback: NotFoundPage
}

export type AllRoutes = keyof typeof routes["open"];
