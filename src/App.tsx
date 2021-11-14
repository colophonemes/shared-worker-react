import "./App.css";
import Typography from "./components/typography/Typography";
import Header from "./components/layout/Header";
import { WebsocketsProvider } from "./components/context/Websockets";
import Test from "./components/data/Test";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout";
import QueryOne from "./components/data/Query1";
import QueryTwo from "./components/data/Query2";
import QueryThree from "./components/data/Query3";

function App() {
  return (
    <WebsocketsProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="query1" element={<QueryOne />} />
            <Route path="query2" element={<QueryTwo />} />
            <Route path="query3" element={<QueryThree />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </WebsocketsProvider>
  );
}

export default App;
