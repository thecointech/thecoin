/*
 */
import { defineMessages } from 'react-intl';

export const scope = 'app.containers.Returns';

export default defineMessages({
  header: {
    id: `${scope}.Header`,
    defaultMessage: 'Show me the potential',
  },
  Starting: {
    id: `${scope}.Starting`,
    defaultMessage: 'Starting Amount',
  },
  Age: {
    id: `${scope}.Age`,
    defaultMessage: 'Your Age',
  },
  calculate: {
    id: `${scope}.calculate`,
    defaultMessage: 'Show Returns',
  },
  AverageReturn: {
    id: `${scope}.AverageReturn`,
    defaultMessage: 'Value after {years} years',
  },
});
