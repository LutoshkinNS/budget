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
  // Мутации с локальной обратной связью не дублируются общим overlay.
  const count = useIsMutating({
    predicate: (mutation) => mutation.meta?.localFeedback !== true,
  });
  if (!count) return null;
  return <Loader overlay />;
}
