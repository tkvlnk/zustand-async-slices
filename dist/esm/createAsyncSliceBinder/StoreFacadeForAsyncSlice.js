import { AsyncStatus, } from "../types";
export class StoreFacadeForAsyncSlice {
    constructor(namespace, store) {
        this.namespace = namespace;
        this.store = store;
    }
    getSlice() {
        return this.store.getState()[this.namespace];
    }
    setSlice(calcNext, actionName) {
        return this.store.setState(({ [this.namespace]: current }) => ({
            [this.namespace]: Object.assign(Object.assign({}, current), calcNext(current)),
        }), undefined, actionName);
    }
    handleStart(execParams) {
        this.setSlice(({ pendingExecParams }) => ({
            status: AsyncStatus.Pending,
            lastExecParams: execParams,
            pendingExecParams: [...pendingExecParams, execParams],
        }), `${this.namespace.toString()}/${AsyncStatus.Pending}`);
    }
    handleSuccess(data, params) {
        this.setSlice((current) => {
            const pendingExecParams = current.pendingExecParams.filter((currParams) => currParams !== params);
            return {
                data,
                pendingExecParams,
                status: pendingExecParams.length > 0
                    ? AsyncStatus.Pending
                    : AsyncStatus.Success,
            };
        }, `${this.namespace.toString()}/${AsyncStatus.Success}`);
    }
    handleError(errorMessage, params) {
        this.setSlice((current) => {
            const pendingExecParams = current.pendingExecParams.filter((currParams) => currParams !== params);
            return {
                errorMessage,
                pendingExecParams,
                status: pendingExecParams.length > 0
                    ? AsyncStatus.Pending
                    : AsyncStatus.Error,
            };
        }, `${this.namespace.toString()}/${AsyncStatus.Error}`);
    }
}
