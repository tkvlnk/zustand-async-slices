import type { StateCreator, StoreMutatorIdentifier } from "zustand";
import type { AsyncSliceCtx, AsyncSliceKeys, StateWithAsyncSlices } from "../types";
declare module "zustand" {
    interface StoreMutators<S, A> {
        "zustand/async-slices": A extends Record<string, unknown> ? StateWithAsyncSlices<S, A> : S;
    }
}
export declare function asyncSlices<StoreState, Context extends Record<string, unknown>, Methods extends Record<AsyncSliceKeys<StoreState>, (this: AsyncSliceCtx<StoreState, Context>, ...params: never[]) => Promise<unknown>>, Mis extends [StoreMutatorIdentifier, unknown][] = [], Mos extends [StoreMutatorIdentifier, unknown][] = []>(stateCreator: StateCreator<StoreState, Mis, Mos, Omit<StoreState, AsyncSliceKeys<StoreState>>>, asyncMethods: Methods, additionalAsyncMethodContext?: Context): StateCreator<StoreState, Mis, [
    ...Mos,
    ["zustand/async-slices", Methods]
]>;
