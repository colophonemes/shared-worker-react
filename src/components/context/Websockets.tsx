import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  IncomingMessageFormat,
  OutgoingMessageFormat,
  RegisterQueryMessage,
  State as WorkerState,
  UnregisterQueryMessage,
} from "../../workers/types";
import WebsocketsWorker from "../../workers/websockets?sharedworker";
import { applyPatches, enablePatches } from "immer";
import { WEBSOCKET_BROADCAST_CHANNEL_NAME } from "../../workers/constants";
import { v4 as uuidv4 } from "uuid";
import hash from "hash-sum";

// enable patch functionality for immer
enablePatches();

// global reference to our shared worker script
const worker = new WebsocketsWorker();

// global reference to the broadcast channel
const broadcastChannel = new BroadcastChannel(WEBSOCKET_BROADCAST_CHANNEL_NAME);

// create a unique ID for this client instance
const clientId = uuidv4();

const WebsocketsContext = createContext<WebsocketsContextValue>({
  // requestData: () => undefined,
  state: {},
  message: undefined,
});

type WebsocketsContextValue = {
  // requestData: (key: string, query: unknown) => void;
  state: WorkerState;
  message: string | undefined;
};

const { Provider } = WebsocketsContext;

type WebsocketsProviderProps = {
  children: React.ReactChild;
};

export const WebsocketsProvider: React.FC<WebsocketsProviderProps> = ({
  children,
}) => {
  const [state, setState] = useState<WorkerState>({});
  const [message, setMessage] = useState<string>();

  const value = {
    // requestData,
    state,
    message,
  };

  function handleMessage(
    event: MessageEvent<OutgoingMessageFormat>,
    channel: string
  ) {
    const msg = event.data;
    // console.log(channel, msg.type, msg.data);
    switch (msg.type) {
      case "load":
        setState(msg.data);
        break;
      case "patch":
        setState((state) => applyPatches(state, msg.data));
        break;
      case "message":
        setMessage(msg.data);
    }
  }

  useEffect(() => {
    worker.port.start();
    worker.port.onmessage = (event) => handleMessage(event, "worker");
    broadcastChannel.onmessage = (event) => handleMessage(event, "broadcast");
  }, [handleMessage]);

  return <Provider value={value}>{children}</Provider>;
};

export const useWebsockets = () => useContext(WebsocketsContext);

function registerQuery(
  key: string,
  query: unknown,
  queryId: string,
  pollInterval: number
) {
  const msg: RegisterQueryMessage = {
    action: "registerQuery",
    queryId,
    key,
    query,
    pollInterval,
  };
  worker.port.postMessage(msg);
}

function unregisterQuery(key: string, queryId: string) {
  const msg: UnregisterQueryMessage = {
    action: "unregisterQuery",
    key,
    queryId,
  };
  worker.port.postMessage(msg);
}

export function useQuery<T>(query: unknown, pollInterval = 1000): T {
  const queryId = useRef(uuidv4()).current;
  const key = useRef(hash(query)).current;

  // derive the current query value from the state
  const { state } = useWebsockets();
  const value: T = state[key] as T;

  // unregister the query on unmount
  useEffect(() => {
    // register the query with the shared worker
    registerQuery(key, query, queryId, pollInterval);
    return () => {
      unregisterQuery(key, queryId);
    };
  }, [key, query, queryId, pollInterval]);

  return value;
}
