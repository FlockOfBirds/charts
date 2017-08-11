import "plotly.js";

declare module "plotly.js" {
    interface BarData {
        name?: string;
    }

    interface ScatterData {
        text?: string | string[];
        line?: Partial<ScatterLine>;
        "line.color"?: Color;
        "line.width"?: number;
        "line.dash"?: Dash;
        "line.shape"?: "linear" | "spline" | "hv" | "vh" | "hvh" | "vhv";
        "line.smoothing"?: number;
        "line.simplify"?: boolean;
        marker?: Partial<ScatterMarker>;
        "marker.symbol"?: string | string[]; // Drawing.symbolList
        "marker.color"?: Color;
        "marker.opacity"?: number | number[];
        "marker.size"?: number | number[];
        "marker.maxdisplayed"?: number;
        "marker.sizeref"?: number;
        "marker.sizemin"?: number;
        "marker.sizemode"?: "diameter" | "area";
        "marker.showscale"?: boolean;
        "marker.line"?: {};
        "marker.colorbar"?: {};
        mode?:
        "lines" | "markers" | "text" | "lines+markers" | "text+markers" | "text+lines" | "text+lines+markers" | "none";
        hoveron?: "points" | "fills";
        hoverinfo?: "text";
        fill?: "none" | "tozeroy" | "tozerox" | "tonexty" | "tonextx" | "toself" | "tonext";
        fillcolor?: string;
        legendgroup?: string;
        name?: string;
        connectgaps?: boolean;
    }

    interface Layout {
        title?: string;
    }

    interface BarLayout extends Layout {
        barmode: BarMode;
    }

    type BarMode = "group" | "stack" | "relative";
}
