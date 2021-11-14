import React from "react";
import { useQuery } from "../context/Websockets";
import Typography from "../typography/Typography";

type QueryTwoProps = {};

const QueryTwo: React.FC<QueryTwoProps> = () => {
  const queryValue = useQuery({
    type: "rest",
    url: "/query/2",
  });
  return (
    <>
      <Typography variant="h4">QueryTwo</Typography>
      <pre>{JSON.stringify(queryValue)}</pre>
    </>
  );
};

export default QueryTwo;
