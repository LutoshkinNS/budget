import type { ReactNode } from "react";

import styles from "./Notification.module.css";

export type NotificationUiProps = {
  variant: "success" | "error";
  onClose?: () => void;
  children?: ReactNode;
};

export function Notification({ variant, onClose, children }: NotificationUiProps) {
  return (
    <div className={`${styles.notification} ${styles[variant]}`}>
      <div className={styles.content}>{children}</div>
      {onClose && (
        <button className={styles.close} onClick={onClose}>
          ×
        </button>
      )}
    </div>
  );
}
