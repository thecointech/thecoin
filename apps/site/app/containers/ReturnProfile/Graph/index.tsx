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
    const ratio = 0.01;
    const {data, multiplier} = this.props;
    const {values, size, min, count} = data;
//console.log(data)
    const plotData: Serie = {
      id: 'Average Return',
      data: values.map((d, index): Datum => {
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
      data: values.map((d, index): Datum => {
        //console.log("---VALUES",d)
        const xval = d+ratio;
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
      data: values.map((d, index): Datum => {
        //console.log("---VALUES",d)
        const xval = d-ratio;
        month = month+1;
        return {
          x: month,
          y: CalcAverageReturn(multiplier, xval),
        };
      }),
    };
    console.log(plotDataMin)



    return (
      <div style={{ height: 300, }}>
        <ResponsiveLine
          data={[plotDataMin, plotData, plotDataMax]}
          margin={{ top: 10, right: 110, bottom: 60, left: 60 }}
          curve="natural"
        xScale={{ type: 'point' }}
        yScale={{ type: 'linear', stacked: true, min: 'auto', max: 'auto' }}
        axisTop={null}
        axisRight={null}
        enableArea={false}
        enablePoints={false}
        axisBottom={{
            orient: 'bottom',
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -30,
            legend: 'Months',
            legendOffset: 52,
            legendPosition: 'middle',
        }}
        axisLeft={{
            orient: 'left',
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Account Value ($)',
            legendOffset: -40,
            legendPosition: 'middle',
        }}
        /*markers={[
          {
            axis: 'x',
            value: '$' + CalcRoundedAverageReturn(multiplier, data),
            lineStyle: { stroke: '#999999', strokeWidth: 2 },
            legend: 'Avg: $' + CalcAverageReturn(multiplier, data.average),
          },
        ]}*/
        colors={{ scheme: 'paired' }}
        pointSize={10}
        pointColor={{ theme: 'background' }}
        pointBorderWidth={2}
        pointBorderColor={{ from: 'serieColor' }}
        pointLabel="y"
        pointLabelYOffset={-12}
        useMesh={true}
        legends={[
            {
                anchor: 'bottom-right',
                direction: 'column',
                justify: false,
                translateX: 100,
                translateY: 0,
                itemsSpacing: 0,
                itemDirection: 'left-to-right',
                itemWidth: 80,
                itemHeight: 20,
                itemOpacity: 0.75,
                symbolSize: 12,
                symbolShape: 'circle',
                symbolBorderColor: 'rgba(0, 0, 0, .5)',
                effects: [
                    {
                        on: 'hover',
                        style: {
                            itemBackground: 'rgba(0, 0, 0, .03)',
                            itemOpacity: 1,
                        },
                    },
                ],
            },
        ]}
        />
      </div>
    );
  }
}
