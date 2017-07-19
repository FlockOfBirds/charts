import "plotly.js";

declare module "plotly.js" {
    interface BarData {
        name?: string;
    }

    interface Layout {
        title?: string;
    }

    interface BarLayout extends Layout {
        barmode: BarMode;
    }

    type BarMode = "group" | "stack" | "relative";
}
