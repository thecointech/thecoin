import React from 'react';
import { ResponsiveLine, Serie, Datum } from '@nivo/line';
import { CoinReturns,CalcAverageReturn } from '../Data';

interface Props {
  data: CoinReturns;
  multiplier: number;
}
var month = 0;

export class Graph extends React.PureComponent<Props> {

  public render() {
    const {data, multiplier} = this.props;
    const {values, mins, maxs} = data;

    const plotData: Serie = {
      id: 'Average Return',
      data: values.map((d): Datum => {
        const xval = d;
        month = month+1;
        return {
          x: month,
          y: CalcAverageReturn(multiplier, xval),
        };
      }),
    };

    month = 0;
    const plotDataMax: Serie = {
      id: 'Max',
      data: maxs.map((d): Datum => {
        const xval = d;
        month = month+1;
        return {
          x: month,
          y: CalcAverageReturn(multiplier, xval),
        };
      }),
    };
    
    month = 0;
    const plotDataMin: Serie = {
      id: 'Min',
      data: mins.map((d): Datum => {
        const xval = d;
        month = month+1;
        return {
          x: month,
          y: CalcAverageReturn(multiplier, xval),
        };
      }),
    };

const height = 300;

const gradProps = {
  gradientUnits: 'userSpaceOnUse',
  x1: '0',
  y1: '0',
  x2: '0',
  y2: height
};
const gradProps0 = {
  gradientUnits: 'userSpaceOnUse',
  x1: '0',
  y1: '0',
  x2: '0',
  y2: height
};

    return (
      <div style={{ height: 300 }}>
        <ResponsiveLine
          data={[plotDataMin, plotData, plotDataMax]}
          margin={{ top: 10, right: 110, bottom: 60, left: 60 }}
          curve="natural"
        xScale={{ type: 'point' }}
        yScale={{ type: 'linear', stacked: true, min: 'auto', max: 'auto' }}
        axisTop={null}
        axisRight={null}
        enableArea={true}
        areaBlendMode="screen"
        enablePoints={false}
        axisBottom={{
            orient: 'bottom',
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -30,
            legend: 'Months',
            legendOffset: 452,
            legendPosition: 'middle',
        }}
        axisLeft={{
            orient: 'left',
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: '',
            legendOffset: -40,
            legendPosition: 'middle',
        }}
        colors={[ "url(#gradientBottom)", "url(#gradientTop)", "url(#gradientTop)"]}
        pointSize={10}
        enableGridX={false}
        enableGridY={false}
        areaOpacity={1.0}
        pointLabel="y"
        useMesh={true}
        />

        <svg>
          <defs>
            <linearGradient id="gradientTop" {...gradProps} gradientTransform="rotate(-2)"> 
              <stop offset="0%" stopColor="white" />
              <stop offset="550%" stopColor="green" />
            </linearGradient>

            <linearGradient id="gradientMiddle" {...gradProps}>   
              <stop offset="0%" stopColor="green"/>
              <stop offset="100%" stopColor="white" stopOpacity="1.0"/>
            </linearGradient>

          <linearGradient id="gradientBottom" {...gradProps0} gradientTransform="rotate(-2)">   
            <stop offset="0%" stopColor="white"/>
            <stop offset="100%" stopColor="white" stopOpacity="1.0"/>
          </linearGradient>


            
          </defs>
        </svg>
      </div>
    );
  }
}
