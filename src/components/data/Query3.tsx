import React from "react";
import { useQuery } from "../context/Websockets";
import Typography from "../typography/Typography";

type QueryThreeProps = {};

const QueryThree: React.FC<QueryThreeProps> = () => {
  const queryValue = useQuery({
    type: "rest",
    url: "/query/3",
  });
  return (
    <>
      <Typography variant="h4">QueryThree</Typography>
      <pre>{JSON.stringify(queryValue)}</pre>
    </>
  );
};

export default QueryThree;
