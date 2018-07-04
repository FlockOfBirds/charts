import { Component, createElement } from "react";

import LineChart from "../LineChart/components/LineChart";

import { getRandomNumbers, validateSeriesProps } from "../utils/data";
import deepMerge from "deepmerge";
import { ScatterData } from "plotly.js";
import { Container } from "../utils/namespaces";
import { defaultColours, fillColours } from "../utils/style";
import LineChartContainerProps = Container.LineChartContainerProps;
import { LineChartDataHandlerProps } from "../LineChart/components/LineChartDataHandler";
import { Provider } from "react-redux";
import { store } from "../LineChart/store";

// tslint:disable-next-line class-name
export class preview extends Component<LineChartContainerProps, {}> {
    render() {
        const alertMessage = validateSeriesProps(
            this.props.series,
            this.props.friendlyId,
            this.props.layoutOptions,
            this.props.configurationOptions
        );

        return createElement(Provider, { store },
            createElement(LineChart, {
                ...this.props as LineChartDataHandlerProps,
                alertMessage,
                devMode: this.props.devMode === "developer" ? "advanced" : this.props.devMode,
                fetchingData: false,
                fill: false,
                scatterData: this.getData(this.props),
                themeConfigs: { layout: {}, configuration: {}, data: {} }
            })
        );
    }

    private getData(props: LineChartContainerProps): ScatterData[] {
        if (props.series.length) {
            return props.series.map((series, index) => {
                const sampleData = preview.getSampleTraces();

                return deepMerge.all([ {
                    connectgaps: true,
                    hoveron: "points",
                    hoverinfo: "none" as any,
                    line: {
                        color: series.lineColor || defaultColours()[index],
                        shape: series.lineStyle
                    },
                    marker: {  color: series.lineColor || defaultColours()[index] },
                    mode: series.mode ? series.mode.replace("X", "+") as Container.LineMode : "lines",
                    name: series.name,
                    type: "scatter",
                    fill: series.fill ? "tonexty" : "none",
                    fillcolor: series.fillColor || fillColours[index],
                    series: {},
                    x: sampleData.x || [],
                    y: sampleData.y || []
                } as ScatterData ]);
            });
        }

        return [ {
            connectgaps: true,
            hoveron: "points",
            hoverinfo: "none" as any,
            name: "Sample",
            type: "scatter",
            fill: "tonexty",
            fillcolor: fillColours[0],
            line: { color: defaultColours()[0] },
            marker: {  color: defaultColours()[0] },
            series: {},
            ...preview.getSampleTraces()
        } as ScatterData ];
    }

    private static getSampleTraces(): { x: (string | number)[], y: (string | number)[] } {
        return {
            x: [ "2017-10-04 22:23:00", "2017-11-04 22:23:00", "2017-12-04 22:23:00" ],
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
                visibilityMap.series[index].xValueSortAttribute = false;
            }
            visibilityMap.series[index].seriesOptions = false;
            visibilityMap.series[index].onClickMicroflow = series.onClickEvent === "callMicroflow";
            visibilityMap.series[index].onClickNanoflow = series.onClickEvent === "callNanoflow";
            visibilityMap.series[index].onClickPage = series.onClickEvent === "showPage";

            visibilityMap.series[index].openPageLocation = series.onClickEvent === "showPage";
        });
    }
    visibilityMap.layoutOptions = false;
    visibilityMap.devMode = false;

    return visibilityMap;
}
