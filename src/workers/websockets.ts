import { Patch, enablePatches, produceWithPatches } from "immer";
import { WEBSOCKET_BROADCAST_CHANNEL_NAME } from "./constants";
import {
  State,
  OutgoingMessageFormat,
  IncomingMessageFormat,
  RegisterQueryMessage,
  UnregisterQueryMessage,
} from "./types";
import hash from "hash-sum";
enablePatches();

const broadcastChannel = new BroadcastChannel(WEBSOCKET_BROADCAST_CHANNEL_NAME);

// global state. initialise with something small
let state: State = {
  key1: 1,
};

// global to store queued patches before flushing to clients
const patches: Patch[] = [];

// Map of all active queries. Should contain any query that at least one client
// is currently listening for

type ActiveQuery = {
  query: unknown;
  pollInterval: number;
  references: Set<string>;
};
const activeQueries = new Map<string, ActiveQuery>();

// Dummy state update function to add and delete items from shared state
async function modifyState() {
  const op = Math.random() >= 0.5 ? "add" : "delete";
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

// flush any patches that have accumulated from state changes
function flushPatches(channel: MessagePort | BroadcastChannel) {
  if (!patches.length) return;
  const msg: OutgoingMessageFormat = {
    type: "patch",
    data: patches.splice(0, patches.length),
  };
  channel.postMessage(msg);
}

// recursive setTimeout. Unlike setInterval, this won't let
// slow-running requests stack up if their runtime
// exceeds the timeout
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

// run flushPatches every second
function runFlushPatches(channel: MessagePort | BroadcastChannel) {
  safeInterval(flushPatches, [channel], 1000);
}

// Update the state every 10ms
function runModifyState() {
  safeInterval(modifyState, [], 10);
}

// Send a regular heartbeat with a timestamp
// mostly useful to check that we're receiving regular messages
// across our channel, probably unnecessary now
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

// push the entire state tree
function pushState(channel: MessagePort | BroadcastChannel) {
  const initMsg: OutgoingMessageFormat = {
    type: "load",
    data: state,
  };
  channel.postMessage(initMsg);
}

// to make sure the state never gets completely out of sync due
// to a missed patchset, we can just push the entire state to
// connected clients at some regular interval
// unclear whether this is required or not
function runPushState(channel: MessagePort | BroadcastChannel) {
  safeInterval(pushState, [channel], 15 * 1000);
}

function registerQuery(data: RegisterQueryMessage) {
  const { key, queryId, query, pollInterval } = data;
  if (!activeQueries.has(key)) {
    activeQueries.set(key, {
      references: new Set([queryId]),
      query,
      pollInterval,
    });
  } else {
    const q = activeQueries.get(key);
    if (!q) return;
    q.references.add(queryId);
    q.pollInterval = Math.min(pollInterval, q.pollInterval);
  }
}

function unregisterQuery(data: UnregisterQueryMessage) {
  const { key, queryId } = data;
  if (activeQueries.has(key)) {
    const q = activeQueries.get(key);
    if (!q) return;
    q.references.delete(queryId);
    if (!q.references.size) {
      activeQueries.delete(key);
    }
  }
}

// onMessage handler to register new queries from the client
function handleMessage(msg: MessageEvent<IncomingMessageFormat>) {
  const { action } = msg.data;
  switch (action) {
    case "registerQuery": {
      registerQuery(msg.data);
      break;
    }
    case "unregisterQuery":
      unregisterQuery(msg.data);
      break;
    default:
    // do nothing
  }
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

  port.onmessage = handleMessage;
};

runModifyState();
safeInterval(() => console.log(activeQueries), [], 2000);
