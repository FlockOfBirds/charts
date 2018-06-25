import { Component, createElement } from "react";
import { MapDispatchToProps, MapStateToProps, connect } from "react-redux";
import { bindActionCreators } from "redux";

import { handleOnClick, isContextChanged, openTooltipForm, setRefreshAction, validateSeriesProps } from "../../utils/data";
import { Container, Data } from "../../utils/namespaces";
import PieChart from "./PieChart";
import * as PieChartActions from "../store/PieChartActions";
import { PieChartState, PieReduxStore as ReduxStore, defaultInstanceState } from "../store/PieChartReducer";
import * as PlotlyChartActions from "../../components/actions/PlotlyChartActions";
import { store } from "../../store";
import PieChartContainerProps = Container.PieChartContainerProps;

type Actions = typeof PieChartActions & typeof PlotlyChartActions;
export type PieChartDataHandlerProps = PieChartContainerProps & PieChartState & Actions;

export class PieChartDataHandler extends Component<PieChartDataHandlerProps> {
    private subscriptionHandles: number[] = [];
    private intervalID?: number;

    render() {
        return createElement("div", { className: "widget-charts-wrapper" },
            createElement(PieChart, {
                ...this.props as PieChartDataHandlerProps,
                onClick: this.handleOnClick,
                onHover: this.props.tooltipForm ? this.handleOnHover : undefined
            })
        );
    }

    componentDidMount() {
        const { friendlyId, layoutOptions, configurationOptions } = this.props;
        const validationError = validateSeriesProps(
            [ { ...this.props, seriesOptions: this.props.dataOptions } ],
            friendlyId,
            layoutOptions,
            configurationOptions
        );
        if (validationError) {
            this.props.showAlertMessage(friendlyId, validationError);
        }
        store.dispatch(this.props.fetchThemeConfigs(friendlyId));
    }

    componentWillReceiveProps(nextProps: PieChartDataHandlerProps) {
        this.resetSubscriptions(nextProps);
        if (!nextProps.alertMessage) {
            if (!nextProps.mxObject) {
                nextProps.noContext(nextProps.friendlyId);
            } else if (!nextProps.fetchingConfigs && isContextChanged(this.props.mxObject, nextProps.mxObject)) {
                nextProps.togglePlotlyDataLoading(nextProps.friendlyId, true);
                store.dispatch(nextProps.fetchPieData(nextProps));
                this.clearRefreshInterval();
                this.intervalID = setRefreshAction(nextProps.refreshInterval, nextProps.mxObject)(this.onRefresh);
            }
        } else {
            this.clearRefreshInterval();
        }
    }

    shouldComponentUpdate(nextProps: PieChartDataHandlerProps) {
        const doneLoading = !nextProps.fetchingData && this.props.fetchingData;
        const advancedOptionsUpdated = nextProps.layoutOptions !== this.props.layoutOptions
            || nextProps.dataOptions !== this.props.dataOptions
            || nextProps.configurationOptions !== this.props.configurationOptions;
        const playgroundLoaded = !!nextProps.playground && !this.props.playground;

        return doneLoading || advancedOptionsUpdated || playgroundLoaded || !nextProps.mxObject;
    }

    componentWillUnmount() {
        this.unsubscribe();
        this.clearRefreshInterval();
    }

    private unsubscribe() {
        this.subscriptionHandles.map(mx.data.unsubscribe);
        this.subscriptionHandles = [];
    }

    private onRefresh = () => {
        if (!this.props.fetchingData) {
            store.dispatch(this.props.fetchPieData(this.props));
        }
    }

    private clearRefreshInterval() {
        if (this.intervalID) {
            window.clearInterval(this.intervalID);
        }
    }

    private resetSubscriptions(props: PieChartDataHandlerProps) {
        this.unsubscribe();

        if (props.mxObject) {
            this.subscriptionHandles.push(window.mx.data.subscribe({
                callback: () => store.dispatch(this.props.fetchPieData(props)),
                guid: props.mxObject.getGuid()
            }));
        }
        if (props.data && props.data.length) {
            props.data.forEach(mxObject => {
                if (mxObject) {
                    this.subscriptionHandles.push(mx.data.subscribe({
                        callback: () => {/* callback is required but not in this case */},
                        guid: mxObject.getGuid()
                    }));
                }
            });
        }
    }

    private handleOnClick = (options: Data.OnClickOptions<{ label: string, value: number }, PieChartContainerProps>) => {
        if (options.mxObject) {
            handleOnClick(options.options, options.mxObject, options.mxForm);
        } else if (options.trace) {
            this.createDataPoint(options.options, options.trace)
                .then(mxObject => handleOnClick(options.options, mxObject, options.mxForm))
                .catch(error => mx.ui.error(`An error occured while creating ${options.options.dataEntity} object: ${error}`));
        }
    }

    private handleOnHover = (options: Data.OnHoverOptions<{ label: string, value: number }, PieChartContainerProps>) => {
        if (options.mxObject) {
            openTooltipForm(options.tooltipNode, options.tooltipForm, options.mxObject);
        } else if (options.trace && options.options.dataEntity) {
            this.createDataPoint(options.options, options.trace)
                .then(mxObject => openTooltipForm(options.tooltipNode, options.tooltipForm, mxObject))
                .catch(error => mx.ui.error(`An error occured while creating ${options.options.dataEntity} object: ${error}`));
        }
    }

    private createDataPoint(props: PieChartContainerProps, trace: { label: string, value: number }) {
        return new Promise<mendix.lib.MxObject>((resolve, reject) => {
            window.mx.data.create({
                entity: props.dataEntity,
                callback: mxObject => {
                    mxObject.set(props.nameAttribute, trace.label);
                    mxObject.set(props.valueAttribute, trace.value);
                    resolve(mxObject);
                },
                error: error => reject(error.message)
            });
        });
    }
}

const mapStateToProps: MapStateToProps<PieChartState, PieChartContainerProps, ReduxStore> = (state, props) =>
    state.pie[props.friendlyId] || defaultInstanceState as PieChartState;
const mapDispatchToProps: MapDispatchToProps<typeof PieChartActions & typeof PlotlyChartActions, PieChartContainerProps> =
    dispatch => ({
        ...bindActionCreators(PieChartActions, dispatch),
        ...bindActionCreators(PlotlyChartActions, dispatch)
    });
export default connect(mapStateToProps, mapDispatchToProps)(PieChartDataHandler);