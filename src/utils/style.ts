import { Style } from "./namespaces";
import { CSSProperties } from "react";

export const parseStyle = (style = ""): {[key: string]: string} => { // Doesn't support a few stuff.
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
        window.console.log("Failed to parse style", style, error); // tslint:disable-line no-console
    }

    return {};
};

export const getDimensions = <T extends Style.Dimensions>(props: T): CSSProperties => {
    const style: CSSProperties = {
        width: props.widthUnit === "percentage" ? `${props.width}%` : `${props.width}px`
    };
    if (props.heightUnit === "percentageOfWidth") {
        style.paddingBottom = props.widthUnit === "percentage"
            ? `${props.height}%`
            : `${props.width / 2}px`;
    } else if (props.heightUnit === "pixels") {
        style.height = `${props.height}px`;
    } else if (props.heightUnit === "percentageOfParent") {
        style.height = `${props.height}%`;
    }

    return style;
};

export const defaultColours = (opacity = 1) => [
    `rgba(5, 149, 219, ${opacity})`,
    `rgba(23, 52, 123, ${opacity})`,
    `rgba(118, 202, 2, ${opacity})`
];
export const fillColours = [ "rbg(5,149,219,5)", "rbg(23,52,123,5)", "rbg(118,202,2,5)" ];

export const getTooltipCoordinates = (event: MouseEvent, tooltipNode: HTMLDivElement): SVGPoint | null => {
    const parentElement = tooltipNode.parentElement;
    if (parentElement) {
        const svg: SVGSVGElement = parentElement.getElementsByClassName("main-svg")[0] as SVGSVGElement;
        if (svg) {
            const point = svg.createSVGPoint();
            point.x = event.clientX;
            point.y = event.clientY;

            return point.matrixTransform(svg.getScreenCTM().inverse());
        }
    }

    return null;
};

export const setTooltipPosition = (tooltipNode: HTMLDivElement, coordinates: SVGPoint) => {
    tooltipNode.innerHTML = "";
    tooltipNode.style.left = `${coordinates.x}px`;
    tooltipNode.style.top = `${coordinates.y}px`;
    tooltipNode.style.opacity = "1";
};
