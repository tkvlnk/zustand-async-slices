var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { AsyncStatus, } from "../types";
import { StoreFacadeForAsyncSlice } from "./StoreFacadeForAsyncSlice";
export function createAsyncSliceBinder(storeApi) {
    return (namespace, fetcher) => {
        const store = new StoreFacadeForAsyncSlice(namespace, storeApi);
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
            status: AsyncStatus.Idle,
            error: null,
            lastExecParams: undefined,
            pendingExecParams: [],
            executeAsync,
            execute: (...params) => void executeAsync(...params).catch(() => { }),
            isSettled: () => [AsyncStatus.Success, AsyncStatus.Error].includes(store.getSlice().status),
            isIdle: () => store.getSlice().status === AsyncStatus.Idle,
            isPending: () => store.getSlice().status === AsyncStatus.Pending,
            isSuccess: () => store.getSlice().status === AsyncStatus.Success,
            isError: () => store.getSlice().status === AsyncStatus.Error,
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
