import { createContext, useContext, useEffect, useState } from "react";
import {
  OutgoingMessageFormat,
  State as WorkerState,
} from "../../workers/types";
import WebsocketsWorker from "../../workers/websockets?sharedworker";
import { applyPatches, enablePatches } from "immer";
import { WEBSOCKET_BROADCAST_CHANNEL_NAME } from "../../workers/constants";
enablePatches();

const WebsocketsContext = createContext<WebsocketsContext>({
  // requestData: () => undefined,
  state: {},
  message: undefined,
});

type WebsocketsContext = {
  // requestData: (key: string, query: unknown) => void;
  state: WorkerState;
  message: string | undefined;
};

const { Provider } = WebsocketsContext;

type WebsocketsProviderProps = {
  children: React.ReactChild;
};

const worker = new WebsocketsWorker();
const broadcastChannel = new BroadcastChannel(WEBSOCKET_BROADCAST_CHANNEL_NAME);

export const WebsocketsProvider: React.FC<WebsocketsProviderProps> = ({
  children,
}) => {
  const [state, setState] = useState<WorkerState>({});
  const [message, setMessage] = useState<string>();

  // function requestData(key: string, query: unknown) {
  //   worker.port.postMessage({ key, query, type: "registerQuery" });
  // return () => worker.port.postMessage({key, type: 'unregisterQuery' })
  // }

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
