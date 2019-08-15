/*
 */
import { defineMessages } from 'react-intl';

export const scope = 'app.containers.Returns';

export default defineMessages({
  header: {
    id: `${scope}.Header`,
    defaultMessage: 'Show me the Potential!',
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
    defaultMessage: 'Calculate',
  },
  AverageReturnMonths: {
    id: `${scope}.AverageReturn`,
    defaultMessage: 'Average value after {months} months',
  },
  AverageReturnYears: {
    id: `${scope}.AverageReturn`,
    defaultMessage: 'Average value after {years} years',
  },
  Play: {
    id: `${scope}.Play`,
    defaultMessage: 'Play',
  },
  Step: {
    id: `${scope}.Step`,
    defaultMessage: 'Step',
  },
});

