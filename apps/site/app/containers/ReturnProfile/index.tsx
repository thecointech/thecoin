//import React from 'react';
import React, { useEffect } from 'react';
import { Graph } from './Graph/index';
import { Grid, Button, Icon, Input, Form, Label } from 'semantic-ui-react';
//import { Slider } from 'react-semantic-ui-range';
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import { RouteComponentProps, withRouter } from 'react-router';
import queryString from 'query-string';
import { getData, GetPlotData, DataFormat, CalcAverageReturn,calcPeriodReturn } from './Data';
import { GraphHeader } from './GraphHeader';
import { Explanation } from './Explanation';

// const options = [
//   { key: 'coin', text: 'The Coin', value: 'coin' },
//   { key: 'cash', text: 'Cash', value: 'cash' },
//   { key: 'savings', text: 'High-interest savings', value: 'savings' },
//   { key: 'rbcg', text: 'RBC Growth Funds', value: 'rbcg' },
//   { key: 'rbcb', text: 'RBC Bond Funds', value: 'rbcb' },
// ];

const SliderMax = 37;

type Props = RouteComponentProps;


const initState = {
  sliderValue: 1,
  amount: 1000,
  age: 30,
  rawData: [] as DataFormat[],
  playTimer: 0,
  averages: [] as any,
};

//let averages: number[];

export type State = Readonly<typeof initState>;

export const state = initState;

  let initialTimer = 0;

  export function maybePullQuery(query: queryString.ParsedQuery, name: keyof State) {
    const v = parseInt(query[name] as string, 10);
    if (v) {
      setState({[name]: v} as any);
    }
  }

  export function componentDidMount(this: any) {
    const qs = this.props.location.search;
    const query = queryString.parse(qs);
    maybePullQuery(query, 'age');
    maybePullQuery(query, 'amount');

    updateData();
    // Start playback after 5 seconds
    this.initialTimer = setTimeout(() => {
    this.setState(this.startTimer);
    this.initialTimer = 0;
    }, 5000) as any;
  }

  export function componentWillUnmount() {
    if (initialTimer) {
      clearTimeout(initialTimer);
    }
    if (state.playTimer) {
      clearInterval(state.playTimer);
      //thois
      //this.playTimer = 0;
    }
  }

  export function setStateData(rawData: any[]){
    state.rawData = rawData;
  }


  export async function updateData(){
    const rawData = await getData();
    setStateData(rawData);
  }

  export async function  getRawData(){
    const rawData = await getData();
    return rawData;
  }

  export function getAmount(){
    return state.amount;
  }

  export function onSetValue(e: React.ChangeEvent<HTMLInputElement>){
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  }

  export function sliderValueToMonths(){
    // Our slider runs as as follows:
    // 1 -> 11: months  (12)
    // 1 -> 10: yearly  (12 + 9)
    // 10+: By 5yrs
    const {sliderValue} = state;
    return sliderValue < 12 ?
      sliderValue :
      sliderValue < 21 ?
        12 * (sliderValue - 11) :
        60 * (sliderValue - 19);
  }

  export function sliderMax(){
    return state.age < 60 ?
      SliderMax - Math.floor(state.age / 5) :
      22
  }

  export function monthsToMinimum(months: number){
    return (months < 120) ? -0.5 : undefined
  }

  /*export const sliderSettings(): any{
    var sliderSet = {
          start: state.sliderValue,
          min: 1,
          max: sliderMax(),
          step: 1,
          onChange: (sliderValue: number) => setState({sliderValue}),
        }
    return sliderSet;
  }*/

  export function getTimeLabel (months: number){ 
    var timeLabel = months < 12 ?
      <FormattedMessage {...messages.AverageReturnMonths} values={{months}} /> :
      <FormattedMessage {...messages.AverageReturnYears} values={{years: months / 12}} />;
      return timeLabel;
  }

  export function setState(state: State){
    const max = sliderMax();
    const sliderValue = Math.min(max, state.sliderValue + 1);
    if (sliderValue === max) {
      state = clearTimer(state);
    }
    return {
      ...state,
      sliderValue,
    };
  };

  export function incrSliderValue(){
    setState(state);
  }

  export function clearTimer(state: State){
    let {playTimer} = state;
    if (playTimer) {
      clearInterval(playTimer);
      playTimer = 0;
    }
    return {
      ...state,
      playTimer,
    };
  }

  export function startTimer(state: State){
    let {playTimer} = state;
    if (!playTimer) {
      playTimer = Number(setInterval(incrSliderValue, 1200));
    }
    return {
      ...state,
      playTimer,
    };
  }

 export async function prepareAverages(){
    const data = await getData();
    const firstYear = 1935;
    const iterations = 10;
    const monthsWeWantToGraph = 7*12;
    const startDate = new Date(firstYear, 0);
    const returns = Array(monthsWeWantToGraph);
    const average = Array(monthsWeWantToGraph);
  
    var endDate;
    var monthToInsert = 1;
    var beginDate = startDate;
  
    for (let y = 1; y <= iterations; y++){
      returns[y] = Array(monthsWeWantToGraph);
      monthToInsert = 1;
      for (let i = y; i < monthsWeWantToGraph+y; i++) {
        endDate = new Date(firstYear, i);
        beginDate = new Date(firstYear, i-1);
        returns[y][monthToInsert] = calcPeriodReturn(data, beginDate, endDate, monthToInsert)[0];
        if (typeof average[monthToInsert] == 'undefined'){
          average[monthToInsert] = (calcPeriodReturn(data, beginDate, endDate, monthToInsert)[0]);
        } else {
          average[monthToInsert] = average[monthToInsert] + (calcPeriodReturn(data, beginDate, endDate, monthToInsert)[0]);
        }
        monthToInsert = monthToInsert+1;
      }
    }

    var final = Array(monthsWeWantToGraph)
    for (let x = 1; x <= monthsWeWantToGraph; x++){
      final[x] = average[x]/iterations;
    }
    final[0] = 0;
    return final;
  }

 export function step(){
    incrSliderValue();
 }

export function setStatePlayTime(timer: any){
  state.playTimer = timer;
}

  export function play(){
    setStatePlayTime(state.playTimer ? clearTimer : startTimer)
  }



  function BuildCalculatorUrl(state: State) {
    return `/graph/calculator?age=${state.age}&amount=${state.amount}`;
  }

export const graphFrom: React.FunctionComponent<Props> = (props: Props) => {
  
  const [state, setState] = React.useState(initState);
  const showCalculate = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e?.preventDefault();
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
  useEffect(() => {
    const fetchDataAsync = async () => {
      state.averages = (await prepareAverages());
      
      const qs = props.location.search;
      const query = queryString.parse(qs);
      maybePullQuery(query, 'age');
      maybePullQuery(query, 'amount');
  
      updateData();
      // Start playback after 5 seconds
      initialTimer = setTimeout(() => {
      setState(startTimer);
      initialTimer = 0;
      }, 5000) as any;
      
    }   
    fetchDataAsync()
   }, []);


  const {amount, rawData, age } = state;
  const months = sliderValueToMonths();
  const minimum = monthsToMinimum(months);
  const graphData = GetPlotData(months, rawData, minimum);
  const timeString = getTimeLabel(months);
  const avgValue = CalcAverageReturn(amount, graphData.average);
  
  graphData.values = state.averages;
  const playButton = state.playTimer ? (
    <>
      <Icon name="pause" />
    </>
    ) : (
    <>
      <Icon name="play" />
    </>
  );
  
    return (
      <Form>
      <Grid textAlign="left">
        <Grid.Row>
          <Grid.Column>
            <GraphHeader />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row columns={3}>
          <Grid.Column>
            <Form.Field>
              <Label>
                <FormattedMessage {...messages.Starting} />
              </Label>
              <Input type="number" name="amount" value={amount} onChange={onSetValue} />
            </Form.Field>
          </Grid.Column>
          <Grid.Column>
            <Form.Field>
              <Label>
                <FormattedMessage {...messages.Age} />
              </Label>
              <Form.Input type="number" name="age" value={age} onChange={onSetValue} />
            </Form.Field>
          </Grid.Column>
          <Grid.Column>
            <Form.Field>
              <Label>
                <FormattedMessage {...messages.AverageReturn} />
                {timeString}
              </Label>
              <Form.Input value={'$' + avgValue} />
            </Form.Field>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <Graph data={graphData} multiplier={amount} />
          </Grid.Column>
        </Grid.Row>
        <br /><br /><br /><br /><br /><br />
        <Grid.Row>
          <Grid.Column>
            <Explanation timeString={timeString}/>
          </Grid.Column>
        </Grid.Row>
      </Grid>
      </Form>
    );
  };

//export default View;

export const View = withRouter(graphFrom);