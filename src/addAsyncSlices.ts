import type { StateCreator } from "zustand";
import type { AsyncSliceKeys, StoreApiEssence } from "./types";
import { createAsyncSliceBinder } from "./createAsyncSliceBinder/createAsyncSliceBinder";

export function addAsyncSlices<S>() {
  return <
      Context extends Record<string, unknown>,
      MethodKeys extends AsyncSliceKeys<S>,
      Methods extends Record<
        MethodKeys,
        (
          this: Context & StoreApiEssence<S>,
          ...params: never[]
        ) => Promise<unknown>
      >
    >(
      stateCreator: StateCreator<Omit<S, MethodKeys>>,
      asyncMethods: Methods,
      contextExtension = {} as Context,
    ): StateCreator<S> =>
    (setState, getState, api) => {
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
