import { Component, createElement } from "react";

import { Alert } from "../components/Alert";
import { LineChart } from "../LineChart/components/LineChart";

import { getRandomNumbers, validateSeriesProps } from "../utils/data";
import deepMerge from "deepmerge";
import { ScatterData } from "plotly.js";
import { Container, Data } from "../utils/namespaces";
import LineChartContainerProps = Container.LineChartContainerProps;

// tslint:disable-next-line class-name
export class preview extends Component<LineChartContainerProps, {}> {
    render() {
        return createElement("div", {},
            createElement(Alert, { className: "widget-charts-bubble-alert" },
                validateSeriesProps(this.props.series, this.props.friendlyId, this.props.layoutOptions)
            ),
            createElement(LineChart, {
                ...this.props as LineChartContainerProps,
                scatterData: preview.getData(this.props)
            })
        );
    }

    static getData(props: LineChartContainerProps): ScatterData[] {
        const sampleData = preview.getSampleTraces();
        if (props.series.length) {
            return props.series.map(series => {
                const seriesOptions = props.devMode !== "basic" && series.seriesOptions.trim()
                    ? JSON.parse(series.seriesOptions)
                    : {};

                return deepMerge.all([ {
                    connectgaps: true,
                    hoverinfo: "text",
                    hoveron: "points",
                    markers: {
                        color: series.color
                    },
                    mode: "markers",
                    name: series.name,
                    type: "scatter",
                    series: {},
                    ...sampleData

                }, seriesOptions ]);
            });
        }

        return [ {
            connectgaps: true,
            hoverinfo: "none",
            hoveron: "points",
            name: "Sample",
            type: "scatter",
            mode: "markers",
            text: sampleData.marker ? sampleData.marker.size : "",
            series: {},
            ...sampleData
        } as any ];
    }

    private static getSampleTraces(): Data.ScatterTrace {
        return {
            x: [ "Sample 1", "Sample 2", "Sample 3", "Sample 4" ],
            y: getRandomNumbers(4, 100),
            marker: { size: getRandomNumbers(4, 100, 20) }
        };
    }
}

export function getPreviewCss() {
    return (
        require("../ui/Charts.scss") +
        require("../ui/ChartsLoading.scss") +
        require("../ui/Sidebar.scss") +
        require("../ui/Playground.scss") +
        require("../ui/Panel.scss") +
        require("../ui/InfoTooltip.scss") +
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
