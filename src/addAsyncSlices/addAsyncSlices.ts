import type { StateCreator } from "zustand";
import type { AsyncSliceKeys, StoreApiEssence } from "../types";
import { createAsyncSliceBinder } from "../createAsyncSliceBinder/createAsyncSliceBinder";

export function addAsyncSlices<
  S,
  Context extends Record<string, unknown>,
  Methods extends Record<
    AsyncSliceKeys<S>,
    (this: Context & StoreApiEssence<S>, ...params: never[]) => Promise<unknown>
  >
>(
  stateCreator: StateCreator<Omit<S, AsyncSliceKeys<S>>>,
  asyncMethods: Methods,
  contextExtension = {} as Context
): StateCreator<S> {
  return (setState, getState, api) => {
    const bindAsyncSlice = createAsyncSliceBinder(api);

    const ctx = {
      setState,
      getState,
      ...contextExtension,
    };

    const bindAllAsyncSlices = () =>
      Object.fromEntries(
        Object.entries(asyncMethods).map(([key, fetcher]) => [
          key,
          bindAsyncSlice(
            key as AsyncSliceKeys<S>,
            (fetcher as Function).bind(ctx)
          ),
        ])
      );

    return {
      ...stateCreator(setState, getState, api),
      ...bindAllAsyncSlices(),
    } as S;
  };
}
