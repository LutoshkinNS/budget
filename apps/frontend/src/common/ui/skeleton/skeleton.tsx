import styles from "./skeleton.module.css";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  const classes = className ? `${styles.skeleton} ${className}` : styles.skeleton;

  return <div aria-hidden="true" className={classes} />;
}
