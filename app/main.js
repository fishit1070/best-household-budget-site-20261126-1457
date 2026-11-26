// Ledger Lane — router and boot.
// First load stays small: index.html pulls in only style.css and this file.
// The views module (and everything it imports: data, calculators, charts)
// is lazy-loaded on the first route render via dynamic import().

const KNOWN_ROUTES = [
  "dashboard",
  "budget",
  "trends",
  "goals",
  "calculators",
  "benchmarks",
  "playbook",
];

const DEFAULT_ROUTE = "dashboard";

function parseRoute() {
  const raw = (location.hash || "").replace(/^#\/?/, "").split(/[?#]/)[0];
  return KNOWN_ROUTES.includes(raw) ? raw : DEFAULT_ROUTE;
}

function setActiveNav(route) {
  document.querySelectorAll(".main-nav a[data-route]").forEach((link) => {
    const isActive = link.dataset.route === route;
    link.classList.toggle("active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

let viewsPromise = null;

function loadViews() {
  if (!viewsPromise) {
    viewsPromise = import("./views.js");
  }
  return viewsPromise;
}

async function render() {
  const route = parseRoute();
  const app = document.getElementById("app");
  const views = await loadViews();

  const viewFn = views.VIEWS[route] ?? views.VIEWS[DEFAULT_ROUTE];
  app.innerHTML = viewFn();

  if (typeof views.bind === "function") {
    views.bind(app);
  }

  setActiveNav(route);
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", render);
render();
