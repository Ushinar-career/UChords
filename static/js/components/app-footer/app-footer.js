// static\js\components\app-footer\app-footer.js
export function initFooter() {
  const footer = document.querySelector(".app-footer");
  const year = new Date().getFullYear();
  footer.textContent = `©${year} UChords. All rights reserved.`;
}

