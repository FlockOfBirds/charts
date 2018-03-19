
// tslint:disable no-console
import { Component, ReactChild, createElement } from "react";
import { render, unmountComponentAtNode } from "react-dom";

import { Alert } from "../../components/Alert";
import { ChartLoading } from "../../components/ChartLoading";
import { PlotlyChart } from "../../components/PlotlyChart";

import deepMerge from "deepmerge";
import { Style } from "../../utils/namespaces";
import { Layout } from "plotly.js";
import { getDimensions, getTooltipCoordinates, parseStyle, setTooltipPosition } from "../../utils/style";
import { WrapperProps } from "../../utils/types";

import "../../ui/Charts.scss";
import { HoverTooltip } from "../../components/HoverTooltip";
// TODO improve typing by replace explicit any types

export interface AnyChartProps extends WrapperProps, Style.Dimensions {
    alertMessage?: ReactChild;
    loading?: boolean;
    dataStatic: string;
    layoutStatic: string;
    attributeData: string;
    attributeLayout: string;
    onClick?: (data: any) => void;
    onHover?: (data: any, node: HTMLDivElement) => void;
}

export class AnyChart extends Component<AnyChartProps> {
    private tooltipNode?: HTMLDivElement;

    constructor(props: AnyChartProps) {
        super(props);

        this.getTooltipNodeRef = this.getTooltipNodeRef.bind(this);
        this.onClick = this.onClick.bind(this);
        this.onHover = this.onHover.bind(this);

        this.state = {
            layoutStatic: props.layoutStatic,
            dataStatic: props.dataStatic,
            attributeLayout: props.attributeLayout,
            attributeData: props.attributeData
        };
    }

    render() {
        if (this.props.alertMessage) {
            return createElement(Alert, { className: `widget-charts-any-alert` },
                this.props.alertMessage
            );
        }
        if (this.props.loading) {
            return createElement(ChartLoading, { text: "Loading" });
        }

        return this.renderChart();
    }

    componentDidMount() {
        if (!this.props.loading) {
            this.renderChart();
        }
    }

    componentDidUpdate() {
        if (!this.props.loading) {
            this.renderChart();
        }
    }

    private getTooltipNodeRef(node: HTMLDivElement) {
        if (node) {
            this.tooltipNode = node;
        }
    }

    private renderChart() {
        return createElement(PlotlyChart, {
            type: "full",
            className: this.props.class,
            style: { ...getDimensions(this.props), ...parseStyle(this.props.style) },
            layout: this.getLayoutOptions(this.props),
            data: this.getData(this.props),
            config: {},
            onClick: this.onClick,
            onHover: this.onHover,
            getTooltipNode: this.getTooltipNodeRef
        });
    }

    private getData(props: AnyChartProps): any[] {
            try {
                const staticData = JSON.parse(props.dataStatic || "[]");

                return props.attributeData
                    ? deepMerge.all([ staticData, JSON.parse(props.attributeData) ])
                    : staticData;
            } catch (error) {
                console.error("Failed convert data into JSON: ", props.dataStatic, props.attributeData, error);

                return [];
            }
    }

    private getLayoutOptions(props: AnyChartProps): Partial<Layout> {
        const arrayMerge = (_destinationArray: any[], sourceArray: any[]) => sourceArray;
        try {
            const staticLayout = JSON.parse(props.layoutStatic || "{}");

            return props.attributeData
                ? deepMerge.all([ staticLayout, JSON.parse(props.attributeLayout) ], { arrayMerge }) as Partial<Layout>
                : staticLayout;

        } catch (error) {
            console.error("Failed convert layout to JSON: ", props.dataStatic, props.attributeData, error);

            return {};
        }
    }

    private onClick({ points }: any) {
        if (this.props.onClick) {
            this.props.onClick(this.copyPoints(points));
        }
    }

    private onHover({ points, event }: any) {
        if (event && this.tooltipNode) {
            const { x, xaxis, y, yaxis, z, text } = points[0];
            unmountComponentAtNode(this.tooltipNode);
            const coordinates = getTooltipCoordinates(event, this.tooltipNode);
            if (coordinates) {
                setTooltipPosition(this.tooltipNode, coordinates);
                if (this.props.onHover) {
                    this.props.onHover(this.copyPoints(points), this.tooltipNode);
                } else {
                    render(createElement(HoverTooltip, { text: z || text || y }), this.tooltipNode);
                }
            }
        }
    }

    private copyPoints(points: any[]): any[] {
        return points.map((point) => {
            const result: any = {};
            for (const key in point) {
                if (key !== "fullData" && key !== "xaxis" && key !== "yaxis" && point.hasOwnProperty(key)) {
                    result[key] = point[key];
                }
            }

            return result;
        });
    }

}