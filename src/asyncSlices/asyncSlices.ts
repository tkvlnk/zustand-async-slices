import type { StateCreator, StoreMutatorIdentifier } from "zustand";
import type { AsyncSliceCtx, AsyncSliceKeys, StateWithAsyncSlices } from "../types";
import { createAsyncSliceBinder } from "../createAsyncSliceBinder/createAsyncSliceBinder";


declare module "zustand" {
  interface StoreMutators<S, A> {
    "zustand/async-slices": A extends Record<string, unknown> ? StateWithAsyncSlices<S, A> : S;
  }
}

export function asyncSlices<
  StoreState,
  Context extends Record<string, unknown>,
  Methods extends Record<
    AsyncSliceKeys<StoreState>,
    (
      this: AsyncSliceCtx<StoreState, Context>,
      ...params: never[]
    ) => Promise<unknown>
  >,
  Mis extends [StoreMutatorIdentifier, unknown][] = [],
  Mos extends [StoreMutatorIdentifier, unknown][] = []
>(
  stateCreator: StateCreator<
    StoreState,
    Mis,
    Mos,
    Omit<StoreState, AsyncSliceKeys<StoreState>>
  >,
  asyncMethods: Methods,
  additionalAsyncMethodContext = {} as Context
): StateCreator<
  StoreState,
  Mis,
  [...Mos, ["zustand/async-slices", Methods]]
> {
  return (setState, getState, api) => {
    const bindAsyncSlice = createAsyncSliceBinder(api);

    const ctx = {
      setState,
      getState,
      ...additionalAsyncMethodContext,
    };

    const bindAllAsyncSlices = () =>
      Object.fromEntries(
        Object.entries(asyncMethods).map(([key, fetcher]) => [
          key,
          bindAsyncSlice(
            key as AsyncSliceKeys<StoreState>,
            (fetcher as Function).bind(ctx)
          ),
        ])
      );

    return {
      ...stateCreator(setState, getState, api),
      ...bindAllAsyncSlices(),
    } as StoreState;
  };
}
