import type { StateCreator } from "zustand";
import type { AsyncSliceCtx, AsyncSliceKeys } from "../types";
export declare function asyncSlices<StoreState, Context extends Record<string, unknown>, Methods extends Record<AsyncSliceKeys<StoreState>, (this: AsyncSliceCtx<StoreState, Context>, ...params: never[]) => Promise<unknown>>>(stateCreator: StateCreator<Omit<StoreState, AsyncSliceKeys<StoreState>>>, asyncMethods: Methods, additionalAsyncMethodContext?: Context): StateCreator<StoreState>;
