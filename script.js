const DESIGN_WIDTH = 1440;
const DESIGN_HEIGHT = 8363;
const MOBILE_BREAKPOINT = 768;

const stage = document.querySelector(".stage");
const stageShell = document.querySelector(".stage-shell");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function syncStageScale() {
  if (window.innerWidth <= MOBILE_BREAKPOINT) {
    stage.style.removeProperty("--stage-scale");
    stageShell.style.removeProperty("height");
    return;
  }

  const scale = Math.min(window.innerWidth / DESIGN_WIDTH, 1);
  stage.style.setProperty("--stage-scale", scale);
  stageShell.style.height = `${DESIGN_HEIGHT * scale}px`;
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
