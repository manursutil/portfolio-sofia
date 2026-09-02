const DESIGN_WIDTH = 1440;
const HERO_CONTENT_HEIGHT = 1060;
const MOBILE_HERO_HEIGHT = 900;
const MOBILE_BREAKPOINT = 768;

const stage = document.querySelector(".stage");
const stageShell = document.querySelector(".stage-shell");
const heroLayout = document.querySelector(".hero-layout");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function syncStageHeight() {
  if (window.innerWidth <= MOBILE_BREAKPOINT) {
    stageShell.style.removeProperty("height");
    return;
  }

  const scale = Number.parseFloat(
    stage.style.getPropertyValue("--stage-scale"),
  ) || 1;
  stageShell.style.height = `${stage.offsetHeight * scale}px`;
}

function syncStageScale() {
  if (window.innerWidth <= MOBILE_BREAKPOINT) {
    stage.style.removeProperty("--stage-scale");
    stage.style.removeProperty("--viewport-stage-width");
    stageShell.style.removeProperty("height");
    document.querySelectorAll("[style*='--layout-x']").forEach((element) => {
      element.style.removeProperty("--layout-x");
    });
    const heroScale = Math.min(window.innerHeight / MOBILE_HERO_HEIGHT, 1);
    heroLayout.style.setProperty("--hero-fit-scale", heroScale);
    return;
  }

  heroLayout.style.removeProperty("--hero-fit-scale");
  const scale = Math.min(
    window.innerWidth / DESIGN_WIDTH,
    window.innerHeight / HERO_CONTENT_HEIGHT,
  );
  const layoutWidth = window.innerWidth / scale;

  stage.style.setProperty("--stage-scale", scale);
  stage.style.setProperty("--viewport-stage-width", `${layoutWidth}px`);

  const setSpreadPosition = (element, x, width) => {
    if (!element) return;
    const centerRatio = (x + width / 2) / DESIGN_WIDTH;
    const spreadX = centerRatio * layoutWidth - width / 2;
    element.style.setProperty("--layout-x", `${spreadX}px`);
  };

  document.querySelectorAll(".hero-media").forEach((element) => {
    const styles = element.style;
    const x = Number.parseFloat(styles.getPropertyValue("--x"));
    const width = Number.parseFloat(styles.getPropertyValue("--w"));
    if (!Number.isFinite(x) || !Number.isFinite(width)) return;

    setSpreadPosition(element, x, width);
  });

  setSpreadPosition(document.querySelector(".hero h1"), 257, 925);
  setSpreadPosition(document.querySelector(".scroll-cue"), 683, 69);
  syncStageHeight();
}

function updateCurrentLink(hash) {
  document.querySelectorAll(".nav-link").forEach((link) => {
    if (link.hash === hash) {
      link.setAttribute("aria-current", "true");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.hash);
    if (!target) return;

    event.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top,
      behavior: reduceMotion.matches ? "auto" : "smooth",
    });
    window.history.replaceState(null, "", link.hash);
    updateCurrentLink(link.hash);
  });
});

const sections = [
  { hash: "#work", element: document.querySelector(".showreel") },
  { hash: "#sobre-mi", element: document.querySelector(".about") },
];

const sectionObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;
    const section = sections.find(({ element }) => element === visible.target);
    if (section) updateCurrentLink(section.hash);
  },
  { threshold: [0.15, 0.4] },
);

sections.forEach(({ element }) => {
  if (element) sectionObserver.observe(element);
});

if (reduceMotion.matches) {
  document.querySelectorAll("video").forEach((video) => video.pause());
}

syncStageScale();
window.addEventListener("resize", syncStageScale, { passive: true });
window.addEventListener("load", syncStageHeight, { once: true });

if ("ResizeObserver" in window) {
  const stageResizeObserver = new ResizeObserver(syncStageHeight);
  stageResizeObserver.observe(stage);
}

document.fonts?.ready.then(syncStageHeight);
