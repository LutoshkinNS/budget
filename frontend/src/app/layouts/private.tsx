import { Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export function PrivateLayout() {
  return (
    <div>
      <div>
        <Link to="/login">Login</Link>
        <Link to="/">Home</Link>
        <Link to="/categories">Categories</Link>
      </div>
      <hr />
      <Outlet />
      <TanStackRouterDevtools />
    </div>
  );
}
