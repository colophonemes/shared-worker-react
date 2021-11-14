import { Patch } from "immer";

export type State = Record<string, unknown>;

export type IncomingMessageType = "registerQuery" | "unregisterQuery";
export type IncomingMessageFormat = {
  type: IncomingMessageType;
  key: string;
  query: unknown;
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
