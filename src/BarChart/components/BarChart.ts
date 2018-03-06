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
import * as sharedLayoutConfigs from "../../common/layout.json";

import "../../ui/Charts.scss";

export interface BarChartProps extends Container.BarChartContainerProps {
    alertMessage?: ReactChild;
    loading?: boolean;
    data?: Data.SeriesData[];
    defaultData?: ScatterData[];
    onClick?: (series: Data.SeriesProps, dataObject: mendix.lib.MxObject, mxform: mxui.lib.form._FormBase) => void;
    onHover?: (node: HTMLDivElement, tooltipForm: string, dataObject: mendix.lib.MxObject) => void;
}

interface BarChartState {
    layoutOptions: string;
    data?: Data.SeriesData[];
    playgroundLoaded: boolean;
}

export class BarChart extends Component<BarChartProps, BarChartState> {
    private tooltipNode?: HTMLDivElement;
    private defaultColors: string[] = [ "#2CA1DD", "#76CA02", "#F99B1D", "#B765D1" ];
    private Playground?: typeof SeriesPlayground;

    constructor(props: BarChartProps) {
        super(props);

        this.getTooltipNodeRef = this.getTooltipNodeRef.bind(this);
        this.onClick = this.onClick.bind(this);
        this.onHover = this.onHover.bind(this);
        this.onRuntimeUpdate = this.onRuntimeUpdate.bind(this);
        this.state = {
            layoutOptions: props.layoutOptions,
            data: props.data,
            playgroundLoaded: false
        };
    }

    render() {
        if (this.props.alertMessage) {
            return createElement(Alert, { className: "widget-charts-bar-alert" }, this.props.alertMessage);
        }
        if (this.props.loading || (this.props.devMode === "developer" && !this.state.playgroundLoaded)) {
            return createElement(ChartLoading, { text: "Loading" });
        }
        if (this.props.devMode === "developer" && this.state.playgroundLoaded) {
            return this.renderPlayground();
        }

        return this.renderChart();
    }

    componentWillReceiveProps(newProps: BarChartProps) {
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

    private getTooltipNodeRef(node: HTMLDivElement) {
        this.tooltipNode = node;
    }

    private renderChart() {
        return createElement(PlotlyChart,
            {
                type: "bar",
                className: this.props.class,
                style: { ...getDimensions(this.props), ...parseStyle(this.props.style) },
                layout: this.getLayoutOptions(this.props),
                data: this.getData(this.props),
                config: BarChart.getConfigOptions(),
                onClick: this.onClick,
                onHover: this.onHover,
                getTooltipNode: this.getTooltipNodeRef
            }
        );
    }

    private renderPlayground(): ReactElement<any> | null {
        if (this.Playground) {
            return createElement(this.Playground, {
                rawData: this.state.data,
                chartData: this.getData(this.props),
                modelerSeriesConfigs: this.state.data && this.state.data.map(({ series }) =>
                    JSON.stringify(BarChart.getDefaultSeriesOptions(series, this.props), null, 4)
                ),
                traces: this.state.data && this.state.data.map(getRuntimeTraces),
                onChange: this.onRuntimeUpdate,
                layoutOptions: this.state.layoutOptions || "{\n\n}",
                modelerLayoutConfigs: JSON.stringify(BarChart.defaultLayoutConfigs(this.props), null, 4)
            }, this.renderChart());
        }

        return null;
    }

    private getLayoutOptions(props: BarChartProps): Partial<Layout> {
        const advancedOptions = props.devMode !== "basic" && this.state.layoutOptions
            ? JSON.parse(this.state.layoutOptions)
            : {};

        return deepMerge.all([ BarChart.defaultLayoutConfigs(props), advancedOptions ]);
    }

    private getData(props: BarChartProps): ScatterData[] {
        if (props.data) {
            return props.data.map(({ data, series }, index) => {
                const rawOptions = props.devMode !== "basic" && series.seriesOptions
                    ? JSON.parse(series.seriesOptions)
                    : {};
                const traces = getSeriesTraces({ data, series });
                const configOptions: Partial<ScatterData> = {
                    x: props.orientation === "bar" ? traces.y : traces.x,
                    y: props.orientation === "bar" ? traces.x : traces.y,
                    series,
                    marker: !series.barColor && index < this.defaultColors.length
                        ? { color: this.defaultColors[index] }
                        : { color: series.barColor },
                    ... BarChart.getDefaultSeriesOptions(series, props)
                };

                // deepmerge doesn't go into the prototype chain, so it can't be used for copying mxObjects
                return {
                    ...deepMerge.all<ScatterData>([ configOptions, rawOptions ]),
                    customdata: data
                };
            });
        }

        return props.defaultData || [];
    }

    private onClick(data: ScatterHoverData<mendix.lib.MxObject>) {
        const pointClicked = data.points[0];
        if (this.props.onClick) {
            this.props.onClick(pointClicked.data.series, pointClicked.customdata, this.props.mxform);
        }
    }

    private onHover({ points }: ScatterHoverData<mendix.lib.MxObject>) {
        const { customdata, data, x, xaxis, y, yaxis } = points[0];
        if (this.props.onHover && data.series.tooltipForm && this.tooltipNode) {
            const yAxisPixels = typeof y === "number" ? yaxis.l2p(y) : yaxis.d2p(y);
            const xAxisPixels = typeof x === "number" ? xaxis.l2p(x as number) : xaxis.d2p(x);
            const positionYaxis = yAxisPixels + yaxis._offset;
            const positionXaxis = xAxisPixels + xaxis._offset;
            this.tooltipNode.style.top = `${positionYaxis}px`;
            this.tooltipNode.style.left = `${positionXaxis}px`;
            this.tooltipNode.style.opacity = "1";
            this.props.onHover(this.tooltipNode, data.series.tooltipForm, customdata);
        }
    }

    private onRuntimeUpdate(layoutOptions: string, data: Data.SeriesData[]) {
        this.setState({ layoutOptions, data });
    }

    private static getConfigOptions(): Partial<Config> {
        return { displayModeBar: false, doubleClick: false };
    }

    private static getDefaultSeriesOptions(series: Data.SeriesProps, props: BarChartProps): Partial<ScatterData> {
        const hoverinfo = (props.orientation === "bar" ? "x" : "y") as any;

        return {
            name: series.name,
            type: "bar",
            hoverinfo: series.tooltipForm ? "text" : hoverinfo, // typings don't have a hoverinfo value of "y"
            orientation: props.orientation === "bar" ? "h" : "v"
        };
    }

    public static defaultLayoutConfigs(props: BarChartProps): Partial<Layout> {
        const dynamicConfigs = {
            barmode: props.barMode,
            showlegend: props.showLegend,
            xaxis: {
                zerolinecolor: props.orientation === "bar" ? "#eaeaea" : undefined,
                title: props.xAxisLabel,
                showgrid: props.grid === "vertical" || props.grid === "both"
            },
            yaxis: {
                title: props.yAxisLabel,
                showgrid: props.grid === "horizontal" || props.grid === "both"
            }
        };

        return deepMerge.all([ sharedLayoutConfigs, dynamicConfigs ]);
    }
}
