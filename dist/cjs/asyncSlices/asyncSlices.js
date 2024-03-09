"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncSlices = void 0;
const createAsyncSliceBinder_1 = require("../createAsyncSliceBinder/createAsyncSliceBinder");
function asyncSlices(stateCreator, asyncMethods, additionalAsyncMethodContext = {}) {
    return (setState, getState, api) => {
        const bindAsyncSlice = (0, createAsyncSliceBinder_1.createAsyncSliceBinder)(api);
        const ctx = Object.assign({ setState,
            getState }, additionalAsyncMethodContext);
        const bindAllAsyncSlices = () => Object.fromEntries(Object.entries(asyncMethods).map(([key, fetcher]) => [
            key,
            bindAsyncSlice(key, fetcher.bind(ctx)),
        ]));
        return Object.assign(Object.assign({}, stateCreator(setState, getState, api)), bindAllAsyncSlices());
    };
}
exports.asyncSlices = asyncSlices;
