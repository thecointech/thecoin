import React from 'react';
import { Graph } from './Graph/index';
import { Grid, Button, Dropdown, Icon, Input, Form, Label } from 'semantic-ui-react';
import { Slider } from 'react-semantic-ui-range';
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import { RouteComponentProps } from 'react-router';
import queryString from 'query-string';
import { getData, GetPlotData, DataFormat } from './Data';

const options = [
  { key: 'coin', text: 'The Coin', value: 'coin' },
  { key: 'cash', text: 'Cash', value: 'cash' },
  { key: 'savings', text: 'High-interest savings', value: 'savings' },
  { key: 'rbcg', text: 'RBC Growth Funds', value: 'rbcg' },
  { key: 'rbcb', text: 'RBC Bond Funds', value: 'rbcb' },
];

type Props = RouteComponentProps;

export class Returns extends React.PureComponent<Props> {
  public state = {
    sliderValue: 21,
    amount: 1000,
    returns: 1050,
    age: 30,
    rawData: [] as DataFormat[],
  };

  // public const handleValueChange = e => {
  //   let value = parseInt(e.target.value);
  //   if (!value) {
  //     value = 0;
  //   }
  //   this.setState({months: e.target.value});
  // };

  private maybePullQuery(query: queryString.ParsedQuery, name: string) {
    const v = parseInt(query[name] as string, 10);
    if (v) {
      this.setState({[name]: v});
    }
  }

  public componentDidMount() {
    const qs = this.props.location.search;
    const query = queryString.parse(qs);
    this.maybePullQuery(query, 'age');
    this.maybePullQuery(query, 'amount');

    this.updateData();
  }

  private updateData = async () => {
    const rawData = await getData();
    this.setState({rawData});
  }


  private onSetValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      ...this.state,
      [e.target.name]: e.target.value,
    });
  }

  private sliderValueToMonths = () => {
    // Our slider runs as as follows:
    // 1 -> 11: months  (12)
    // 1 -> 10: yearly  (12 + 9)
    // 10+: By 5yrs
    const {sliderValue} = this.state;
    return sliderValue < 12 ?
      sliderValue :
      sliderValue < 21 ?
        12 * (sliderValue - 11) :
        60 * (sliderValue - 19);
  }

  public sliderSettings = () => (
    {
      start: this.state.sliderValue,
      min: 1,
      max: 35,
      step: 1,
      onChange: (sliderValue: number) => this.setState({sliderValue}),
    }
  );

  private getTimeLabel = (months: number) =>
    months < 12 ?
      <FormattedMessage {...messages.AverageReturnMonths} values={{months}} /> :
      <FormattedMessage {...messages.AverageReturnYears} values={{years: months / 12}} />;

  public render() {
    const {amount, rawData, age, returns, sliderValue } = this.state;
    const months = this.sliderValueToMonths();
    const graphData = GetPlotData(months, rawData);
    const returnLabel = this.getTimeLabel(months);
    return (
      <Form>
      <Grid textAlign="left">
        <Grid.Row columns={3}>
          <Grid.Column>
            <Form.Field>
              <Label>
                <FormattedMessage {...messages.Starting} />
              </Label>
              <Input type="number" name="amount" value={amount} onChange={this.onSetValue} />
            </Form.Field>
          </Grid.Column>
          <Grid.Column>
            <Form.Field>
              <Label>
                <FormattedMessage {...messages.Age} />
              </Label>
              <Form.Input type="number" name="age" value={age} onChange={this.onSetValue} />
            </Form.Field>
          </Grid.Column>
          <Grid.Column>
            <Form.Field>
              <Label>
                {returnLabel}
              </Label>
              <Form.Input type="number" disabled value={returns} />
            </Form.Field>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <Graph data={graphData} multiplier={amount} />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row columns="two">
          <Grid.Column width={5}>
            <Dropdown placeholder="Compare" fluid multiple selection options={options} />
          </Grid.Column>
          <Grid.Column>
            <Button.Group>
            <Button icon labelPosition="left">
              <Icon name="pause" />
                Play
              </Button>
              <Button icon labelPosition="right">
                Next
                <Icon name="arrow right" />
              </Button>
            </Button.Group>
          </Grid.Column>
          <Grid.Column width={16}>
            <Slider value={sliderValue} color="red" settings={this.sliderSettings()} />
          </Grid.Column>
        </Grid.Row>
      </Grid>
      </Form>
    );
  }
}