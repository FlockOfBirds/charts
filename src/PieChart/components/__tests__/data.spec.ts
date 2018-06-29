import { PieChartDataHandlerProps } from "../PieChartDataHandler";
import * as PieData from "../../utils/data";
import { Data } from "../../../utils/namespaces";

describe("PieChart/utils/data", () => {
    const pieProps: Partial<PieChartDataHandlerProps> = {
        nameAttribute: "Name", sortOrder: "asc",
        colors: [ { color: "#333" }, { color: "pink" }, { color: "red" }, { color: "#222" } ]
    };

    describe("#getData", () => {
        it("with data source type XPath fetches data when mxObjects are defined", () => {
            const props: Partial<PieChartDataHandlerProps> = {
                ...pieProps,
                chartType: "pie", devMode: "advanced", dataOptions: "0.6"
            };
            const data: any = {
                mxObjects:
                [
                    { jsonData: {}, get: (nameAttribute: string) => nameAttribute },
                    { jsonData: {}, get: (nameAttribute: string) => nameAttribute }
                ]
            };
            const getPieData: any = PieData.getData(data as Data.FetchedData<string>, props as PieChartDataHandlerProps);

            expect(getPieData).toEqual([
                {
                    hole: 0,
                    hoverinfo: "none",
                    type: "pie",
                    sort: false,
                    labels: [ "Name", "Name" ], values: [ NaN, NaN ],
                    marker: { colors: [ "#333", "pink", "red", "#222" ] },
                    customdata: [ { jsonData: {}, get: jasmine.any(Function) }, { jsonData: {}, get: jasmine.any(Function) } ]
                }
            ]);
        });

        it("with data source type REST fetches data when restData are defined", () => {
            const props: Partial<PieChartDataHandlerProps> = {
                ...pieProps,
                chartType: "pie", devMode: "basic"
            };
            const data = {
                restData:
                [
                    { Name: "Data 1", Value: 64 },
                    { Name: "Data 2", Value: 11 }
                ]
            } as any;
            const getPieData: any = PieData.getData(data as Data.FetchedData<string>, props as PieChartDataHandlerProps);

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
            const props: Partial<PieChartDataHandlerProps> = {};
            const getPieData = PieData.getData({ }, props as any);

            expect(getPieData).toEqual([ ]);
        });
    });

    describe("#getTraces", () => {
        it("fetches default color when there are no custom colors configured", () => {
            const props: Partial<PieChartDataHandlerProps> = { };
            const getPieTraces: any = PieData.getTraces({ }, props as any);

            expect(getPieTraces).toEqual({ labels: [ ], values: [ ], colors: [ ] });
        });

        it("fetches trace data with defaultColours when no color is specified defined", () => {
            const data: any = {
                mxObjects: [ { jsonData: { }, get: (nameAttribute: string) => nameAttribute } ]
            };
            const getPieTraces = PieData.getTraces(data, pieProps as PieChartDataHandlerProps);

            expect(getPieTraces).toEqual({
                colors: [ "#333", "pink", "red", "#222" ],
                labels: [ "Name" ],
                values: [ NaN ]
            });
        });
    });
});
