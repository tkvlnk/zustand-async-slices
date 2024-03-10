import { createStore } from "zustand";
import { createAsyncSliceBinder } from "./createAsyncSliceBinder";
import { AsyncSlice, AsyncStatus } from "../types";

type StoreState = {
  waitFor: AsyncSlice<string, [{ ok: boolean; delay: number }]>;
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const createTestStore = () =>
  createStore<StoreState>((set, get) => {
    return {
      waitFor: createAsyncSliceBinder({ setState: set, getState: get })(
        "waitFor",
        ({ ok, delay }: { ok: boolean; delay: number }) =>
          new Promise((resolve, reject) => {
            setTimeout(() => {
              if (ok) {
                resolve(`ok after ${delay}ms`);
              } else {
                reject(new Error(`not ok after ${delay}ms`));
              }
            }, delay);
          })
      ),
    };
  });

it("should should have proper initial state", () => {
  const store = createTestStore();

  const state = store.getState();

  expect(state.waitFor.status).toBe(AsyncStatus.Idle);
  expect(state.waitFor.data).toBeNull();
  expect(state.waitFor.lastExecParams).toBeUndefined();
  expect(state.waitFor.pendingExecParams).toEqual([]);
  expect(state.waitFor.errorMessage).toBeNull();
  expect(state.waitFor.isLoading()).toBe(true);
  expect(state.waitFor.isPending()).toBe(false);
  expect(() => state.waitFor.get()).toThrow();
});

it("should be in pending state after execution", async () => {
  const store = createTestStore();

  const DELAY = 1000;

  store.getState().waitFor.execute({ ok: true, delay: DELAY });
  await wait(DELAY - 1);

  const state = store.getState();

  expect(state.waitFor.status).toBe(AsyncStatus.Pending);
  expect(state.waitFor.data).toBeNull();
  expect(state.waitFor.lastExecParams).toEqual([{ ok: true, delay: 1000 }]);
  expect(state.waitFor.pendingExecParams).toEqual([
    [{ ok: true, delay: 1000 }],
  ]);
  expect(state.waitFor.errorMessage).toBeNull();
  expect(state.waitFor.isLoading()).toBe(true);
  expect(state.waitFor.isPending()).toBe(true);
  expect(() => state.waitFor.get()).toThrow();
});

it("should be in in success state after full delay", async () => {
  const store = createTestStore();

  const DELAY = 1000;

  store.getState().waitFor.execute({ ok: true, delay: DELAY });
  expect(store.getState().waitFor.pendingExecParams).toEqual([
    [{ ok: true, delay: 1000 }],
  ]);
  await wait(DELAY + 1);

  const state = store.getState();

  expect(state.waitFor.status).toBe(AsyncStatus.Success);
  expect(state.waitFor.data).toBe(`ok after ${DELAY}ms`);
  expect(state.waitFor.lastExecParams).toEqual([{ ok: true, delay: 1000 }]);
  expect(state.waitFor.pendingExecParams).toEqual([]);
  expect(state.waitFor.errorMessage).toBeNull();
  expect(state.waitFor.isLoading()).toBe(false);
  expect(state.waitFor.isPending()).toBe(false);
  expect(state.waitFor.get()).toBe(`ok after ${DELAY}ms`);
});

it("should be in error state after full delay", async () => {
  const store = createTestStore();

  const DELAY = 1000;

  store.getState().waitFor.execute({ ok: false, delay: DELAY });
  expect(store.getState().waitFor.pendingExecParams).toEqual([
    [{ ok: false, delay: 1000 }],
  ]);
  await wait(DELAY + 1);

  const state = store.getState();

  expect(state.waitFor.status).toBe(AsyncStatus.Error);
  expect(state.waitFor.data).toBeNull();
  expect(state.waitFor.lastExecParams).toEqual([{ ok: false, delay: 1000 }]);
  expect(state.waitFor.pendingExecParams).toEqual([]);
  expect(state.waitFor.errorMessage).toBe(`not ok after ${DELAY}ms`);
  expect(state.waitFor.isLoading()).toBe(false);
  expect(state.waitFor.isPending()).toBe(false);
  expect(() => state.waitFor.get()).toThrow();
});

it("should throw for executeStrict while error", async () => {
  const store = createTestStore();

  const DELAY = 1000;

  expect(
    store.getState().waitFor.executeAsync({ ok: false, delay: DELAY })
  ).rejects.toMatchObject({ message: `not ok after ${DELAY}ms` });
});

it("should not throw for execute while error", async () => {
  const store = createTestStore();

  const DELAY = 1000;

  expect(
    () => store.getState().waitFor.execute({ ok: false, delay: DELAY })
  ).not.toThrow();
});

it("should keep being pending until all the executions are done", async () => {
  const store = createTestStore();

  const LONG_DELAY = 2000;
  const SHOWRT_DELAY = 1000;

  const LONG_CB = jest.fn();
  const SHORT_CB = jest.fn();

  store
    .getState()
    .waitFor.executeAsync({ ok: true, delay: LONG_DELAY })
    .then(LONG_CB);
  store
    .getState()
    .waitFor.executeAsync({ ok: true, delay: SHOWRT_DELAY })
    .then(SHORT_CB);

  expect(store.getState().waitFor.pendingExecParams).toEqual([
    [{ ok: true, delay: LONG_DELAY }],
    [{ ok: true, delay: SHOWRT_DELAY }],
  ]);

  await wait(SHOWRT_DELAY + 1);

  const stateAfterShortDelay = store.getState();

  expect(stateAfterShortDelay.waitFor.status).toBe(AsyncStatus.Pending);
  expect(stateAfterShortDelay.waitFor.lastExecParams).toEqual([
    { ok: true, delay: SHOWRT_DELAY },
  ]);
  expect(stateAfterShortDelay.waitFor.pendingExecParams).toEqual([
    [{ ok: true, delay: LONG_DELAY }],
  ]);
  expect(SHORT_CB).toHaveBeenCalledTimes(1);
  expect(LONG_CB).toHaveBeenCalledTimes(0);

  await wait(LONG_DELAY - SHOWRT_DELAY);

  const stateAfterLongDelay = store.getState();

  expect(stateAfterLongDelay.waitFor.status).toBe(AsyncStatus.Success);
  expect(stateAfterLongDelay.waitFor.data).toBe(`ok after ${LONG_DELAY}ms`);
  expect(stateAfterLongDelay.waitFor.lastExecParams).toEqual([
    { ok: true, delay: SHOWRT_DELAY },
  ]);
  expect(stateAfterLongDelay.waitFor.pendingExecParams).toEqual([]);
  expect(SHORT_CB).toHaveBeenCalledTimes(1);
  expect(LONG_CB).toHaveBeenCalledTimes(1);
});
