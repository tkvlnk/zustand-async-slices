"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAsyncSliceBinder = void 0;
const types_1 = require("../types");
const StoreFacadeForAsyncSlice_1 = require("./StoreFacadeForAsyncSlice");
function createAsyncSliceBinder(storeApi) {
    return (namespace, fetcher) => {
        const store = new StoreFacadeForAsyncSlice_1.StoreFacadeForAsyncSlice(namespace, storeApi);
        const executeAsync = (...params) => __awaiter(this, void 0, void 0, function* () {
            store.handleStart(params);
            try {
                const data = yield fetcher(...params);
                store.handleSuccess(data, params);
            }
            catch (error) {
                store.handleError(error, params);
                throw error;
            }
        });
        return {
            data: null,
            status: types_1.AsyncStatus.Idle,
            error: null,
            lastExecParams: undefined,
            pendingExecParams: [],
            executeAsync,
            execute: (...params) => void executeAsync(...params).catch(() => { }),
            isSettled: () => [types_1.AsyncStatus.Success, types_1.AsyncStatus.Error].includes(store.getSlice().status),
            isIdle: () => store.getSlice().status === types_1.AsyncStatus.Idle,
            isPending: () => store.getSlice().status === types_1.AsyncStatus.Pending,
            isSuccess: () => store.getSlice().status === types_1.AsyncStatus.Success,
            isError: () => store.getSlice().status === types_1.AsyncStatus.Error,
            get: () => {
                const { data, error } = store.getSlice();
                if (!data) {
                    throw new Error([
                        `Value of '${namespace.toString()}' is not available.`,
                        (error === null || error === void 0 ? void 0 : error.message) && `Related error message: ${error.message}`,
                    ]
                        .filter(Boolean)
                        .join("\n"));
                }
                return data;
            },
            reset: () => store.reset(),
        };
    };
}
exports.createAsyncSliceBinder = createAsyncSliceBinder;
