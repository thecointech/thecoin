import React from 'react';
// import { Graph } from './Graph/index';
// import { Grid, Button, Icon, Input, Form, Label } from 'semantic-ui-react';
// //import { Slider } from 'react-semantic-ui-range';
// import { FormattedMessage } from 'react-intl';
// import messages from './messages';
// import { RouteComponentProps } from 'react-router';
// import queryString from 'query-string';
// import { getData, DataFormat, GetPlotData, CalcAverageReturn } from './Data';
// import { GraphHeader } from './GraphHeader';
// import { Explanation } from './Explanation';

// const options = [
//   { key: 'coin', text: 'The Coin', value: 'coin' },
//   { key: 'cash', text: 'Cash', value: 'cash' },
//   { key: 'savings', text: 'High-interest savings', value: 'savings' },
//   { key: 'rbcg', text: 'RBC Growth Funds', value: 'rbcg' },
//   { key: 'rbcb', text: 'RBC Bond Funds', value: 'rbcb' },
// ];

//const SliderMax = 37;

// const initState = {
//   sliderValue: 1,
//   amount: 1000,
//   age: 30,
//   rawData: [] as DataFormat[],
//   playTimer: 0,
// };

// type State = Readonly<typeof initState>;

export class Returns extends React.PureComponent {

  // const handleValueChange = e => {
  //   let value = parseInt(e.target.value);
  //   if (!value) {
  //     value = 0;
  //   }
  //   this.setState({months: e.target.value});
  // };

  // private maybePullQuery(query: queryString.ParsedQuery, name: keyof State) {
  //   const v = parseInt(query[name] as string, 10);
  //   if (v) {
  //     this.setState({[name]: v} as any);
  //   }
  // }

  // public componentDidMount() {
  //   const qs = this.props.location.search;
  //   const query = queryString.parse(qs);
  //   this.maybePullQuery(query, 'age');
  //   this.maybePullQuery(query, 'amount');

  //   this.updateData();
  //   // Start playback after 5 seconds
  //   this.initialTimer = setTimeout(() => {
  //     this.setState(this.startTimer);
  //     this.initialTimer = 0;
  //   }, 5000) as any;
  // }

  // public componentWillUnmount() {
  //   if (this.initialTimer) {
  //     clearTimeout(this.initialTimer);
  //   }
  //   if (this.state.playTimer) {
  //     clearInterval(this.state.playTimer);
  //     //thois
  //     //this.playTimer = 0;
  //   }
  // }

  // private updateData = async () => {
  //   const rawData = await getData();
  //   this.setState({rawData});
  // }

  // private onSetValue = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   this.setState({
  //     ...this.state,
  //     [e.target.name]: e.target.value,
  //   });
  // }

  // private sliderValueToMonths = () => {
  //   // Our slider runs as as follows:
  //   // 1 -> 11: months  (12)
  //   // 1 -> 10: yearly  (12 + 9)
  //   // 10+: By 5yrs
  //   const {sliderValue} = this.state;
  //   return sliderValue < 12 ?
  //     sliderValue :
  //     sliderValue < 21 ?
  //       12 * (sliderValue - 11) :
  //       60 * (sliderValue - 19);
  // }

  // private sliderMax = () =>
  //   this.state.age < 60 ?
  //     SliderMax - Math.floor(this.state.age / 5) :
  //     22

  // private monthsToMinimum = (months: number) =>
  //   (months < 120) ? -0.5 : undefined

  // public sliderSettings = () => (
  //   {
  //     start: this.state.sliderValue,
  //     min: 1,
  //     max: this.sliderMax(),
  //     step: 1,
  //     onChange: (sliderValue: number) => this.setState({sliderValue}),
  //   }
  // );

  // private getTimeLabel = (months: number) =>
  //   months < 12 ?
  //     <FormattedMessage {...messages.AverageReturnMonths} values={{months}} /> :
  //     <FormattedMessage {...messages.AverageReturnYears} values={{years: months / 12}} />;

  // private incrSliderValue = () =>
  //   this.setState((state: State) => {
  //     const max = this.sliderMax();
  //     const sliderValue = Math.min(max, state.sliderValue + 1);
  //     if (sliderValue === max) {
  //       state = this.clearTimer(state);
  //     }
  //     return {
  //       ...state,
  //       sliderValue,
  //     };
  //   })

  // private clearTimer = (state: State) => {
  //   let {playTimer} = state;
  //   if (playTimer) {
  //     clearInterval(playTimer);
  //     playTimer = 0;
  //   }
  //   return {
  //     ...state,
  //     playTimer,
  //   };
  // }

  // private startTimer = (state: State) => {
  //   let {playTimer} = state;
  //   if (!playTimer) {
  //     playTimer = Number(setInterval(this.incrSliderValue, 1200));
  //   }
  //   return {
  //     ...state,
  //     playTimer,
  //   };
  // }

  // private step = () =>
  //   this.incrSliderValue();

  // private play = () =>
  //   this.setState(this.state.playTimer ? this.clearTimer : this.startTimer)

    /*\
              <Grid.Column >
            <Dropdown placeholder="Compare" fluid multiple selection options={options} />
          </Grid.Column>
          */
  public render() {
    return <div>disabled</div>;
  //   const {amount, rawData, age } = this.state;
  //   const months = this.sliderValueToMonths();
  //   const minimum = this.monthsToMinimum(months);
  //   const graphData = GetPlotData(months, rawData, minimum);
  //   const timeString = this.getTimeLabel(months);
  //   const avgValue = CalcAverageReturn(amount, graphData.average);

  //   const playButton = this.state.playTimer ? (
  //     <>
  //       <Icon name="pause" />
  //       <FormattedMessage {...messages.Pause} />
  //     </>
  //     ) : (
  //     <>
  //       <Icon name="play" />
  //       <FormattedMessage {...messages.Play} />
  //     </>
  //   );
  //   return (
  //     <Form>
  //     <Grid textAlign="left">
  //       <Grid.Row>
  //         <Grid.Column>
  //           <GraphHeader />
  //         </Grid.Column>
  //       </Grid.Row>
  //       <Grid.Row columns={3}>
  //         <Grid.Column>
  //           <Form.Field>
  //             <Label>
  //               <FormattedMessage {...messages.Starting} />
  //             </Label>
  //             <Input type="number" name="amount" value={amount} onChange={this.onSetValue} />
  //           </Form.Field>
  //         </Grid.Column>
  //         <Grid.Column>
  //           <Form.Field>
  //             <Label>
  //               <FormattedMessage {...messages.Age} />
  //             </Label>
  //             <Form.Input type="number" name="age" value={age} onChange={this.onSetValue} />
  //           </Form.Field>
  //         </Grid.Column>
  //         <Grid.Column>
  //           <Form.Field>
  //             <Label>
  //               <FormattedMessage {...messages.AverageReturn} />
  //               {timeString}
  //             </Label>
  //             <Form.Input value={'$' + avgValue} />
  //           </Form.Field>
  //         </Grid.Column>
  //       </Grid.Row>
  //       <Grid.Row>
  //         <Grid.Column>
  //           <Graph data={graphData} multiplier={amount} />
  //         </Grid.Column>
  //       </Grid.Row>
  //       <Grid.Row columns="two">
  //         <Grid.Column width={4}>
  //           <Button.Group>
  //             <Button icon labelPosition="left" onClick={this.play}>
  //               {playButton}
  //             </Button>
  //             <Button icon labelPosition="right" onClick={this.step}>
  //               <FormattedMessage {...messages.Step} />
  //               <Icon name="arrow right" />
  //             </Button>
  //           </Button.Group>
  //         </Grid.Column>
  //         <Grid.Column width="10">
  //           {/*<Slider value={sliderValue} style={{ marginTop: "8px", trackFill: { backgroundColor: "#3193A1"}}} settings={this.sliderSettings()} />*/}
  //         </Grid.Column>
  //       </Grid.Row>
  //       <Grid.Row>
  //         <Grid.Column>
  //           <Explanation timeString={timeString}/>
  //         </Grid.Column>
  //       </Grid.Row>
  //     </Grid>
  //     </Form>
  //   );
  }
}
