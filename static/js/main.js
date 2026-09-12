// static/js/main.js
import { initHomeScreen } from "./screens/home.js";

document.addEventListener("DOMContentLoaded", async function () {
  const loader = document.querySelector(".app-loader");

  try {
    await initHomeScreen();
    if (loader) {
      loader.classList.add("hidden");
    }
  } catch (error) {
    console.error("Error initializing home screen:", error);
  }

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/service-worker.js")
      .then(() => console.log("Service Worker registered"))
      .catch(err => console.error("Service Worker failed:", err));
  }
});
