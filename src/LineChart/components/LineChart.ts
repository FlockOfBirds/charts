import { Component, ReactChild, ReactElement, createElement } from "react";

import { Alert } from "../../components/Alert";
import { ChartLoading } from "../../components/ChartLoading";
import { SeriesPlayground } from "../../components/SeriesPlayground";
import { PlotlyChart } from "../../components/PlotlyChart";

import { getRuntimeTraces, getSeriesTraces } from "../../utils/data";
import deepMerge from "deepmerge";
import { Container, Data } from "../../utils/namespaces";
import { Config, Layout, ScatterData, ScatterHoverData } from "plotly.js";
import { getDimensions, parseStyle } from "../../utils/style";

import SeriesData = Data.SeriesData;
import LineChartContainerProps = Container.LineChartContainerProps;
import SeriesProps = Data.SeriesProps;
import LineMode = Container.LineMode;
import LineSeriesProps = Data.LineSeriesProps;

import "../../ui/Charts.scss";

export interface LineChartProps extends LineChartContainerProps {
    data?: SeriesData<LineSeriesProps>[];
    defaultData?: ScatterData[];
    loading?: boolean;
    alertMessage?: ReactChild;
    onClick?: (series: SeriesProps, dataObject: mendix.lib.MxObject, mxform: mxui.lib.form._FormBase) => void;
    onHover?: (node: HTMLDivElement, tooltipForm: string, dataObject: mendix.lib.MxObject) => void;
}

interface LineChartState {
    layoutOptions: string;
    data?: SeriesData<LineSeriesProps>[];
    playgroundLoaded: boolean;
}

export class LineChart extends Component<LineChartProps, LineChartState> {
    private tooltipNode?: HTMLDivElement;
    private defaultColors: string[] = [ "#2CA1DD", "#76CA02", "#F99B1D", "#B765D1" ];
    private Playground?: typeof SeriesPlayground;

    constructor(props: LineChartProps) {
        super(props);

        this.onClick = this.onClick.bind(this);
        this.onHover = this.onHover.bind(this);
        this.onRuntimeUpdate = this.onRuntimeUpdate.bind(this);
        this.getTooltipNodeRef = this.getTooltipNodeRef.bind(this);
        this.state = {
            layoutOptions: props.layoutOptions,
            data: props.data,
            playgroundLoaded: false
        };
    }

    render() {
        if (this.props.alertMessage) {
            return createElement(Alert, { className: "widget-charts-line-alert" }, this.props.alertMessage);
        }
        if (this.props.loading || (this.props.devMode === "developer" && !this.state.playgroundLoaded)) {
            return createElement(ChartLoading, { text: "Loading" });
        }
        if (this.props.devMode === "developer" && this.state.playgroundLoaded) {
            return this.renderPlayground();
        }

        return this.renderLineChart();
    }

    componentWillReceiveProps(newProps: LineChartProps) {
        this.setState({
            layoutOptions: newProps.layoutOptions,
            data: newProps.data
        });
        if (newProps.devMode === "developer" && !this.state.playgroundLoaded) {
            this.loadPlaygroundComponent();
        }
    }

    private async loadPlaygroundComponent() {
        const { SeriesPlayground: PlaygroundImport } = await import("../../components/SeriesPlayground");
        this.Playground = PlaygroundImport;
        this.setState({ playgroundLoaded: true });
    }

    private renderLineChart(): ReactElement<any> {
        return createElement(PlotlyChart,
            {
                type: "line",
                className: this.props.class,
                style: { ...getDimensions(this.props), ...parseStyle(this.props.style) },
                layout: this.getLayoutOptions(this.props),
                data: this.getData(this.props),
                config: LineChart.getConfigOptions(),
                onClick: this.onClick,
                onHover: this.onHover,
                getTooltipNode: this.getTooltipNodeRef
            }
        );
    }

    private renderPlayground(): ReactElement<any> | null {
        if (this.Playground) {
            // return createElement(this.Playground, {
            //     rawData: this.state.data,
            //     chartData: this.getData(this.props),
            //     modelerSeriesConfigs: this.state.data && this.state.data.map(({ series }) =>
            //         JSON.stringify(LineChart.getDefaultSeriesOptions(series as LineSeriesProps, this.props), null, 4)
            //     ),
            //     traces: this.state.data && this.state.data.map(getRuntimeTraces),
            //     onChange: this.onRuntimeUpdate,
            //     layoutOptions: this.state.layoutOptions || "{\n\n}",
            //     modelerLayoutConfigs: JSON.stringify(LineChart.defaultLayoutConfigs(this.props), null, 4)
            // }, this.renderLineChart());
            return null;
        }

        return null;
    }

    private getTooltipNodeRef(node: HTMLDivElement) {
        this.tooltipNode = node;
    }

    private getLayoutOptions(props: LineChartProps): Partial<Layout> {
        const advancedOptions = props.devMode !== "basic" && this.state.layoutOptions
            ? JSON.parse(this.state.layoutOptions)
            : {};

        return deepMerge.all([ LineChart.defaultLayoutConfigs(props), advancedOptions ]);
    }

    private getData(props: LineChartProps): ScatterData[] {
        let lineData: ScatterData[] = props.defaultData || [];
        if (this.state.data) {
            lineData = this.state.data.map(({ data, series }, index) => {
                const advancedOptions = props.devMode !== "basic" && series.seriesOptions
                    ? JSON.parse(series.seriesOptions)
                    : {};
                const configOptions: Partial<ScatterData> = {
                    series,
                    marker: index < this.defaultColors.length ? { color: this.defaultColors[index] } : {},
                    fillcolor: series.fillColor,
                    ... LineChart.getDefaultSeriesOptions(series as LineSeriesProps, props),
                    ... getSeriesTraces({ data, series })
                };

                // deepmerge doesn't go into the prototype chain, so it can't be used for copying mxObjects
                return {
                    ...deepMerge.all<ScatterData>([ configOptions, advancedOptions ]),
                    customdata: data
                };
            });
        }

        return props.area === "stacked" ? LineChart.getStackedArea(lineData) : lineData;
    }

    private onClick({ points }: ScatterHoverData<mendix.lib.MxObject>) {
        if (this.props.onClick) {
            this.props.onClick(points[0].data.series, points[0].customdata, this.props.mxform);
        }
    }

    private onHover({ points }: ScatterHoverData<mendix.lib.MxObject>) {
        const { customdata, data, x, xaxis, y, yaxis } = points[0];
        if (this.props.onHover && data.series.tooltipForm && this.tooltipNode) {
            const positionYaxis = yaxis.l2p(y as number) + yaxis._offset;
            const positionXaxis = xaxis.d2p(x) + xaxis._offset;
            this.tooltipNode.style.top = `${positionYaxis}px`;
            this.tooltipNode.style.left = `${positionXaxis}px`;
            this.tooltipNode.style.opacity = "1";
            this.props.onHover(this.tooltipNode, data.series.tooltipForm, customdata);
        }
    }

    private onRuntimeUpdate(layoutOptions: string, data: SeriesData<LineSeriesProps>[]) {
        this.setState({ layoutOptions, data });
    }

    public static defaultLayoutConfigs(props: LineChartProps): Partial<Layout> {
        return {
            font: {
                family: "Open Sans, sans-serif",
                size: 12,
                color: "#888"
            },
            autosize: true,
            hovermode: "closest",
            showlegend: props.showLegend,
            xaxis: {
                gridcolor: "#eaeaea",
                title: props.xAxisLabel,
                showgrid: props.grid === "vertical" || props.grid === "both",
                fixedrange: props.xAxisType !== "date",
                type: props.xAxisType,
                rangeslider: { visible: props.showRangeSlider || false }
            },
            yaxis: {
                rangemode: "tozero",
                zeroline: true,
                zerolinecolor: "#eaeaea",
                gridcolor: "#eaeaea",
                title: props.yAxisLabel,
                showgrid: props.grid === "horizontal" || props.grid === "both",
                fixedrange: true
            },
            hoverlabel: {
                bgcolor: "#888",
                bordercolor: "#888",
                font: {
                    color: "#FFF"
                }
            },
            margin: {
                l: 60,
                r: 60,
                b: 60,
                t: 10,
                pad: 10
            }
        };
    }

    public static getConfigOptions(): Partial<Config> {
        return { displayModeBar: false, doubleClick: false };
    }

    public static getDefaultSeriesOptions(series: LineSeriesProps, props: LineChartProps): Partial<ScatterData> {
        return {
            connectgaps: true,
            hoveron: "points",
            hoverinfo: series.tooltipForm ? "text" : "y" as any, // typings don't have a hoverinfo value of "y"
            line: {
                color: series.lineColor,
                shape: series.lineStyle
            },
            mode: series.mode ? series.mode.replace("X", "+") as LineMode : "lines",
            name: series.name,
            type: "scatter",
            fill: props.fill || series.fill ? "tonexty" : "none"
        };
    }

    public static getStackedArea(traces: ScatterData[]) {
        for (let i = 1; i < traces.length; i++) {
            for (let j = 0; j < (Math.min(traces[i].y.length, traces[i - 1].y.length)); j++) {
                (traces[i].y[j] as any) += traces[i - 1].y[j];
            }
        }

        return traces;
    }
}
