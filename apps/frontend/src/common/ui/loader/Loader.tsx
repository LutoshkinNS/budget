import { useIsMutating } from "@tanstack/react-query";
import clsx from "clsx";

import loaderImg from "./lucik.png";

import s from "./loader.module.css";

export function Loader({ overlay }: { overlay?: boolean }) {
  return (
    <div className={clsx(s.container, overlay && s.overlay)}>
      <img src={loaderImg} className={s.img} />
    </div>
  );
}

export function GlobalLoader() {
  const count = useIsMutating();
  if (!count) return null;
  return <Loader overlay />;
}
