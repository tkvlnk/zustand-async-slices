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

    const executeAsync = async (...params: P) => {
      store.handleStart(params);

      try {
        const data = await fetcher(...params);

        store.handleSuccess(data, params);
      } catch (error) {
        store.handleError(error as Error, params);

        throw error;
      }
    };

    return {
      data: null,
      status: AsyncStatus.Idle,
      error: null,
      lastExecParams: undefined,
      pendingExecParams: [],
      executeAsync,
      execute: (...params: P) => void executeAsync(...params).catch(() => {}),
      isSettled: () =>
        ([AsyncStatus.Success, AsyncStatus.Error] as AsyncStatus[]).includes(
          store.getSlice().status
        ),
      isIdle: () => store.getSlice().status === AsyncStatus.Idle,
      isPending: () => store.getSlice().status === AsyncStatus.Pending,
      isSuccess: () => store.getSlice().status === AsyncStatus.Success,
      isError: () => store.getSlice().status === AsyncStatus.Error,
      get: () => {
        const { data, error } = store.getSlice();

        if (!data) {
          throw new Error(
            [
              `Value of '${namespace.toString()}' is not available.`,
              error?.message && `Related error message: ${error.message}`,
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

