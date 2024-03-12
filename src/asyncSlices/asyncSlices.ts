import type { StateCreator } from "zustand";
import type { AsyncSliceCtx, AsyncSliceKeys } from "../types";
import { createAsyncSliceBinder } from "../createAsyncSliceBinder/createAsyncSliceBinder";

export function asyncSlices<
  StoreState,
  Context extends Record<string, unknown>,
  Methods extends Record<
    AsyncSliceKeys<StoreState>,
    (this: AsyncSliceCtx<StoreState, Context>, ...params: never[]) => Promise<unknown>
  >
>(
  stateCreator: StateCreator<Omit<StoreState, AsyncSliceKeys<StoreState>>>,
  asyncMethods: Methods,
  additionalAsyncMethodContext = {} as Context
): StateCreator<StoreState> {
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
