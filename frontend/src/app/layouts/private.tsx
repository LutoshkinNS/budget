import { useLayoutEffect } from "react";
import { Link, Outlet, useNavigate } from "@tanstack/react-router";

import { useMe } from "@/entities/user";

const Space = () => {
  return " ";
};

export function PrivateLayout() {
  const { isLoading, error } = useMe();
  const navigate = useNavigate();

  useLayoutEffect(() => {
    if (!!error && error.statusCode === 401) {
      navigate({ to: "/login" });
    }
  }, [error, navigate]);

  if (isLoading || error?.statusCode === 401) {
    return <div>Загрузка данных о пользователе...</div>;
  }

  return (
    <div>
      <div>
        <Link to="/login">Login</Link>
        <Space />
        <Link to="/">Home</Link>
        <Space />
        <Link to="/categories">Categories</Link>
        <Space />
        <Link to="/settings">Settings</Link>
        <Space />
      </div>
      <hr />
      <Outlet />
    </div>
  );
}
