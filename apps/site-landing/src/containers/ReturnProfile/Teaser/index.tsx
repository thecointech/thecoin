import * as React from 'react';
import { Form, Input, Grid, Label, Header } from 'semantic-ui-react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router';

import styles from './styles.module.less';


const translations = defineMessages({
  header: {
    defaultMessage: 'Show me the Potential!',
  },
  starting: {
    defaultMessage: 'Starting Amount',
  },
  age: {
    defaultMessage: 'Your Age',
  },
  calculate: {
    defaultMessage: 'Calculate',
  },
  averageReturn: {
    defaultMessage: 'Average value after ',
  },
  averageReturnMonths: {
    defaultMessage: '{months} months',
  },
  averageReturnYears: {
    defaultMessage: '{years} years',
  },
  play: {
    defaultMessage: 'Play',
  },
  pause: {
    defaultMessage: 'Pause',
  },
  step: {
    defaultMessage: 'Step',
  },
});

const initState = {
  amount: 1000,
  age: 30,
};

type State = typeof initState;
function BuildCalculatorUrl(state: State) {
  return `/learn/calculator?age=${state.age}&amount=${state.amount}`;
}

export const TeaserClass: React.FunctionComponent = () => {
  const [state, setState] = React.useState(initState);
  const navigate = useNavigate();
  const showCalculate = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e?.preventDefault();
      const url = BuildCalculatorUrl(state);
      navigate(url);
    },
    [],
  );
  const updateValue = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setState({
        ...state,
        [e.target.name]: e.target.value,
      });
    },
    [],
  );

  return (
    <>
      <Header>
        <div className={styles.header}>
          <FormattedMessage {...translations.header} />
        </div>
      </Header>

      <Form>
        <Grid className={styles.teaser}>
          <Grid.Row columns={2}>
            <Grid.Column>
              <Form.Field>
                <Label className={styles.label}>
                  <FormattedMessage {...translations.starting} />
                </Label>
                <Input
                  type="number"
                  name="amount"
                  value={state.amount}
                  onChange={updateValue}
                />
              </Form.Field>
            </Grid.Column>
            <Grid.Column>
              <Form.Field>
                <Label className={styles.label}>
                  <FormattedMessage {...translations.age} />
                </Label>
                <Form.Input
                  type="number"
                  name="age"
                  value={state.age}
                  onChange={updateValue}
                />
              </Form.Field>
            </Grid.Column>
          </Grid.Row>

          <Grid.Row columns={1}>
            <Grid.Column verticalAlign="bottom" className={styles.getinfo}>
              <div className={styles.button}>
                <Form.Button onClick={showCalculate}>
                  <FormattedMessage {...translations.calculate} />
                </Form.Button>
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Form>
    </>
  );
};
