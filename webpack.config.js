// tslint:disable max-line-length
const path = require("path");
const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const widgetName = require("./package").widgetName[0];

const widgetConfig = {
    entry: {
        ColumnChart: "./src/ColumnChart/components/ColumnChartContainer.ts",
        BarChart: "./src/BarChart/components/BarChartContainer.ts",
        LineChart: "./src/LineChart/components/LineChartContainer.ts",
        AreaChart: "./src/AreaChart/components/AreaChartContainer.ts",
        PieChart: "./src/PieChart/components/PieChartContainer.ts",
        TimeSeries: "./src/TimeSeries/components/TimeSeriesContainer.ts",
        HeatMap: "./src/HeatMap/components/HeatMapContainer.ts",
        BubbleChart: "./src/BubbleChart/components/BubbleChartContainer.ts"
        // PolarChart: "./src/PolarChart/components/PolarChartContainer.ts"
    },
    output: {
        jsonpFunction: "webpackJsonpCharts",
        path: path.resolve(__dirname, "dist/tmp/widgets"),
        filename: "com/mendix/widget/custom/[name]/[name].js",
        chunkFilename: `com/mendix/widget/custom/${widgetName.toLowerCase()}/chunk[chunkhash].js`,
        libraryTarget: "umd",
        publicPath: "/"
    },
    devServer: {
        port: 3000,
        proxy: [ {
            context: [ "**", "!/widgets/com/mendix/widget/custom/chats/Charts.js" ],
            target: "http://localhost:8287/"
        } ]
    },
    resolve: {
        extensions: [ ".ts", ".js" ],
        alias: {
            "tests": path.resolve(__dirname, "./tests")
        }
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader"
            },
            {
                test: /\.css$/, loader: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader"
                })
            },
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader!sass-loader"
                })
            }
        ]
    },
    devtool: "eval",
    mode: "production",
    externals: [ "react", "react-dom" ],
    plugins: [
        new CopyWebpackPlugin([
            {
                from: "src/**/*.xml",
                to: "[name]/[name].[ext]",
                toType: "template",
                ignore: [ "src/AnyChart/*.xml", "src/package.xml" ]
            },
            {
                from: "src/package.xml",
                to: "[name].[ext]",
                toType: "template",
                ignore: [ "src/AnyChart/*.xml" ]
            }
        ], { copyUnmodified: true }),
        new ExtractTextPlugin({ filename: `com/mendix/widget/custom/[name]/ui/[name].css` }),
        new webpack.LoaderOptionsPlugin({ debug: true }),
        new webpack.IgnorePlugin(/^plotly\.js\/dist\/plotly$/)
    ]
};

const anyChartConfig = {
    entry: { AnyChart: "./src/AnyChart/components/AnyChartContainer.ts" },
    output: {
        jsonpFunction: "webpackJsonpAnyChart",
        path: path.resolve(__dirname, "dist/tmp/AnyChart"),
        filename: "com/mendix/widget/custom/[name]/[name].js",
        chunkFilename: `com/mendix/widget/custom/AnyChart/chunk[chunkhash].js`,
        libraryTarget: "umd",
        publicPath: "/"
    },
    resolve: {
        extensions: [ ".ts", ".js" ],
        alias: {
            "tests": path.resolve(__dirname, "./tests"),
            "plotly.js/dist/plotly": "plotly.js/dist/plotly.min.js"
        }
    },
    devtool: "eval",
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader"
            },
            {
                test: /\.css$/, loader: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader"
                })
            },
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader!sass-loader"
                })
            }
        ]
    },
    externals: [ "react", "react-dom" ],
    plugins: [
        new CopyWebpackPlugin([
            { from: "src/AnyChart/AnyChart.xml", to: "../AnyChart/AnyChart/" },
            { from: "src/AnyChart/package.xml", to: "../AnyChart/" }
        ], { copyUnmodified: true }),
        new ExtractTextPlugin({ filename: `./com/mendix/widget/custom/[name]/ui/[name].css` }),
        new webpack.LoaderOptionsPlugin({ debug: true }),
        new webpack.IgnorePlugin(/^plotly\.js\/lib\/core$|^plotly\.js\/lib\/pie$|^plotly\.js\/lib\/bar&|^plotly\.js\/lib\/scatter$^plotly\.js\/lib\/heatmap$/)
    ]
};

const previewConfig = {
    entry: {
        ColumnChart: "./src/ColumnChart/ColumnChart.webmodeler.ts",
        BarChart: "./src/BarChart/BarChart.webmodeler.ts",
        LineChart: "./src/LineChart/LineChart.webmodeler.ts",
        AreaChart: "./src/AreaChart/AreaChart.webmodeler.ts",
        PieChart: "./src/PieChart/PieChart.webmodeler.ts",
        TimeSeries: "./src/TimeSeries/TimeSeries.webmodeler.ts",
        HeatMap: "./src/HeatMap/HeatMap.webmodeler.ts",
        BubbleChart: "./src/BubbleChart/BubbleChart.webmodeler.ts"
        // PolarChart: "./src/PolarChart/PolarChart.webmodeler.ts"
    },
    output: {
        path: path.resolve(__dirname, "dist/tmp"),
        filename: "widgets/[name]/[name].webmodeler.js",
        libraryTarget: "commonjs"
    },
    resolve: { extensions: [ ".ts", ".js" ] },
    module: {
        rules: [
            { test: /\.ts$/, loader: "ts-loader", options: {
                configFile: "tsconfig.preview.json"
            } },
            { test: /\.css$/, use: "raw-loader" },
            { test: /\.scss$/, use: [
                { loader: "raw-loader" },
                { loader: "sass-loader" }
            ] }
        ]
    },
    externals: [ "react", "react-dom" ],
    plugins: [
        new webpack.IgnorePlugin(
            /^plotly\.js\/dist\/plotly$|\/SeriesPlayground$|\/PiePlayground$/
        )
    ]
};

const anyChartPreviewConfig = {
    entry: { AnyChart: "./src/AnyChart/AnyChart.webmodeler.ts" },
    output: {
        path: path.resolve(__dirname, "dist/tmp"),
        filename: "AnyChart/[name]/[name].webmodeler.js",
        libraryTarget: "commonjs"
    },
    resolve: {
        extensions: [ ".ts", ".js" ],
        alias: { "plotly.js/dist/plotly": "plotly.js/dist/plotly.min.js" }
    },
    devtool: "eval",
    module: {
        rules: [
            { test: /\.ts$/, loader: "ts-loader", options: {
                configFile: "tsconfig.preview.json"
            } },
            { test: /\.css$/, use: "raw-loader" },
            { test: /\.scss$/, use: [
                { loader: "raw-loader" },
                { loader: "sass-loader" }
            ] }
        ]
    },
    mode: "production",
    devtool: "inline-source-map",
    externals: [ "react", "react-dom" ],
    plugins: [
        new webpack.IgnorePlugin(/^plotly\.js\/lib\/core$|^plotly\.js\/lib\/pie$|^plotly\.js\/lib\/bar$|^plotly\.js\/lib\/scatter$|^plotly\.js\/lib\/heatmap$/)
    ]
};

module.exports = [ widgetConfig, anyChartConfig, previewConfig, anyChartPreviewConfig ];
