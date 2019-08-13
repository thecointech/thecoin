/*
 */
import { defineMessages } from 'react-intl';

export const scope = 'app.containers.Returns.Teaser';

export default defineMessages({
  header: {
    id: `${scope}.Header`,
    defaultMessage: 'Show me my risk and reward!',
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
    defaultMessage: 'Show Potential',
  },
  AverageReturn: {
    id: `${scope}.AverageReturn`,
    defaultMessage: 'Value after {years} years',
  },
});
