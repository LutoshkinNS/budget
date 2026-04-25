import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

import s from "./AccountAvatar.module.css";

type AccountAvatarProps = {
  name: string;
  src?: string;
  size?: number;
  className?: string;
};

export function AccountAvatar({
  name,
  src,
  size = 40,
  className,
}: AccountAvatarProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={wrapperRef} className={clsx(s.wrapper, className)}>
      <div
        className={s.avatar}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className={s.letter}>{name[0]?.toUpperCase()}</span>
        {src && (
          <img
            src={src}
            alt={name}
            className={clsx(s.image, imgLoaded && s.imageVisible)}
            onLoad={() => setImgLoaded(true)}
          />
        )}
      </div>
      {open && (
        <div className={s.dropdown}>
          <span className={s.dropdownName}>{name}</span>
        </div>
      )}
    </div>
  );
}
