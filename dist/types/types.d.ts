import type { NamedSet } from "zustand/middleware/devtools";
export declare const AsyncStatus: {
    readonly Idle: "idle";
    readonly Pending: "pending";
    readonly Success: "success";
    readonly Error: "error";
};
export type AsyncStatus = typeof AsyncStatus[keyof typeof AsyncStatus];
export type AsyncSlice<D = unknown, P extends unknown[] = unknown[]> = {
    data: D | null;
    error: Error | null;
    status: AsyncStatus;
    execute(...params: P): void;
    executeAsync(...params: P): Promise<void>;
    pendingExecParams: P[];
    lastExecParams: P | undefined;
    isSettled(): boolean;
    isIdle(): boolean;
    isPending(): boolean;
    isSuccess(): boolean;
    isError(): boolean;
    get(): D;
    reset(): void;
};
export type AsyncSliceKeys<S> = {
    [K in keyof S]: S[K] extends AsyncSlice ? K : never;
}[keyof S];
export type StoreApiEssence<S> = {
    getState: () => S;
    setState: NamedSet<S>;
};
export type AsyncSliceCtx<S, C extends Record<string, unknown> = Record<string, unknown>> = C & StoreApiEssence<S>;
export type StateWithAsyncSlices<State, Methods extends Record<string, unknown>> = State & AsyncSlicesFromMethods<Methods>;
export type AsyncSlicesFromMethods<Methods extends Record<string, unknown>> = {
    [K in keyof Methods]: Methods[K] extends (...params: infer P) => Promise<infer D> ? AsyncSlice<D, P> : never;
};
export type AsyncSliceAtKey<S, K extends AsyncSliceKeys<S>> = S[K] extends AsyncSlice<infer D, infer P> ? AsyncSlice<D, P> : never;
