// tslint:disable no-console
import { Component, createElement } from "react";

import { BarData, BarMode, Datum } from "plotly.js";
import { BarChart } from "./BarChart";

interface WrapperProps {
    class?: string;
    mxform: mxui.lib.form._FormBase;
    mxObject?: mendix.lib.MxObject;
    style?: string;
    readOnly: boolean;
}

interface BarChartContainerProps extends WrapperProps {
    width: number;
    widthUnit: WidthUnit;
    height: number;
    heightUnit: HeightUnit;
    barMode: BarMode;
    dataSourceMicroflow: string;
    title?: string;
    seriesEntity: string;
    seriesNameAttribute: string;
    showGrid: boolean;
    showToolbar: boolean;
    sourceType: "xpath" | "microflow";
    dataEntity: string;
    xValueAttribute: string;
    yValueAttribute: string;
    xAxisSortAttribute: string;
}

interface BarChartContainerState {
    data?: BarData[];
}

type WidthUnit = "percentage" | "pixels";
type HeightUnit = "percentageOfWidth" | "percentageOfParent" | "pixels";

class BarChartContainer extends Component<BarChartContainerProps, BarChartContainerState> {
    private subscriptionHandles: number[] = [];
    private data: BarData[] = [];

    constructor(props: BarChartContainerProps) {
        super(props);

        this.state = { data: [] };
        this.handleSubscription = this.handleSubscription.bind(this);
    }

    render() {
        return createElement(BarChart, {
            config: {
                displayModeBar: this.props.showToolbar
            },
            data: this.state.data,
            layout: {
                barmode: this.props.barMode,
                title: this.props.title,
                yaxis: { showgrid: this.props.showGrid }
            }
        });
    }

    componentWillReceiveProps(newProps: BarChartContainerProps) {
        this.resetSubscriptions(newProps.mxObject);
        this.fetchAndProcessData(newProps.mxObject);
    }

    private resetSubscriptions(mxObject?: mendix.lib.MxObject) {
        this.subscriptionHandles.forEach(mx.data.unsubscribe);
        this.subscriptionHandles = [];

        if (mxObject) {
            this.subscriptionHandles.push(mx.data.subscribe({
                callback: this.handleSubscription,
                guid: mxObject.getGuid()
            }));
        }
    }

    private handleSubscription() {
        this.fetchAndProcessData(this.props.mxObject);
    }

    private fetchAndProcessData(mxObject?: mendix.lib.MxObject) {
        if (mxObject && this.props.seriesEntity) {
            mxObject.fetch(this.props.seriesEntity, (series: mendix.lib.MxObject[]) => {
                const seriesCount = series.length;
                series.forEach((object, index) => {
                    if (this.props.sourceType === "xpath") {
                        object.fetch(this.props.dataEntity, (values: mendix.lib.MxObject[]) => {
                            window.mx.data.get({
                                callback: seriesData => {
                                    const barData = this.processData(seriesData);
                                    this.addSeries(barData, seriesCount === index + 1);
                                },
                                error: error => console.log(error),
                                filter: {
                                    sort: [ [ this.props.xAxisSortAttribute, "asc" ] ]
                                },
                                guids: values.map(value => value.getGuid())
                            });
                        });
                    } else if (this.props.sourceType === "microflow") {
                        object.fetch(this.props.dataEntity, (values: mendix.lib.MxObject[]) => {
                            const actionname = this.props.dataSourceMicroflow;
                            mx.ui.action(actionname, {
                                callback: (seriesData: mendix.lib.MxObject[]) => {
                                    const barData = this.processData(seriesData);
                                    this.addSeries(barData, seriesCount === index + 1);
                                },
                                error: () => this.setState({
                                    data: []
                                }),
                                params: {
                                    applyto: "selection",
                                    guids: values.map(value => value.getGuid())
                                }
                            });
                        });
                    }
                });
            });
        }
    }

    private processData(seriesData: mendix.lib.MxObject[]) {
        const fetchedData = seriesData.map(value => {
            return {
                x: value.get(this.props.xValueAttribute) as Datum,
                y: parseInt(value.get(this.props.yValueAttribute) as string, 10) as Datum
            };
        });

        const barData: BarData = {
            name: this.props.seriesNameAttribute,
            type: "bar",
            x: fetchedData.map(value => value.x),
            y: fetchedData.map(value => value.y)
        };

        return barData;
    }

    private addSeries(series: BarData, isFinal = false) {
        this.data.push(series);
        if (isFinal) {
            this.setState({ data: this.data });
        }
    }

    public static parseStyle(style = ""): {[key: string]: string} {
        try {
            return style.split(";").reduce<{[key: string]: string}>((styleObject, line) => {
                const pair = line.split(":");
                if (pair.length === 2) {
                    const name = pair[0].trim().replace(/(-.)/g, match => match[1].toUpperCase());
                    styleObject[name] = pair[1].trim();
                }
                return styleObject;
            }, {});
        } catch (error) {
            window.console.log("Failed to parse style", style, error);
        }

        return {};
    }
}

export { BarChartContainer as default, BarChartContainerProps };
