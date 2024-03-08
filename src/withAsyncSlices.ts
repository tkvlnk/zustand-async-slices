import type { StateCreator } from "zustand";
import type {
  AsyncSlice,
  AsyncSliceKeys,
  StoreApiEssence,
} from "./types";
import { createAsyncSliceBinder } from "./createAsyncSliceBinder/createAsyncSliceBinder";


export function withAsyncSlices<S extends Record<string, unknown>>(
  stateCreator: StateCreator<Omit<S, AsyncSliceKeys<S>>>
) {
  return <
      Context extends Record<string, unknown>,
      Methods extends Record<
        AsyncSliceKeys<S>,
        (
          this: Context & StoreApiEssence<S>,
          ...params: never[]
        ) => Promise<unknown>
      >
    >({
      asyncMethods,
      contextExtension = {} as Context,
    }: {
      asyncMethods: Methods;
      contextExtension?: Context;
    }): StateCreator<S> =>
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
