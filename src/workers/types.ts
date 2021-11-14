import { Patch } from "immer";

export type State = Record<string, unknown>;

export type IncomingMessageType = "registerQuery" | "unregisterQuery";
export type IncomingMessageFormat =
  | RegisterQueryMessage
  | UnregisterQueryMessage;
export type RegisterQueryMessage = {
  action: "registerQuery";
  queryId: string;
  key: string;
  query: unknown;
  pollInterval: number;
};
export type UnregisterQueryMessage = {
  action: "unregisterQuery";
  queryId: string;
  key: string;
};

export type OutgoingMessageType = "load" | "patch";
export type OutgoingMessageFormat =
  | {
      type: "load";
      data: State;
    }
  | {
      type: "patch";
      data: Patch[];
    }
  | {
      type: "message";
      data: string;
    };
