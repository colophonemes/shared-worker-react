import { useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import Typography from "./components/typography/Typography";
import Header from "./components/layout/Header";
import { WebsocketsProvider } from "./components/context/Websockets";
import Test from "./components/data/Test";

function App() {
  return (
    <WebsocketsProvider>
      <div className="container mx-auto">
        <Header>
          <Typography variant="title">Shared workers test</Typography>
        </Header>
        <Test />
      </div>
    </WebsocketsProvider>
  );
}

export default App;
