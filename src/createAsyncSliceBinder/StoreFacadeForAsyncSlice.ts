import {
  AsyncSlice,
  AsyncSliceAtKey,
  AsyncSliceKeys,
  AsyncStatus,
  StoreApiEssence,
} from "../types";

export class StoreFacadeForAsyncSlice<S, K extends AsyncSliceKeys<S>> {
  constructor(private namespace: K, private store: StoreApiEssence<S>) {}

  getSlice<V extends AsyncSlice>() {
    return this.store.getState()[this.namespace] as V;
  }

  private setSlice<V extends AsyncSlice>(
    calcNext: (current: V) => Partial<V>,
    actionName: string
  ) {
    return this.store.setState(
      ({ [this.namespace]: current }) =>
        ({
          [this.namespace]: {
            ...current,
            ...calcNext(current as V),
          },
        } as Partial<S>),
      undefined,
      actionName
    );
  }

  handleStart(execParams: AsyncSliceAtKey<S, K>["pendingExecParams"][number]) {
    this.setSlice(
      ({ pendingExecParams }) => ({
        status: AsyncStatus.Pending,
        lastExecParams: execParams,
        pendingExecParams: [...pendingExecParams, execParams],
      }),
      `${this.namespace.toString()}/${AsyncStatus.Pending}`
    );
  }

  handleSuccess(
    data: AsyncSliceAtKey<S, K>["data"],
    params: AsyncSliceAtKey<S, K>["pendingExecParams"][number]
  ) {
    this.setSlice((current) => {
      const pendingExecParams = current.pendingExecParams.filter(
        (currParams) => currParams !== params
      );

      return {
        data,
        pendingExecParams,
        status:
          pendingExecParams.length > 0
            ? AsyncStatus.Pending
            : AsyncStatus.Success,
      };
    }, `${this.namespace.toString()}/${AsyncStatus.Success}`);
  }

  handleError(
    error: Error,
    params: AsyncSliceAtKey<S, K>["pendingExecParams"][number]
  ) {
    this.setSlice((current) => {
      const pendingExecParams = current.pendingExecParams.filter(
        (currParams) => currParams !== params
      );

      return {
        error,
        pendingExecParams,
        status:
          pendingExecParams.length > 0
            ? AsyncStatus.Pending
            : AsyncStatus.Error,
      };
    }, `${this.namespace.toString()}/${AsyncStatus.Error}`);
  }

  reset() {
    this.setSlice(
      () => ({
        data: null,
        status: AsyncStatus.Idle,
        lastExecParams: undefined,
        pendingExecParams: [],
        errorMessage: null,
      }),
      `${this.namespace.toString()}/reset`
    );
  }
}
