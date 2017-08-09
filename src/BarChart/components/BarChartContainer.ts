import { Component, createElement } from "react";

import { BarData, BarMode, Datum } from "plotly.js";
import { BarChart } from "./BarChart";
import { Alert } from "./Alert";

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
    entityConstraint: string;
    title?: string;
    seriesEntity: string;
    seriesNameAttribute: string;
    showGrid: boolean;
    showToolbar: boolean;
    sourceType: "xpath" | "microflow";
    dataEntity: string;
    xAxisLabel: string;
    xValueAttribute: string;
    yAxisLabel: string;
    yValueAttribute: string;
    xAxisSortAttribute: string;
}

interface BarChartContainerState {
    alertMessage?: string;
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
        if (this.props.mxObject) {
            if (this.state.alertMessage) {
                return createElement(Alert, { bootstrapStyle: "danger", message: this.state.alertMessage });
            }
            return createElement(BarChart, {
                config: {
                    displayModeBar: this.props.showToolbar
                },
                data: this.state.data,
                layout: {
                    barmode: this.props.barMode,
                    title: this.props.title,
                    xaxis: { title: this.props.xAxisLabel },
                    yaxis: {
                        showgrid: this.props.showGrid,
                        title: this.props.yAxisLabel
                    }
                }
            });
        } else {
            return createElement("div", {});
        }
    }

    componentWillReceiveProps(newProps: BarChartContainerProps) {
        this.resetSubscriptions(newProps.mxObject);
        this.fetchData(newProps.mxObject);
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
        this.fetchData(this.props.mxObject);
    }

    private fetchData(mxObject?: mendix.lib.MxObject) {
        const { seriesEntity } = this.props;
        if (mxObject && this.props.seriesEntity) {
                if (this.props.sourceType === "xpath") {
                    const constraint = this.props.entityConstraint
                        ? this.props.entityConstraint.replace("[%CurrentObject%]", mxObject.getGuid())
                        : "";
                    const entityName = seriesEntity.indexOf("/") > -1
                        ? seriesEntity.split("/")[seriesEntity.split("/").length - 1]
                        : seriesEntity;
                    const Xpath = "//" + entityName + constraint;
                    this.fetchByXpath(Xpath);
                } else if (this.props.sourceType === "microflow" && this.props.dataSourceMicroflow) {
                    this.fetchByMicroflow(mxObject.getGuid());
                }
        }
    }

    private fetchByXpath(xpath: string) {
        window.mx.data.get({
            callback: mxObjects => this.fetchDataFromSeries(mxObjects),
            error: error => this.setState({
                alertMessage: `An error occurred while retrieving data via XPath (${xpath}): ${error}`,
                data: []
            }),
            filter: {
                sort: [ [ this.props.xAxisSortAttribute, "asc" ] ]
            },
            xpath
        });
    }

    private fetchByMicroflow(guid: string) {
        const actionname = this.props.dataSourceMicroflow;
        mx.ui.action(actionname, {
            callback: mxObjects => {
                const series = mxObjects as mendix.lib.MxObject[];
                this.fetchDataFromSeries(series);
            },
            error: error => this.setState({
                alertMessage: `Error while retrieving microflow data ${actionname}: ${error.message}`,
                data: []
            }),
            params: {
                applyto: "selection",
                guids: [ guid ]
            }
        });
    }

    private fetchDataFromSeries(series: mendix.lib.MxObject[]) {
        const seriesCount = series.length;
        series.forEach((object, index) => {
            const seriesName = object.get(this.props.seriesNameAttribute) as string;
            object.fetch(this.props.dataEntity, (values: mendix.lib.MxObject[]) => {
                window.mx.data.get({
                    callback: seriesData => {
                        const fetchedData = seriesData.map(value => {
                            return {
                                x: value.get(this.props.xValueAttribute) as Datum,
                                y: parseInt(value.get(this.props.yValueAttribute) as string, 10) as Datum
                            };
                        });

                        const barData: BarData = {
                            name: seriesName,
                            type: "bar",
                            x: fetchedData.map(value => value.x),
                            y: fetchedData.map(value => value.y)
                        };

                        this.addSeries(barData, seriesCount === index + 1);
                    },
                    error: error => this.setState({
                        alertMessage: `An error occurred while retrieving data values: ${error}`,
                        data: []
                    }),
                    filter: {
                        sort: [ [ this.props.xAxisSortAttribute, "asc" ] ]
                    },
                    guids: values.map(value => value.getGuid())
                });
            });
        });
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
