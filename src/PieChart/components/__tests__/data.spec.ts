import { PieChartDataHandlerProps } from "../PieChartDataHandler";
import * as PieData from "../../utils/data";
import { Data } from "../../../utils/namespaces";

// import { PieChart, PieChartProps } from "../../components/PieChart";PieChartProps
// data: Data.FetchedData<string>, props: PieChartDataHandlerProps
describe("PieChart/utils/data", () => {
    describe("#getData", () => {
        it("with data source type XPath fetches data when props and rest data are defined", () => {
            const PieProps: Partial<PieChartDataHandlerProps> = {
                nameAttribute: "Name", sortOrder: "asc", chartType: "pie", devMode: "advanced",
                colors: [ { color: "#333" }, { color: "pink" }, { color: "red" }, { color: "#222" } ], dataOptions: "0.6"
            };
            const data: any = {
                mxObjects: [
                    { jsonData: {}, get: (nameAttribute: string) => nameAttribute },
                    { jsonData: {}, get: (nameAttribute: string) => nameAttribute }
                ]
            };
            const getPieData: any = PieData.getData(data as Data.FetchedData<string>, PieProps as PieChartDataHandlerProps);

            expect(getPieData).toEqual([ {
                hole: 0,
                hoverinfo: "none",
                type: "pie",
                sort: false,
                labels: [ "Name", "Name" ], values: [ NaN, NaN ],
                marker: { colors: [ "#333", "pink", "red", "#222" ] },
                customdata: [ { jsonData: { }, get: jasmine.any(Function) }, { jsonData: { }, get: jasmine.any(Function) } ] } ]);
        });

        it("with data source type REST fetches data when props and rest data are defined", () => {
            const PieProps: Partial<PieChartDataHandlerProps> = {
                nameAttribute: "Name", sortOrder: "asc", chartType: "pie", devMode: "basic",
                colors: [ { color: "#333" }, { color: "pink" }, { color: "red" }, { color: "#222" } ]
            };
            const data: any = {
                restData: [
                    { Name: "Data 1", Value: 64 }, { Name: "Data 2", Value: 11 }
                ]
            };
            const getPieData: any = PieData.getData(data as Data.FetchedData<string>, PieProps as PieChartDataHandlerProps);

            expect(getPieData).toEqual([
                {
                    hole: 0,
                    hoverinfo: "none",
                    type: "pie", sort: false,
                    labels: [ "Data 1", "Data 2" ],
                    values: [ undefined, undefined ],
                    marker: { colors: [ "#333", "pink", "red", "#222" ] },
                    customdata: [ ]
                }
            ]);
        });

        it("fetches no chart data when props or rest data are not defined", () => {
            const PieProps: Partial<PieChartDataHandlerProps> = {};
            const getPieData = PieData.getData({ }, PieProps as any);

            expect(getPieData).toEqual([ ]);
        });

        it("fetches no trace data when props or rest data are not defined", () => {
            const PieProps: Partial<PieChartDataHandlerProps> = { };
            const getPieTraces: any = PieData.getTraces({ }, PieProps as any);

            expect(getPieTraces).toEqual({ labels: [ ], values: [ ], colors: [ ] });
        });

        it("fetches trace data with defaultColours when no color is specified defined", () => {
            const PieProps: Partial<PieChartDataHandlerProps> = {
                nameAttribute: "Name", sortOrder: "asc", chartType: "pie", devMode: "basic"
            };
            const data: any = {
                mxObjects: [ { jsonData: { }, get: (nameAttribute: string) => nameAttribute } ]
            };
            const getPieTraces = PieData.getTraces(data, PieProps as PieChartDataHandlerProps);

            expect(getPieTraces).toEqual({
                colors: [
                    "rgba(5, 149, 219, 1)",
                    "rgba(23, 52, 123, 1)",
                    "rgba(118, 202, 2, 1)",
                    "rgba(214, 39, 40, 1)",
                    "rgba(148, 103, 189, 1)",
                    "rgba(140, 86, 75, 1)",
                    "rgba(227, 119, 194, 1)",
                    "rgba(127, 127, 127, 1)",
                    "rgba(188, 189, 34, 1)",
                    "rgba(23, 190, 207, 1)"
                ],
                labels: [ "Name" ],
                values: [ NaN ]
            });
        });
    });
});
