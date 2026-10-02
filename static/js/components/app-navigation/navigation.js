// static/js/components/app-navigation/navigation.js
export function pushNavigation(state) {
  history.pushState(state, "", "");
}

export function replaceNavigation(state) {
  history.replaceState(state, "", "");
}