import { Layout } from "plotly.js";
import { configs } from "../../../utils/configs";
import * as PieChartConfigs from "../../utils/configs";
import { PieChartProps } from "../../components/PieChart";

describe("PieChart/utils/configs", () => {
    const PieProps: Partial<PieChartProps> = {
        chartType: "pie",
        showLegend: true,
        sortOrder: "asc"
    };
    describe("#getDefaultLayoutOptions", () => {
        it("combines layout configs with default configs", () => {
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
            const LayoutOptions = PieChartConfigs.getDefaultLayoutOptions(PieProps as PieChartProps);

            expect(LayoutOptions).toEqual({ ...configs.layout, ...defaultConfigs });
        });
    });

    describe("#getDefaultDataOptions", () => {
        it("returns default series options", () => {
            const chartType = PieChartConfigs.getDefaultDataOptions(PieProps as PieChartProps);

            expect(chartType).toEqual({ hole: 0, hoverinfo: "none" as any, type: "pie", sort: false });
        });
    });
});
