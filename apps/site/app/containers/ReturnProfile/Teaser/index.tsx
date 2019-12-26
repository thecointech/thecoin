import * as React from 'react';
import { Form, Input, Grid, Label, Header } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';
import messages from '../messages';
import { RouteComponentProps, withRouter } from 'react-router';

import styles from '../../../styles/base.css';

type Props = RouteComponentProps;

const initState = {
  amount: 1000,
  age: 30,
};

type State = typeof initState;
function BuildCalculatorUrl(state: State) {
  return `/learn/calculator?age=${state.age}&amount=${state.amount}`;
}

export const TeaserClass: React.FunctionComponent<Props> = (props: Props) => {
  const [state, setState] = React.useState(initState);
  const showCalculate = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      const url = BuildCalculatorUrl(state);
      props.history.push(url);
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
          <FormattedMessage {...messages.header} />
        </div>
      </Header>

      <Form>
        <Grid className={styles.teaser}>
          <Grid.Row columns={2}>
            <Grid.Column>
              <Form.Field>
                <Label className={styles.label}>
                  <FormattedMessage {...messages.Starting} />
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
                  <FormattedMessage {...messages.Age} />
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
                  <FormattedMessage {...messages.calculate} />
                </Form.Button>
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Form>
    </>
  );
};

export const Teaser = withRouter(TeaserClass);
