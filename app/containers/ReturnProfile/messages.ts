/*
 */
import { defineMessages } from 'react-intl';

export const scope = 'app.containers.Returns';

export default defineMessages({
  header: {
    id: `${scope}.Header`,
    defaultMessage: 'Show me the Potential!',
  },
  subHeader: {
    id: `${scope}.subHeader`,
    defaultMessage: 'Over your lifetime, how much can you expect the value of your account grow?',
  },

  explanationPara1: {
    id: `${scope}.explanationPara1`,
    defaultMessage: 'This graph shows how The Coin account values will probably grow after ',
  },
  explanationPara2: {
    id: `${scope}.explanationPara2`,
    defaultMessage: 'If you opened an account at a random date any time in the past 80 years, the bottom axis shows the possible account values and the vertical axis is the probablility you would get that return',
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
  AverageReturn: {
    id: `${scope}.AverageReturn`,
    defaultMessage: 'Average value after ',
  },
  AverageReturnMonths: {
    id: `${scope}.AverageReturnMonths`,
    defaultMessage: '{months} months',
  },
  AverageReturnYears: {
    id: `${scope}.AverageReturnYears`,
    defaultMessage: '{years} years',
  },
  Play: {
    id: `${scope}.Play`,
    defaultMessage: 'Play',
  },
  Pause: {
    id: `${scope}.Pause`,
    defaultMessage: 'Pause',
  },
  Step: {
    id: `${scope}.Step`,
    defaultMessage: 'Step',
  },
});

