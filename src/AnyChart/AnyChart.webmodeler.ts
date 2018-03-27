import { Component, createElement } from "react";

import { Alert } from "../components/Alert";
import { LineChart } from "../LineChart/components/LineChart";
import { LineChartContainerProps } from "../LineChart/components/LineChartContainer";

import { getRandomNumbers, validateSeriesProps } from "../utils/data";
import deepMerge from "deepmerge";
import { ScatterData } from "plotly.js";
import { LineMode } from "../utils/types";

// tslint:disable-next-line class-name
export class preview extends Component<LineChartContainerProps, {}> {
    render() {
        return createElement("div", {},
            createElement(Alert, { className: "widget-charts-any-alert" },
                validateSeriesProps(this.props.series, this.props.friendlyId, this.props.layoutOptions)
            ),
            createElement(LineChart, {
                ...this.props as LineChartContainerProps,
                fill: true,
                defaultData: this.getData(this.props)
            })
        );
    }

    private getData(props: LineChartContainerProps): ScatterData[] {
        if (props.series) {
            return props.series.map(series => {
                const seriesOptions = series.seriesOptions.trim() ? JSON.parse(series.seriesOptions) : {};
                const sampleData = series.sampleData.trim()
                    ? JSON.parse(series.sampleData.trim())
                    : preview.getSampleTraces();

                return deepMerge.all([ seriesOptions, {
                    connectgaps: true,
                    hoveron: "points",
                    line: {
                        color: series.lineColor,
                        shape: series.lineStyle
                    },
                    mode: series.mode ? series.mode.replace("X", "+") as LineMode : "lines",
                    name: series.name,
                    type: "scatter",
                    fill: "tonexty",
                    x: sampleData.x || [],
                    y: sampleData.y || []
                } ]);
            });
        }

        return [ {
            connectgaps: true,
            hoveron: "points",
            name: "Sample",
            type: "scatter",
            ...preview.getSampleTraces()
        } as ScatterData ];
    }

    private static getSampleTraces(): { x: (string | number)[], y: (string | number)[] } {
        return {
            x: [ "Sample 1", "Sample 2", "Sample 3", "Sample 4" ],
            y: getRandomNumbers(4, 100)
        };
    }
}

export function getPreviewCss() {
    return (
        require("../ui/Charts.scss") +
        require("../ui/ChartsLoading.scss")
    );
}

// export function getVisibleProperties(valueMap: LineChartContainerProps, visibilityMap: VisibilityMap<LineChartContainerProps>) { // tslint:disable-line max-line-length
//     if (valueMap.series && Array.isArray(valueMap.series)) {
//         valueMap.series.forEach((series, index) => {
//             if (series.dataSourceType === "XPath") {
//                 visibilityMap.series[index].dataSourceMicroflow = false;
//             } else if (series.dataSourceType === "microflow") {
//                 visibilityMap.series[index].entityConstraint = false;
//             }
//             visibilityMap.series[index].seriesOptions = false;
//             visibilityMap.series[index].sampleData = false;
//         });
//     }
//     visibilityMap.layoutOptions = false;
//     visibilityMap.devMode = false;

//     return visibilityMap;
// }
