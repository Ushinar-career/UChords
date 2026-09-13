// static/js/screens/home.js
import { initHeader } from "../components/app-header/app-header.js";
import { initBody } from "../components/app-body/app-body.js";
import { initFooter } from "../components/app-footer/app-footer.js";

function waitForImages() {
  const images = Array.from(document.images);
  return Promise.all(
    images.map(img =>
      img.complete
        ? Promise.resolve()
        : new Promise(resolve => {
            img.addEventListener("load", resolve);
            img.addEventListener("error", resolve);
          })
    )
  );
}

export async function initHomeScreen() {
  const loader = document.querySelector(".app-loader");

  try {
    initHeader();
    initBody();
    initFooter();

    await Promise.all([waitForImages(), document.fonts.ready]);

    if (loader) {
      loader.classList.add("hidden");
    }
  } catch (error) {
    console.error("Error inside initHomeScreen:", error);
    throw error;
  }
}
