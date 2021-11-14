import React from "react";
import { useQuery } from "../context/Websockets";
import Typography from "../typography/Typography";

type QueryOneProps = {};

const QueryOne: React.FC<QueryOneProps> = () => {
  const queryValue = useQuery({
    type: "rest",
    url: "/query/1",
  });
  return (
    <>
      <Typography variant="h4">QueryOne</Typography>
      <pre>{JSON.stringify(queryValue)}</pre>
    </>
  );
};

export default QueryOne;
