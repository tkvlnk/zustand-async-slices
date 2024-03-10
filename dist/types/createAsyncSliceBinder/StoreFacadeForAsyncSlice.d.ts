import { AsyncSlice, AsyncSliceAtKey, AsyncSliceKeys, StoreApiEssence } from "../types";
export declare class StoreFacadeForAsyncSlice<S, K extends AsyncSliceKeys<S>> {
    private namespace;
    private store;
    constructor(namespace: K, store: StoreApiEssence<S>);
    getSlice<V extends AsyncSlice>(): V;
    private setSlice;
    handleStart(execParams: AsyncSliceAtKey<S, K>["pendingExecParams"][number]): void;
    handleSuccess(data: AsyncSliceAtKey<S, K>["data"], params: AsyncSliceAtKey<S, K>["pendingExecParams"][number]): void;
    handleError(error: Error, params: AsyncSliceAtKey<S, K>["pendingExecParams"][number]): void;
    reset(): void;
}
