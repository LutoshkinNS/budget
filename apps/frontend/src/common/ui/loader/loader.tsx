import loaderImg from "./lucik.png";

import s from "./loader.module.css";

export function Loader() {
  return (
    <div className={s.container}>
      <img src={loaderImg} className={s.img} />
    </div>
  );
}
