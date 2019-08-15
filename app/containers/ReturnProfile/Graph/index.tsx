import React from 'react';
import { ResponsiveLine } from '@nivo/line';
import { CoinReturns } from '../Data';

interface Props {
  data: CoinReturns;
  multiplier: number;
}

export class Graph extends React.PureComponent<Props> {

  // public state = {
  //   data: CoinReturns,
  // };



  // public componentDidMount() {
  //   this.updateData();
  // }

  // private updateData = async () => {
  //   const rawData = await getData();
  //   this.setState({rawData});
  // }

  // private calcPlotData = (monthCount: number, data: DataFormat[]) => {
  //   if (data.length === 0 || !monthCount) {
  //     return {plotData: [], average: 0, averageMarker: 0, averageLegend: ''};
  //   }

  //   const startDate = new Date(1919, 0);
  //   const returns = calcPeriodReturn(data, startDate, new Date(), monthCount, 0);
  //   const { min, size, values, average } = bucketValues(returns, 30);
  //   const plotData: LineSerieData = {
  //     id: 'The Coin',
  //     data: values.map((d, index): LineDatum => {
  //       const xval = min + (index * size);
  //       // Get rid of float rounding errors
  //       const cleanxval = Math.round(xval * 100);
  //       return {
  //         x: cleanxval,
  //         y: d,
  //       };
  //     }),
  //   };

  //   const averageMarker = Math.round(average / size) * size * 100;
  //   const averageLegend = (Math.round(average * 100 * 100) / 100).toString();
  //   return {plotData: [plotData], averageMarker, averageLegend};
  // }

  // private getPlotData = memoize(this.calcPlotData, (m: number, d: DataFormat[]) => d.length + m);

  public render() {
    const {data, multiplier} = this.props;
    const {plotData, average, size} = data;
    const avgValue = multiplier * (1 + average); // Math.round(average * 100 * 100) / 100);
    const averageMarker = Math.round(average / size) * size * 100;
    const averageLegend = 'Avg: ' + avgValue.toFixed(2);

    // const mplotData = plotData.map(s => ({
    //   ...s,
    //   data: s.data.map(v => ({
    //     ...v,
    //     x: v.x ? Number(v.x) * multiplier : v.x,
    //   })),
    // }));
    const mplotData = plotData;

    return (
      <div style={{
        height: 300,
      }}>
        <ResponsiveLine
          data={mplotData}
          margin={{ top: 10, right: 110, bottom: 50, left: 60 }}
          curve="monotoneX"
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
            legend: 'Returns (%)',
            legendOffset: 36,
            legendPosition: 'middle',
        }}
        axisLeft={{
            orient: 'left',
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Probability',
            legendOffset: -40,
            legendPosition: 'middle',
        }}
        markers={[
          {
            axis: 'x',
            value: averageMarker,
            lineStyle: { stroke: '#999999', strokeWidth: 2 },
            legend: averageLegend,
          },
        ]}
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
