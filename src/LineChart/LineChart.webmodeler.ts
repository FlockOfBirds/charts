import { Component, createElement } from "react";

import { Alert } from "../components/Alert";
import { LineChart } from "./components/LineChart";

import { getRandomNumbers, validateSeriesProps } from "../utils/data";
import deepMerge from "deepmerge";
import { ScatterData } from "plotly.js";
import { Container } from "../utils/namespaces";
import LineChartContainerProps = Container.LineChartContainerProps;
import LineMode = Container.LineMode;
import { defaultColours } from "../utils/style";

// tslint:disable-next-line class-name
export class preview extends Component<LineChartContainerProps, {}> {
    render() {
        return createElement("div", {},
            createElement(Alert, { className: "widget-charts-line-alert" },
                validateSeriesProps(this.props.series, this.props.friendlyId, this.props.layoutOptions)
            ),
            createElement(LineChart, {
                ...this.props as LineChartContainerProps,
                devMode: this.props.devMode === "developer" ? "advanced" : this.props.devMode,
                scatterData: preview.getData(this.props)
            })
        );
    }

    static getData(props: LineChartContainerProps): ScatterData[] {
        if (props.series.length) {
            return props.series.map((series, index) => {
                const seriesOptions = props.devMode !== "basic" && series.seriesOptions.trim()
                    ? JSON.parse(series.seriesOptions)
                    : {};
                const sampleData = preview.getSampleTraces();
                const color = series.lineColor || defaultColours()[index];

                return deepMerge.all([ {
                    connectgaps: true,
                    hoverinfo: "none",
                    line: {
                        color,
                        shape: series.lineStyle
                    },
                    mode: series.mode ? series.mode.replace("X", "+") as LineMode : "lines",
                    name: series.name,
                    type: "scatter",
                    fill: "none",
                    x: sampleData.x || [],
                    y: sampleData.y || [],
                    series: {},
                    marker: { color }
                }, seriesOptions ]);
            });
        }

        return [ {
            connectgaps: true,
            hoveron: "points",
            hoverinfo: "none",
            name: "Sample",
            type: "scatter",
            series: {},
            line: { color: defaultColours()[0] },
            marker: {  color: defaultColours()[0] },
            ...preview.getSampleTraces()
        } as any ];
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
        require("../ui/ChartsLoading.scss") +
        require("plotly.js/src/css/style.scss")
    );
}

export function getVisibleProperties(valueMap: LineChartContainerProps, visibilityMap: VisibilityMap<LineChartContainerProps>) { // tslint:disable-line max-line-length
    if (valueMap.series && Array.isArray(valueMap.series)) {
        valueMap.series.forEach((series, index) => {
            if (series.dataSourceType === "XPath") {
                visibilityMap.series[index].dataSourceMicroflow = false;
            } else if (series.dataSourceType === "microflow") {
                visibilityMap.series[index].entityConstraint = false;
            }
            visibilityMap.series[index].seriesOptions = false;
            if (series.onClickEvent === "doNothing") {
                visibilityMap.series[index].onClickPage = visibilityMap.series[index].onClickMicroflow = false;
            } else if (series.onClickEvent === "callMicroflow") {
                visibilityMap.series[index].onClickPage = false;
            } else if (series.onClickEvent === "showPage") {
                visibilityMap.series[index].onClickMicroflow = false;
            }
        });
    }
    visibilityMap.devMode = false;
    visibilityMap.layoutOptions = false;

    return visibilityMap;
}
