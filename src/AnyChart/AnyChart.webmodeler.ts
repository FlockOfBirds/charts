import { Component, createElement } from "react";

import { AnyChart } from "./components/AnyChart";
import { Container } from "../utils/namespaces";

// tslint:disable-next-line class-name
export class preview extends Component<Container.AnyChartContainerProps, {}> {
    render() {
        return createElement("div", {},
            createElement(AnyChart, {
                ...this.props as any,
                attributeData: this.props.sampleData
            })
        );
    }
}

export function getPreviewCss() {
    return (
        require("../ui/Charts.scss") +
        require("../ui/ChartsLoading.scss") +
        require("../ui/Sidebar.scss") +
        require("../ui/Playground.scss") +
        require("../ui/Panel.scss") +
        require("../ui/InfoTooltip.scss") +
        require("plotly.js/src/css/style.scss")
    );
}
