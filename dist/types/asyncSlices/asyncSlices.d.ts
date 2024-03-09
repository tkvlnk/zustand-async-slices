import type { StateCreator } from "zustand";
import type { AsyncSliceKeys, StoreApiEssence } from "../types";
export declare function asyncSlices<S, Context extends Record<string, unknown>, Methods extends Record<AsyncSliceKeys<S>, (this: Context & StoreApiEssence<S>, ...params: never[]) => Promise<unknown>>>(stateCreator: StateCreator<Omit<S, AsyncSliceKeys<S>>>, asyncMethods: Methods, additionalAsyncMethodContext?: Context): StateCreator<S>;
