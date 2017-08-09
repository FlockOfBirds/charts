import { Component, createElement } from "react";
import { BarData, BarLayout, Config, PlotlyStatic } from "plotly.js";

interface BarChartProps {
    data?: BarData[];
    layout?: Partial<BarLayout>;
    config?: Partial<Config>;
}

class BarChart extends Component<BarChartProps, {}> {
    private plotlyNode: HTMLDivElement;
    private Plotly: PlotlyStatic;
    private data: BarData[] = [
        {
            type: "bar",
            x: [ "Sample 1", "Sample 2", "Sample 3", "Sample 4", "Sample 5", "Sample 6", "Sample 7" ],
            y: [ 20, 14, 23, 25, 50, 32, 44 ]
        }
    ];

    constructor(props: BarChartProps) {
        super(props);

        this.Plotly = require("plotly.js/dist/plotly") as any;

        this.getPlotlyNodeRef = this.getPlotlyNodeRef.bind(this);
    }

    render() {
        return createElement("div", { className: "widget-plotly-bar", ref: this.getPlotlyNodeRef });
    }

    componentDidMount() {
        this.renderChart(this.props.data);
    }

    componentWillReceiveProps(newProps: BarChartProps) {
        this.renderChart(newProps.data);
    }

    // componentWillUnmount() {
    //     if (this.plotlyNode) {
    //         this.Plotly.purge(this.plotlyNode);
    //     }
    // }

    private getPlotlyNodeRef(node: HTMLDivElement) {
        this.plotlyNode = node;
    }

    private renderChart(data?: BarData[]) {
        if (this.plotlyNode) {
            this.Plotly.newPlot(
                this.plotlyNode,
                data && data.length ? data : this.data, this.props.layout,
                this.props.config
            );
        }
    }
}

export { BarChart };
