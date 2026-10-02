// static/js/main.js
import { initHomeScreen } from "./screens/home.js";
import { initRouter } from "./components/app-navigation/router.js";
import { replaceNavigation } from "./components/app-navigation/navigation.js";

document.addEventListener("DOMContentLoaded", async function () {
  initRouter();
  replaceNavigation({ screen: "playlists" });
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
