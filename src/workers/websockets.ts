import { Patch, enablePatches, produceWithPatches } from "immer";
import { WEBSOCKET_BROADCAST_CHANNEL_NAME } from "./constants";
import { State, OutgoingMessageFormat } from "./types";
enablePatches();

const broadcastChannel = new BroadcastChannel(WEBSOCKET_BROADCAST_CHANNEL_NAME);

let state: State = {
  key1: 1,
};
const patches: Patch[] = [];

async function modifyState() {
  const op = Math.random() > 0.5 ? "add" : "delete";
  switch (op) {
    case "add": {
      const key = `key${Math.floor(Math.random() * 1e6)}`;
      const val = Math.floor(Math.random() * 1e6);
      const [newState, patchSet] = produceWithPatches(state, (draft) => {
        draft[key] = val;
      });
      patches.push(...patchSet);
      state = newState;
      break;
    }
    case "delete": {
      const keys = Object.keys(state);
      const index = Math.floor(Math.random() * keys.length);
      const key = keys[index];
      const [newState, patchSet] = produceWithPatches(state, (draft) => {
        delete draft[key];
      });
      patches.push(...patchSet);
      state = newState;
      break;
    }
  }
}

function flushPatches(channel: MessagePort | BroadcastChannel) {
  if (!patches.length) return;
  const msg: OutgoingMessageFormat = {
    type: "patch",
    data: patches.splice(0, patches.length),
  };
  channel.postMessage(msg);
}

function safeInterval<T extends Array<any>>(
  fn: (...args: T) => unknown,
  args: T,
  timeout = 1000
) {
  fn(...args);
  setTimeout(() => {
    safeInterval(fn, args, timeout);
  }, timeout);
}

function runFlushPatches(channel: MessagePort | BroadcastChannel) {
  safeInterval(flushPatches, [channel], 1000);
}

function runModifyState() {
  safeInterval(modifyState, [], 10);
}

function runHeartbeat(channel: MessagePort | BroadcastChannel) {
  safeInterval(
    (channel: MessagePort | BroadcastChannel) => {
      const msg: OutgoingMessageFormat = {
        type: "message",
        data: `Keep Alive: ${new Date().toISOString()}`,
      };
      channel.postMessage(msg);
    },
    [channel],
    4000
  );
}

function pushState(channel: MessagePort | BroadcastChannel) {
  const initMsg: OutgoingMessageFormat = {
    type: "load",
    data: state,
  };
  channel.postMessage(initMsg);
}

function runPushState(channel: MessagePort | BroadcastChannel) {
  safeInterval(pushState, [channel], 15 * 1000);
}

// Event handler called when a tab tries to connect to this worker.
onconnect = (e) => {
  const port = e.ports[0];
  console.log("port connected");

  // load initial state, and sync periodically
  runPushState(broadcastChannel);

  // flush patches to client every second
  runFlushPatches(broadcastChannel);

  // send a message
  runHeartbeat(broadcastChannel);

  // port.onmessage = async (msg: MessageEvent<MessageFormat>) => {
  //   console.log("got message", msg.data);
  //   msg.data.key;
  //   switch (msg.data.type) {
  //     case "get":
  //       const body = await getData(msg.data.query);

  //     default:
  //     //
  //   }
  // };
};

runModifyState();
