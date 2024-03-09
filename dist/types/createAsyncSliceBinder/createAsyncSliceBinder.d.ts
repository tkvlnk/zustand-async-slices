import { AsyncSlice, AsyncSliceKeys, StoreApiEssence } from "../types";
export declare function createAsyncSliceBinder<S>(storeApi: StoreApiEssence<S>): <K extends AsyncSliceKeys<S>, D, P extends unknown[]>(namespace: K, fetcher: S[K] extends AsyncSlice<D, P> ? (...params: P) => Promise<D> : never) => AsyncSlice<D, P>;
