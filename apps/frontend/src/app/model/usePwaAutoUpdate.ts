import { useEffect } from "react";

export function usePwaAutoUpdate() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    let refreshTimer: number | undefined;

    const applyUpdate = async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        return;
      }

      await registration.update();

      if (registration.waiting) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
      }
    };

    const handleControllerChange = () => {
      window.location.reload();
    };

    void applyUpdate();
    refreshTimer = window.setInterval(() => {
      void applyUpdate();
    }, 60 * 60 * 1000);

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      handleControllerChange,
    );
    window.addEventListener("focus", applyUpdate);

    return () => {
      if (refreshTimer) {
        window.clearInterval(refreshTimer);
      }
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange,
      );
      window.removeEventListener("focus", applyUpdate);
    };
  }, []);
}
