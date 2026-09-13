// static/js/main.js
import { initHomeScreen } from "./screens/home.js";

document.addEventListener("DOMContentLoaded", async function () {
  try {
    await initHomeScreen();
  } catch (error) {
    console.error("Error initializing home screen:", error);
  }

  // if ("serviceWorker" in navigator) {
  //   navigator.serviceWorker.register("./service-worker.js")
  //     .then(() => console.log("Service Worker registered"))
  //     .catch(err => console.error("Service Worker failed:", err));
  // }
});
