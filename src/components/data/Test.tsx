import React, { useEffect } from "react";
import { useWebsockets } from "../context/Websockets";
import Typography from "../typography/Typography";

type TestProps = {};

const Test: React.FC<TestProps> = () => {
  const { state, message } = useWebsockets();
  const sum = Object.values(state)
    .filter((n): n is number => typeof n === "number")
    .reduce((prev, curr) => curr + prev, 0);
  // useEffect(() => {
  //   const t = setInterval(() => {
  //     console.log("requesting data");
  //     requestData("random-number", { foo: "bar" });
  //   }, 2000);
  //   return () => clearInterval(t);
  // });
  return (
    <>
      <Typography variant="h3">
        {Object.keys(state).length} | {sum}
      </Typography>
      {message && (
        <div className="bg-red-200 p-2 border-radius-2">
          <Typography variant="h5">{message}</Typography>
        </div>
      )}
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </>
  );
};

export default Test;
