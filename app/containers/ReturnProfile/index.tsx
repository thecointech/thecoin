import React from 'react';
import { Graph } from './Graph/index';
import { Grid, Button, Dropdown, Icon, Input, Form, Label } from 'semantic-ui-react';
import { Slider } from 'react-semantic-ui-range';

const options = [
  { key: 'coin', text: 'The Coin', value: 'coin' },
  { key: 'cash', text: 'Cash', value: 'cash' },
  { key: 'savings', text: 'High-interest savings', value: 'savings' },
  { key: 'rbcg', text: 'RBC Growth Funds', value: 'rbcg' },
  { key: 'rbcb', text: 'RBC Bond Funds', value: 'rbcb' },
];

export class Returns extends React.PureComponent {
  public state = {
    months: 6,
  };

  // public const handleValueChange = e => {
  //   let value = parseInt(e.target.value);
  //   if (!value) {
  //     value = 0;
  //   }
  //   this.setState({months: e.target.value});
  // };

  public sliderSettings = () => (
    {
      start: this.state.months,
      min: 1,
      max: 38,
      step: 1,
      onChange: (value: number) => this.setState({months: value}),
    }
  );

  public render() {
    const {months} = this.state;
    return (
      <Grid textAlign="left">
        <Grid.Row>
          <Grid.Column width="three">
            <Form.Field>
              <Label>Starting Value</Label>
              <Input>1000</Input>
            </Form.Field>
          </Grid.Column>
          <Grid.Column width="ten">
            <Form.Field>
              <Label># of months</Label>
              <Input disabled>{months}</Input>
            </Form.Field>
          </Grid.Column>
          <Grid.Column width="three">
            <Form.Field>
              <Label>Average Result:</Label>
              <Input disabled>1050</Input>
            </Form.Field>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <Graph months={months}/>
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
            <Slider value={months} color="red" settings={this.sliderSettings()} />
          </Grid.Column>
        </Grid.Row>

      </Grid>
    );
  }
}