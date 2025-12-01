import { Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Layout = () => (
  <>
    <div>
      <Link to="/">Home</Link>
      <Link to="/categories">Categories</Link>
    </div>
    <hr />
    <Outlet />
    <TanStackRouterDevtools />
  </>
);
