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
            isPending: () => store.getSlice().status === AsyncStatus.Pending,
            isLoading: () => [AsyncStatus.Idle, AsyncStatus.Pending].includes(store.getSlice().status),
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
