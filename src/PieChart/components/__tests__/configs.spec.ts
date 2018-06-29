import * as PieChartConfigs from "../../utils/configs";
import { PieChartProps } from "../../components/PieChart";
import { Layout } from "plotly.js";
import { configs } from "../../../utils/configs";

describe("PieChart/utils/configs", () => {
    const pieProps: Partial<PieChartProps> = {
        pieData: [ {
            dataOptions: "0.6",
            devMode: "advanced",
            hole: 0.6,
            labels: [ "Data 1", "Data 2" ],
            marker: { colors: [ "rgba(5, 149, 219, 1)", "rgba(23, 52, 123, 1)" ] },
            sort: false,
            type: "pie",
            values: [ 64, 60 ]
        } ] as any
    };

    describe("#getData", () => {
        it("gets chart data based on dataOption when devMode is not basic", () => {
            const props: Partial<PieChartProps> = {
                ...pieProps,
                themeConfigs: { configuration: { }, data: { }, layout: { } }as any
            };
            const getPieConfigData: any = PieChartConfigs.getData(props as PieChartProps);

            expect(getPieConfigData).toEqual([ {
                dataOptions: "0.6",
                devMode: "advanced",
                hole: 0.6,
                labels: [ "Data 1", "Data 2" ],
                marker: { colors: [ "rgba(5, 149, 219, 1)", "rgba(23, 52, 123, 1)" ] },
                sort: false,
                type: "pie",
                values: [ 64, 60 ],
                customdata: undefined }
            ]);
        });

        it("gets no chart data when no new data configuration are made", () => {
            const props: Partial<PieChartProps> = {};
            const getPieConfigData: any = PieChartConfigs.getData(props as any);

            expect(getPieConfigData).toEqual([ ]);
        });
    });

    describe("#getDefaultDataOptions", () => {
        it("fetches chart default data options", () => {
            const props: Partial<PieChartProps> = {
                ...pieProps,
                chartType: "donut"
            };
            const data = PieChartConfigs.getDefaultDataOptions(props as PieChartProps);

            expect(data).toEqual({ hole: 0.4, hoverinfo: "none", type: "pie", sort: false });
        });
    });

    describe("#getDefaultLayoutOptions", () => {
        it("combines layout configs with default configs", () => {
            const props: Partial<PieChartProps> = {
                ...pieProps,
                showLegend: true
            };
            const layoutOptions = PieChartConfigs.getDefaultLayoutOptions(props as PieChartProps);
            const defaultConfigs: Partial<Layout> = {
                font: {
                    family: "Open Sans",
                    color: "#FFF",
                    size: 12
                },
                showlegend: true,
                legend: {
                    font: {
                        family: "Open Sans",
                        size: 14,
                        color: "#555"
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

            expect(layoutOptions).toEqual({ ...configs.layout, ...defaultConfigs });
        });
    });

    describe("#getLayoutOptions", () => {
        it("gets charts layout options based on layoutOptions when devMode is not 'basic'", () => {
            const props: Partial<PieChartProps> = {
                ...pieProps,
                layoutOptions: `{ "font": { "color": "#333" }, "title": "Advanced Pie", "margin": { "t": 60 } }`,
                themeConfigs: { configuration: {}, layout: {} }as any
            };
            const chartType = PieChartConfigs.getLayoutOptions(props as PieChartProps);

            expect(chartType).toEqual({
                font: { family: "Open Sans", size: 12, color: "#333" },
                autosize: true,
                hovermode: "closest",
                hoverlabel: { bgcolor: "#888", bordercolor: "#888", font: { color: "#FFF" } },
                margin: { l: 60, r: 60, b: 60, t: 60, pad: 10 },
                showlegend: undefined,
                legend: { font: { family: "Open Sans", size: 14, color: "#555" } },
                title: "Advanced Pie"
            });
        });

        it("gets default layout options when devMode is 'basic' and no layoutOptions are available", () => {
            const props: Partial<PieChartProps> = {
                ...pieProps,
                themeConfigs: { configuration: {}, layout: {} }as any
            };
            const chartType = PieChartConfigs.getLayoutOptions(props as PieChartProps);

            expect(chartType).toEqual({
                font: { family: "Open Sans", size: 12, color: "#FFF" },
                autosize: true,
                hovermode: "closest",
                hoverlabel: { bgcolor: "#888", bordercolor: "#888", font: { color: "#FFF" } },
                margin: { l: 60, r: 60, b: 60, t: 10, pad: 10 },
                showlegend: undefined,
                legend: { font: Object({ family: "Open Sans", size: 14, color: "#555" }) }
            });
        });
    });

    describe("#getConfigOptions", () => {
        it("gets charts configuration options", () => {
            const props: Partial<PieChartProps> = {
                ...pieProps,
                chartType: "donut",
                layoutOptions: `{ "font": { "color": "#333" }, "title": "Advanced Pie", "margin": { "t": 60 } }`,
                themeConfigs: { configuration: {}, data: {}, layout: {} }as any,
                configurationOptions: `{ "displayModeBar": false, "doubleClick": false }`
            };
            const chartType = PieChartConfigs.getConfigOptions(props as PieChartProps);

            expect(chartType).toEqual({ displayModeBar: false, doubleClick: false });
        });
    });
});
