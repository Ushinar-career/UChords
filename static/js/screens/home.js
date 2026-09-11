// static\js\screens\home.js
import { initHeader } from "../components/app-header/app-header.js";
import { initBody } from "../components/app-body/app-body.js";
import { initFooter } from "../components/app-footer/app-footer.js";


export async function initHomeScreen() {
  try {
    await new Promise(resolve => {
      setTimeout(() => {
        initHeader();
        initBody();
        initFooter();
        resolve();
      }, 300);
    });
  } catch (error) {
    console.error("Error inside initHomeScreen:", error);
    throw error;
  }
}

