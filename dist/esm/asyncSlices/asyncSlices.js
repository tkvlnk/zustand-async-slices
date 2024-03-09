import { createAsyncSliceBinder } from "../createAsyncSliceBinder/createAsyncSliceBinder";
export function asyncSlices(stateCreator, asyncMethods, additionalAsyncMethodContext = {}) {
    return (setState, getState, api) => {
        const bindAsyncSlice = createAsyncSliceBinder(api);
        const ctx = Object.assign({ setState,
            getState }, additionalAsyncMethodContext);
        const bindAllAsyncSlices = () => Object.fromEntries(Object.entries(asyncMethods).map(([key, fetcher]) => [
            key,
            bindAsyncSlice(key, fetcher.bind(ctx)),
        ]));
        return Object.assign(Object.assign({}, stateCreator(setState, getState, api)), bindAllAsyncSlices());
    };
}
