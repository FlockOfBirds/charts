import { AxisType, BarMode, Datum, ScatterData } from "plotly.js";
import { ReactChild } from "react";

export namespace Container {
    import SeriesProps = Data.SeriesProps;

    export interface WrapperProps {
        "class"?: string;
        mxform: mxui.lib.form._FormBase;
        mxObject?: mendix.lib.MxObject;
        style?: string;
        readOnly: boolean;
        friendlyId: string;
    }

    export interface LayoutProps {
        defaultData?: ScatterData[];
        grid: "none" | "horizontal" | "vertical" | "both";
        showLegend: boolean;
        xAxisLabel: string;
        yAxisLabel: string;
        layoutOptions: string;
        devMode: "basic" | "advanced" | "developer";
    }

    export interface BarLayoutProps extends LayoutProps {
        barMode: BarMode;
        orientation: "bar" | "column";
    }

    export interface LineLayoutProps extends LayoutProps {
        fill: boolean;
        area?: "separate" | "stacked";
        showRangeSlider: boolean;
        xAxisType?: AxisType;
    }

    export type LineMode = "lines" | "markers" | "lines+markers" | "none";

    export interface BarChartContainerProps extends WrapperProps, Style.Dimensions, BarLayoutProps {
        series: Data.SeriesProps[];
    }

    export interface BarChartContainerState {
        alertMessage?: ReactChild;
        data?: Data.SeriesData<SeriesProps>[];
        scatterData?: ScatterData[];
        seriesOptions: string[];
        loading?: boolean;
    }

    export interface LineChartContainerProps extends WrapperProps, Style.Dimensions, LineLayoutProps {
        series: Data.LineSeriesProps[];
    }

    export interface LineChartContainerState {
        alertMessage?: ReactChild;
        data?: Data.SeriesData<Data.LineSeriesProps>[];
        scatterData?: ScatterData[];
        seriesOptions: string[];
        loading?: boolean;
    }

    export type PieChartType = "pie" | "donut";

    export interface PieChartContainerProps extends Data.DataSourceProps, Style.Dimensions, Data.EventProps, WrapperProps {
        nameAttribute: string;
        valueAttribute: string;
        sortAttribute: string;
        colors: { color: string }[];
        sortOrder: Data.SortOrder;
        chartType: PieChartType;
        showLegend: boolean;
        layoutOptions: string;
        dataOptions: string;
        devMode: "basic" | "advanced" | "developer";
    }

    export interface HeatMapContainerProps extends Data.DataSourceProps, Style.Dimensions, Data.EventProps, WrapperProps {
        valueAttribute: string;
        horizontalNameAttribute: string;
        horizontalSortAttribute: string;
        verticalNameAttribute: string;
        verticalSortAttribute: string;
        horizontalSortOrder: Data.SortOrder;
        verticalSortOrder: Data.SortOrder;
        showScale: boolean;
        scaleColors: ScaleColors[];
        showValues: boolean;
        valuesColor: string;
        xAxisLabel: string;
        yAxisLabel: string;
        layoutOptions: string;
        dataOptions: string;
        devMode: "basic" | "advanced" | "developer";
    }

    export interface ScaleColors {
        valuePercentage: number;
        colour: number;
    }
    export interface AnyChartContainerPropsBase extends WrapperProps, Style.Dimensions {
        dataStatic: string;
        dataAttribute: string;
        layoutStatic: string;
        layoutAttribute: string;
        eventEntity: string;
        eventDataAttribute: string;
        onClickMicroflow: string;
        tooltipEntity: string;
        tooltipMicroflow: string;
        tooltipForm: string;
    }

    export interface AnyChartContainerProps extends AnyChartContainerPropsBase {
        devMode: "advanced" | "developer";
    }

    export interface AnyChartContainerState {
        alertMessage?: ReactChild;
        loading: boolean;
        attributeData: string;
        attributeLayout: string;
    }
}

export namespace Data {
    export interface DataSourceProps {
        dataSourceMicroflow: string;
        dataSourceType: "XPath" | "microflow";
        entityConstraint: string;
        dataEntity: string;
    }

    export interface SeriesDataSourceProps extends DataSourceProps {
        xValueAttribute: string;
        xValueSortAttribute: string;
        sortOrder: SortOrder;
        yValueAttribute: string;
    }

    export type SortOrder = "asc" | "desc";

    export interface EventProps {
        onClickEvent: "doNothing" | "showPage" | "callMicroflow";
        onClickPage: string;
        onClickMicroflow: string;
        tooltipForm: string;
    }

    export interface SeriesProps extends SeriesDataSourceProps, EventProps {
        name: string;
        seriesOptions: string;
        barColor: string;
    }

    export interface LineSeriesProps extends SeriesProps {
        mode?: Container.LineMode;
        lineColor: string;
        lineStyle: "linear" | "spline";
        fill?: boolean;
        fillColor?: string;
    }

    export interface SeriesData<T extends SeriesProps = SeriesProps> {
        data: mendix.lib.MxObject[];
        series: T;
    }

    export interface ScatterTrace {
        x: Datum[];
        y: number[] | Datum[];
    }

    export interface ReferencesSpec {
            attributes?: string[];
            amount?: number;
            sort?: [ string, "desc" | "asc" ][];
            references?: {
                [index: string]: ReferencesSpec;
            };
    }
}

export namespace Style {
    export interface Dimensions {
        width: number;
        height: number;
        widthUnit: "percentage" | "pixels";
        heightUnit: "percentageOfWidth" | "pixels" | "percentageOfParent";
    }
}
