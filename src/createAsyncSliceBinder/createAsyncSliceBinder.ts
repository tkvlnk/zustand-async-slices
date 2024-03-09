import {
  AsyncSlice,
  AsyncSliceKeys,
  AsyncStatus,
  StoreApiEssence,
} from "../types";
import { StoreFacadeForAsyncSlice } from "./StoreFacadeForAsyncSlice";

export function createAsyncSliceBinder<S>(storeApi: StoreApiEssence<S>) {
  return <K extends AsyncSliceKeys<S>, D, P extends unknown[]>(
    namespace: K,
    fetcher: S[K] extends AsyncSlice<D, P>
      ? (...params: P) => Promise<D>
      : never
  ) => {
    const store = new StoreFacadeForAsyncSlice<S, K>(namespace, storeApi);

    const executeStrict = async (...params: P) => {
      store.handleStart(params);

      try {
        const data = await fetcher(...params);

        store.handleSuccess(data, params);
      } catch (error) {
        store.handleError((error as Error).message, params);

        throw error;
      }
    };

    return {
      data: null,
      status: "idle",
      errorMessage: null,
      lastExecParams: undefined,
      pendingExecParams: [],
      executeStrict,
      execute: (...params: P) => executeStrict(...params).catch(() => {}),
      isPending: () => store.getSlice().status === AsyncStatus.Pending,
      isLoading: () =>
        ([AsyncStatus.Idle, AsyncStatus.Pending] as AsyncStatus[]).includes(
          store.getSlice().status
        ),
      get: () => {
        const { data, errorMessage } = store.getSlice();

        /* istanbul ignore if */
        if (!data) {
          throw new Error(
            [
              `Value of '${namespace.toString()}' is not available.`,
              errorMessage && `Related error message: ${errorMessage}`,
            ]
              .filter(Boolean)
              .join("\n")
          );
        }

        return data as D;
      },
      reset: () => store.reset(),
    } as AsyncSlice<D, P>;
  };
}
