import React from "react";
import { Outlet, Link } from "react-router-dom";
import Typography from "../typography/Typography";
import Header from "./Header";
import Nav from "./Nav";

type LayoutProps = {};

const Layout: React.FC<LayoutProps> = () => {
  return (
    <>
      <div className="container mx-auto">
        <Header>
          <Typography variant="title">Shared workers test</Typography>
          <Nav />
        </Header>
        <Outlet />
      </div>
    </>
  );
};

export default Layout;
