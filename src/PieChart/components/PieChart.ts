import { Component, ReactChild, ReactElement, createElement } from "react";
import { render, unmountComponentAtNode } from "react-dom";
import deepMerge from "deepmerge";

import { Alert } from "../../components/Alert";
import { ChartLoading } from "../../components/ChartLoading";
import { HoverTooltip } from "../../components/HoverTooltip";
import { PiePlayground } from "./PiePlayground";
import { PlotlyChart } from "../../components/PlotlyChart";

import { arrayMerge, configs } from "../../utils/configs";
import { Container } from "../../utils/namespaces";
import { Config, Layout, PieData, PieHoverData, ScatterHoverData } from "plotly.js";
import { defaultColours, getDimensions, getTooltipCoordinates, parseStyle, setTooltipPosition } from "../../utils/style";
import PieChartContainerProps = Container.PieChartContainerProps;

import "../../ui/Charts.scss";

export interface PieChartProps extends PieChartContainerProps {
    data?: mendix.lib.MxObject[];
    defaultData?: PieData[];
    alertMessage?: ReactChild;
    loading?: boolean;
    themeConfigs: { layout: {}, configuration: {}, data: {} };
    onClick?: (props: PieChartProps, dataObject: mendix.lib.MxObject, mxform: mxui.lib.form._FormBase) => void;
    onHover?: (node: HTMLDivElement, dataObject: mendix.lib.MxObject) => void;
}

interface PieChartState {
    layoutOptions: string;
    dataOptions: string;
    playgroundLoaded: boolean;
    configurationOptions: string;
}

export interface PieTraces {
    labels: string[];
    values: number[];
    colors: string[];
}

export class PieChart extends Component<PieChartProps, PieChartState> {
    state: PieChartState = {
        layoutOptions: this.props.layoutOptions,
        dataOptions: this.props.dataOptions,
        configurationOptions: this.props.configurationOptions,
        playgroundLoaded: false
    };
    private tooltipNode?: HTMLDivElement;
    private Playground?: typeof PiePlayground;

    constructor(props: PieChartProps) {
        super(props);

        if (props.devMode === "developer") {
            this.loadPlaygroundComponent();
        }
    }

    render() {
        if (this.props.alertMessage) {
            return createElement(Alert, { className: `widget-charts-${this.props.chartType}-alert` },
                this.props.alertMessage
            );
        }
        if (this.props.loading || (this.props.devMode === "developer" && !this.state.playgroundLoaded)) {
            return createElement(ChartLoading);
        }
        if (this.props.devMode === "developer" && this.state.playgroundLoaded) {
            return this.renderPlayground();
        }

        return this.renderChart();
    }

    private async loadPlaygroundComponent() {
        const { PiePlayground: PlaygroundImport } = await import("./PiePlayground");
        this.Playground = PlaygroundImport;
        this.setState({ playgroundLoaded: true });
    }

    private getTooltipNodeRef = (node: HTMLDivElement) => {
        this.tooltipNode = node;
    }

    private renderChart() {
        return createElement(PlotlyChart,
            {
                type: "pie",
                className: this.props.class,
                style: { ...getDimensions(this.props), ...parseStyle(this.props.style) },
                layout: this.getLayoutOptions(this.props),
                data: this.getData(this.props),
                config: this.getConfigOptions(this.props),
                onClick: this.onClick,
                onHover: this.onHover,
                getTooltipNode: this.getTooltipNodeRef
            }
        );
    }

    private renderPlayground(): ReactElement<any> | null {
        if (this.Playground) {
            const { themeConfigs } = this.props;
            const modelerLayoutConfigs = deepMerge.all(
                [ PieChart.getDefaultLayoutOptions(this.props), themeConfigs.layout ]
            );
            const modelerDataConfigs = deepMerge.all([ PieChart.getDefaultDataOptions(this.props), themeConfigs.data ]);

            return createElement(this.Playground, {
                dataOptions: this.state.dataOptions || "{\n\n}",
                modelerDataConfigs: JSON.stringify(modelerDataConfigs, null, 2),
                onChange: this.onRuntimeUpdate,
                layoutOptions: this.state.layoutOptions || "{\n\n}",
                modelerLayoutConfigs: JSON.stringify(modelerLayoutConfigs, null, 2),
                configurationOptions: this.state.configurationOptions || "{\n\n}",
                configurationOptionsDefault: JSON.stringify(PieChart.getDefaultConfigOptions(), null, 2)
            }, this.renderChart());
        }

        return null;
    }

    private getData(props: PieChartProps): PieData[] {
        if (props.data && props.data.length) {
            const { dataOptions } = this.state;
            const advancedOptions = props.devMode !== "basic" && dataOptions ? JSON.parse(dataOptions) : {};
            const dataThemeConfigs = props.devMode !== "basic" ? props.themeConfigs.data : {};
            const traces = this.getTraces(props.data);

            return [
                deepMerge.all(
                    [
                        PieChart.getDefaultDataOptions(this.props),
                        {
                            labels: traces.labels,
                            values: traces.values,
                            marker: { colors: traces.colors }
                        },
                        dataThemeConfigs,
                        advancedOptions
                    ],
                    { arrayMerge }
                )
            ];
        }

        return props.defaultData || [];
    }

    private getLayoutOptions(props: PieChartProps): Partial<Layout> {
        const { layoutOptions } = this.state;
        const advancedOptions = props.devMode !== "basic" && layoutOptions ? JSON.parse(layoutOptions) : {};
        const themeLayoutConfigs = props.devMode !== "basic" ? props.themeConfigs.layout : {};

        return deepMerge.all([ PieChart.getDefaultLayoutOptions(props), themeLayoutConfigs, advancedOptions ]);
    }

    private getTraces(data?: mendix.lib.MxObject[]): PieTraces {
        if (data) {
            return {
                labels: data.map(mxObject => mxObject.get(this.props.nameAttribute) as string),
                colors: this.props.colors && this.props.colors.length
                    ? this.props.colors.map(color => color.color)
                    : defaultColours(),
                values: data.map(mxObject => parseFloat(mxObject.get(this.props.valueAttribute) as string))
            };
        }

        return { labels: [], values: [], colors: [] };
    }

    private onClick = ({ points }: ScatterHoverData<any> | PieHoverData) => {
        if (this.props.onClick && this.props.data) {
            this.props.onClick(this.props, this.props.data[points[0].pointNumber], this.props.mxform);
        }
    }

    private onHover = ({ event, points }: PieHoverData) => {
        if (event && this.tooltipNode) {
            unmountComponentAtNode(this.tooltipNode);
            const coordinates = getTooltipCoordinates(event, this.tooltipNode);
            if (coordinates) {
                setTooltipPosition(this.tooltipNode, coordinates);
                if (this.props.onHover && this.props.data) {
                    this.props.onHover(this.tooltipNode, this.props.data[points[0].pointNumber]);
                } else if (points[0].data.hoverinfo === "none") {
                    render(createElement(HoverTooltip, { text: points[0].label }), this.tooltipNode);
                } else {
                    this.tooltipNode.style.opacity = "0";
                }
            }
        }
    }

    private onRuntimeUpdate = (layoutOptions: string, dataOptions: string, configurationOptions: string) => {
        this.setState({ layoutOptions, dataOptions, configurationOptions });
    }

    private static getDefaultConfigOptions(): Partial<Config> {
        return { displayModeBar: false, doubleClick: false };
    }

    public getConfigOptions(props: PieChartProps): Partial<Config> {
        const parsedConfig = props.devMode !== "basic" && this.state.configurationOptions
            ? JSON.parse(this.state.configurationOptions)
            : {};

        return deepMerge.all([ PieChart.getDefaultConfigOptions(), props.themeConfigs.configuration, parsedConfig ]);
    }

    public static getDefaultLayoutOptions(props: PieChartProps): Partial<Layout> {
        const defaultConfigs: Partial<Layout> = {
            font: {
                size: 12
            },
            showlegend: props.showLegend,
            legend: {
                font: {
                    family: "Open Sans",
                    size: 14,
                    color: "#555"
                }
            },
            margin: {
                t: 10
            }
        };

        return deepMerge.all([ configs.layout, defaultConfigs ]);
    }

    public static getDefaultDataOptions(props: PieChartProps): Partial<PieData> {
        return {
            hole: props.chartType === "donut" ? 0.4 : 0,
            hoverinfo: "none",
            type: "pie",
            sort: false
        };
    }
}
