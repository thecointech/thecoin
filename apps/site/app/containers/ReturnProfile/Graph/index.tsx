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
    const {values, size, min, count} = data;
//console.log(data)
    const plotData: Serie = {
      id: 'The Coin',
      data: values.map((d, index): Datum => {
        console.log("---VALUES",d)
        const xval = d;
        month = month+1;
        //const rawData = await getData();
        //const graphData = GetPlotData(month, rawData, min);
        //console.log(min,graphData.average,CalcAverageReturn(min, graphData.average));
        //const avgValue = CalcAverageReturn(min, graphData.average);
        // Get rid of float rounding errors
        return {
          x: month,
          y: CalcAverageReturn(multiplier, xval),
        };
      }),
    };

    return (
      <div style={{ height: 300, }}>
        <ResponsiveLine
          data={[plotData]}
          margin={{ top: 10, right: 110, bottom: 60, left: 60 }}
          curve="linear"
        xScale={{ type: 'point' }}
        yScale={{ type: 'linear', stacked: true, min: 'auto', max: 'auto' }}
        axisTop={null}
        axisRight={null}
        enableArea={true}
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
        colors={{ scheme: 'nivo' }}
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
