import clsx from "clsx";
import React from "react";

type HeaderProps = {
  children: React.ReactChild;
  className?: string;
};

const Header: React.FC<HeaderProps> = ({ children, className }) => {
  return <header className={clsx(className, "my-4")}>{children}</header>;
};

export default Header;
