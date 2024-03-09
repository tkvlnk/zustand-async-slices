import { createStore } from "zustand";
import { addAsyncSlices } from "./addAsyncSlices";
import { AsyncSliceCtx, AsyncStatus, StateWithAsyncSlices } from "./types";

const logger = jest.fn();

function waitFor(
  this: AsyncSliceCtx<StoreState, { logger(): void }>,
  { ok, delay }: { ok: boolean; delay: number }
) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (ok) {
        this.logger();
        resolve(
          `ok after ${delay}ms and gouble count: ${this.getState().doubleCount()}`
        );
      } else {
        reject(new Error(`not ok after ${delay}ms`));
      }
    }, delay);
  });
}

const methods = {
  waitFor,
};

type StoreState = StateWithAsyncSlices<
  {
    counter: number;
    increment(): void;
    doubleCount(): number;
  },
  typeof methods
>;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const createTestStore = () =>
  createStore<StoreState>(
    addAsyncSlices(
      (set, get) => ({
        counter: 0,
        increment() {
          set((state) => ({ counter: state.counter + 1 }));
        },
        doubleCount() {
          return get().counter * 2;
        },
        fake: null as any,
      }),
      methods,
      {
        logger,
      }
    )
  );

it("should be in in success state after full delay", async () => {
  const store = createTestStore();

  const DELAY = 1000;

  store.getState().increment();
  store.getState().increment();

  store.getState().waitFor.execute({ ok: true, delay: DELAY });

  await wait(DELAY + 1);

  const state = store.getState();

  expect(state.waitFor.status).toBe(AsyncStatus.Success);
  expect(state.waitFor.data).toBe(`ok after ${DELAY}ms and gouble count: 4`);
  expect(logger).toHaveBeenCalledTimes(1);
});
