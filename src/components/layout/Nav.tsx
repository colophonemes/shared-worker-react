import clsx from "clsx";
import React from "react";
import { Link, LinkProps } from "react-router-dom";

const NavLink: React.FC<LinkProps> = ({ className, ...props }) => (
  <Link
    className={clsx("text-blue-500 hover:text-blue-800", className)}
    {...props}
  />
);

const Nav: React.FC = () => {
  return (
    <>
      <ul className="flex">
        <li className="mr-6">
          <NavLink to="/query1">Query 1</NavLink>
        </li>
        <li className="mr-6">
          <NavLink to="/query2">Query 2</NavLink>
        </li>
        <li className="mr-6">
          <NavLink to="/query3">Query 3</NavLink>
        </li>
      </ul>
    </>
  );
};

export default Nav;
