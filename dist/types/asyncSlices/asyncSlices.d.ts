import type { StateCreator, StoreMutatorIdentifier } from "zustand";
import type { AsyncSliceCtx, AsyncSliceKeys } from "../types";
declare module "zustand" {
    interface StoreMutators<S, A> {
        "zustand/async-slices": S;
    }
}
export declare function asyncSlices<StoreState, Context extends Record<string, unknown>, Methods extends Record<AsyncSliceKeys<StoreState>, (this: AsyncSliceCtx<StoreState, Context>, ...params: never[]) => Promise<unknown>>, Mis extends [StoreMutatorIdentifier, unknown][] = [], Mos extends [StoreMutatorIdentifier, unknown][] = []>(stateCreator: StateCreator<StoreState, Mis, Mos, Omit<StoreState, AsyncSliceKeys<StoreState>>>, asyncMethods: Methods, additionalAsyncMethodContext?: Context): StateCreator<StoreState, Mis, [
    ...Mos,
    ["zustand/async-slices", never]
], Omit<StoreState, AsyncSliceKeys<StoreState>>>;
