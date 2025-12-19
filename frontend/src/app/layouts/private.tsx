import { Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

const Space = () => {
  return " ";
};

export function PrivateLayout() {
  return (
    <div>
      <div>
        <Link to="/login">Login</Link>
        <Space />
        <Link to="/">Home</Link>
        <Space />
        <Link to="/categories">Categories</Link>
        <Space />
      </div>
      <hr />
      <Outlet />
      <TanStackRouterDevtools />
    </div>
  );
}
