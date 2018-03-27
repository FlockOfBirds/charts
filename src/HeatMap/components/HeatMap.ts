import { Component, ReactChild, ReactElement, createElement } from "react";
import { render, unmountComponentAtNode } from "react-dom";

import { Alert } from "../../components/Alert";
import { ChartLoading } from "../../components/ChartLoading";
import { HoverTooltip } from "../../components/HoverTooltip";

import { Container } from "../../utils/namespaces";
import HeatMapContainerProps = Container.HeatMapContainerProps;

import deepMerge from "deepmerge";
import { PiePlayground } from "../../PieChart/components/PiePlayground";
import { PlotlyChart } from "../../components/PlotlyChart";
import { HeatMapData, Layout, ScatterHoverData } from "plotly.js";
import { getDimensions, getTooltipCoordinates, parseStyle, setTooltipPosition } from "../../utils/style";

import "../../ui/Charts.scss";

export interface HeatMapProps extends HeatMapContainerProps {
    data?: HeatMapData;
    defaultData?: HeatMapData;
    alertMessage?: ReactChild;
    loading?: boolean;
    onClick?: (x: string, y: string, z: number) => void;
    onHover?: (node: HTMLDivElement, x: string, y: string, z: number) => void;
}

interface HeatMapState {
    layoutOptions: string;
    dataOptions: string;
    playgroundLoaded: boolean;
}

export interface PieTraces {
    labels: string[];
    values: number[];
}

export class HeatMap extends Component<HeatMapProps, HeatMapState> {
    state: HeatMapState = {
        layoutOptions: this.props.layoutOptions,
        dataOptions: this.props.dataOptions,
        playgroundLoaded: false
    };
    private tooltipNode?: HTMLDivElement;
    private Playground?: typeof PiePlayground;

    constructor(props: HeatMapProps) {
        super(props);

        if (props.devMode === "developer") {
            this.loadPlaygroundComponent();
        }
    }

    render() {
        if (this.props.alertMessage) {
            return createElement(Alert, { className: `widget-heat-map-alert` },
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

    private getTooltipNodeRef = (node: HTMLDivElement) => {
        this.tooltipNode = node;
    }

    private async loadPlaygroundComponent() {
        const { PiePlayground: PlaygroundImport } = await import("../../PieChart/components/PiePlayground");
        this.Playground = PlaygroundImport;
        this.setState({ playgroundLoaded: true });
    }

    private renderChart() {
        return createElement(PlotlyChart,
            {
                type: "heatmap",
                className: this.props.class,
                style: { ...getDimensions(this.props), ...parseStyle(this.props.style) },
                data: this.getData(this.props),
                layout: this.getLayoutOptions(this.props),
                config: { displayModeBar: false, doubleClick: false },
                onClick: this.onClick,
                onHover: this.onHover,
                getTooltipNode: this.getTooltipNodeRef
            }
        );
    }

    private renderPlayground(): ReactElement<any> | null {
        if (this.Playground) {
            return createElement(this.Playground, {
                dataOptions: this.state.dataOptions || "{\n\n}",
                modelerDataConfigs: JSON.stringify(HeatMap.getDefaultDataOptions(this.props), null, 4),
                onChange: this.onRuntimeUpdate,
                layoutOptions: this.state.layoutOptions || "{\n\n}",
                modelerLayoutConfigs: JSON.stringify(HeatMap.getDefaultLayoutOptions(this.props), null, 4)
            }, this.renderChart());
        }

        return null;
    }

    private getData(props: HeatMapProps): HeatMapData[] {
        if (this.props.data) {
            const advancedOptions = props.devMode !== "basic" && this.state.dataOptions
                ? JSON.parse(this.state.dataOptions)
                : {};

            const data: HeatMapData = deepMerge.all([
                {
                    ...HeatMap.getDefaultDataOptions(props),
                    x: this.props.data.x,
                    y: this.props.data.y,
                    z: this.props.data.z,
                    text: this.props.data.z.map((row, i) => row.map((item, j) => `${item}`)),
                    zsmooth: props.smoothColor ? "best" : false
                },
                advancedOptions
            ]);
            data.colorscale = advancedOptions.colorscale || data.colorscale;

            return [ data ];
        }

        return this.props.defaultData ? [ { ...this.props.defaultData, type: "heatmap" } ] : [];
    }

    private getLayoutOptions(props: HeatMapProps): Partial<Layout> {
        const advancedOptions = props.devMode !== "basic" && this.state.layoutOptions
            ? JSON.parse(this.state.layoutOptions)
            : {};

        return deepMerge.all([
            HeatMap.getDefaultLayoutOptions(props),
            {
                annotations: props.showValues
                    ? this.getTextAnnotations(props.data || props.defaultData, props.valuesColor)
                    : undefined
            },
            advancedOptions
        ]);
    }

    private getTextAnnotations(data?: HeatMapData, valuesColor = "") {
        const annotations: {}[] = [];
        if (data) {
            for (let i = 0; i < data.y.length; i++) {
                for (let j = 0; j < data.x.length; j++) {
                    const currentValue = data.z[ i ][ j ];
                    // TODO: use contrast suggestion Andries made
                    const textColor = currentValue !== 0.0 ? "white" : "black";
                    const result = {
                        xref: "x1",
                        yref: "y1",
                        x: data.x[ j ],
                        y: data.y[ i ],
                        text: data.z[ i ][ j ],
                        font: {
                            family: "Open Sans",
                            size: 14,
                            color: this.props.valuesColor || "#555"
                        },
                        showarrow: false
                    };
                    annotations.push(result);
                }
            }
        }

        return annotations;
    }

    private onClick = ({ points }: ScatterHoverData<any>) => {
        if (this.props.onClick) {
            this.props.onClick(points[ 0 ].x as string, points[ 0 ].y as string, points[ 0 ].z as number);
        }
    }

    private onHover = ({ points, event }: ScatterHoverData<any>) => {
        const { x, xaxis, y, yaxis, z, text } = points[0];
        if (event && this.tooltipNode) {
            unmountComponentAtNode(this.tooltipNode);
            const coordinates = getTooltipCoordinates(event, this.tooltipNode);
            if (coordinates) {
                setTooltipPosition(this.tooltipNode, coordinates);
                if (this.props.onHover) {
                    this.props.onHover(this.tooltipNode, x as string, y as string, z as number);
                } else if (points[0].data.hoverinfo === "none" as any) {
                    render(createElement(HoverTooltip, { text: text || z }), this.tooltipNode);
                } else {
                    this.tooltipNode.style.opacity = "0";
                }
            }
        }
    }

    private onRuntimeUpdate = (layoutOptions: string, dataOptions: string) => {
        this.setState({ layoutOptions, dataOptions });
    }

    public static getDefaultLayoutOptions(props: HeatMapProps): Partial<Layout> {
        return {
            font: {
                family: "Open Sans",
                size: 14,
                color: "#555"
            },
            autosize: true,
            showarrow: false,
            xaxis: {
                fixedrange: true,
                title: props.xAxisLabel,
                ticks: ""
            },
            yaxis: {
                fixedrange: true,
                title: props.yAxisLabel,
                ticks: ""
            },
            hoverlabel: {
                bgcolor: "#888",
                bordercolor: "#888",
                font: {
                    color: "#FFF"
                }
            },
            margin: {
                l: 80,
                r: 60,
                b: 60,
                t: 10,
                pad: 10
            }
        };
    }

    public static getDefaultDataOptions(props: HeatMapProps): Partial<HeatMapData> {
        return {
            type: "heatmap",
            hoverinfo: "none",
            showscale: props.data && props.data.showscale,
            colorscale: props.data && props.data.colorscale,
            xgap: 1,
            ygap: 1,
            colorbar: {
                y: 1,
                yanchor: "top",
                ypad: 0,
                xpad: 5,
                outlinecolor: "#9ba492"
            }
        };
    }
}
