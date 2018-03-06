class DefaultFilter {

    public get getTimeSeries() {
        return browser.element("#mxui_widget_ReactCustomWidgetWrapper_0 > input[type='checkbox']");
    }

    public open(): void {
        browser.url("/p/home");
    }
}
const defaultFilter = new DefaultFilter();
export default defaultFilter;
