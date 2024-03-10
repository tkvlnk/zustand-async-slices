"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreFacadeForAsyncSlice = void 0;
const types_1 = require("../types");
class StoreFacadeForAsyncSlice {
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
            status: types_1.AsyncStatus.Pending,
            lastExecParams: execParams,
            pendingExecParams: [...pendingExecParams, execParams],
        }), `${this.namespace.toString()}/${types_1.AsyncStatus.Pending}`);
    }
    handleSuccess(data, params) {
        this.setSlice((current) => {
            const pendingExecParams = current.pendingExecParams.filter((currParams) => currParams !== params);
            return {
                data,
                pendingExecParams,
                status: pendingExecParams.length > 0
                    ? types_1.AsyncStatus.Pending
                    : types_1.AsyncStatus.Success,
            };
        }, `${this.namespace.toString()}/${types_1.AsyncStatus.Success}`);
    }
    handleError(error, params) {
        this.setSlice((current) => {
            const pendingExecParams = current.pendingExecParams.filter((currParams) => currParams !== params);
            return {
                error,
                pendingExecParams,
                status: pendingExecParams.length > 0
                    ? types_1.AsyncStatus.Pending
                    : types_1.AsyncStatus.Error,
            };
        }, `${this.namespace.toString()}/${types_1.AsyncStatus.Error}`);
    }
    reset() {
        this.setSlice(() => ({
            data: null,
            status: types_1.AsyncStatus.Idle,
            lastExecParams: undefined,
            pendingExecParams: [],
            errorMessage: null,
        }), `${this.namespace.toString()}/reset`);
    }
}
exports.StoreFacadeForAsyncSlice = StoreFacadeForAsyncSlice;
