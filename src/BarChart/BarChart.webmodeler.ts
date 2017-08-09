import { Component, createElement } from "react";

import { BarData } from "plotly.js";

import { BarChart } from "./components/BarChart";
import { BarChartContainerProps } from "./components/BarChartContainer";

// tslint:disable-next-line class-name
export class preview extends Component<BarChartContainerProps, {}> {
    private data: BarData[] = [
        {
            type: "bar",
            x: [ "Sample 1", "Sample 2", "Sample 3", "Sample 4", "Sample 5", "Sample 6", "Sample 7" ],
            y: [ 20, 14, 23, 25, 50, 32, 44 ]
        }
    ];

    render() {
        return createElement(BarChart, {
            config: {
                displayModeBar: this.props.showToolbar
            },
            data: this.data,
            layout: {
                barmode: this.props.barMode,
                title: this.props.title,
                xaxis: { title: this.props.xAxisLabel },
                yaxis: {
                    showgrid: this.props.showGrid,
                    title: this.props.yAxisLabel
                }
            }
        });
    }
}

// export function getPreviewCss() {
//     return (
//         require("plotly.js/src/css/style.scss")
//     );
// }
