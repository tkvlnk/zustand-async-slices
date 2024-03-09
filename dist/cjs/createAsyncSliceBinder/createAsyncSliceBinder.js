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
        const executeStrict = (...params) => __awaiter(this, void 0, void 0, function* () {
            store.handleStart(params);
            try {
                const data = yield fetcher(...params);
                store.handleSuccess(data, params);
            }
            catch (error) {
                store.handleError(error.message, params);
                throw error;
            }
        });
        return {
            data: null,
            status: "idle",
            errorMessage: null,
            lastExecParams: undefined,
            pendingExecParams: [],
            executeStrict,
            execute: (...params) => executeStrict(...params).catch(() => { }),
            isPending: () => store.getSlice().status === types_1.AsyncStatus.Pending,
            isLoading: () => [types_1.AsyncStatus.Idle, types_1.AsyncStatus.Pending].includes(store.getSlice().status),
            get: () => {
                const { data, errorMessage } = store.getSlice();
                /* istanbul ignore if */
                if (!data) {
                    throw new Error([
                        `Value of '${namespace.toString()}' is not available.`,
                        errorMessage && `Related error message: ${errorMessage}`,
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
