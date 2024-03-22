var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
        return Object.assign(Object.create(jsonableSlice), {
            data: null,
            status: AsyncStatus.Idle,
            error: null,
            lastExecParams: undefined,
            pendingExecParams: [],
            executeAsync,
            execute: (...params) => void executeAsync(...params).then(() => { }, () => { }),
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
        });
    };
}
const jsonableSlice = {
    toJSON() {
        const _a = this, { error } = _a, json = __rest(_a, ["error"]);
        return Object.assign(Object.assign({}, json), { error: error === null || error === void 0 ? void 0 : error.message });
    },
};
