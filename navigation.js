function initKeyboardNav() {
  const highlightClass = "keyboard-nav-highlight";
  let direction = 1; // 1 for forward, -1 for backward

  let headers = [];
  let links = [];
  let landmarks = [];

  const landmarkRoles = [
    "banner",
    "main",
    "navigation",
    "complementary",
    "contentinfo",
    "form",
    "search",
    "region",
  ];

  function isFocusable(el) {
    return el && typeof el.focus === "function";
  }

  function scanElements() {
    headers = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")];
    links = [...document.querySelectorAll("a[href]")];
    landmarks = [
      ...document.querySelectorAll(
        "nav,main,form,aside,section,footer,header,[role]"
      ),
    ].filter((el) => {
      const tag = el.tagName.toLowerCase();
      const role = el.getAttribute("role");
      return (
        [
          "nav",
          "main",
          "form",
          "aside",
          "section",
          "footer",
          "header",
        ].includes(tag) || landmarkRoles.includes(role)
      );
    });
  }

  function clearHighlight() {
    document.querySelectorAll(`.${highlightClass}`).forEach((el) => {
      el.classList.remove(highlightClass);
    });
  }

  function focusNext(list) {
    if (!list.length) return;
    const active = document.activeElement;
    let index = list.findIndex((el) => el === active);

    if (direction === 1) {
      index = (index + 1) % list.length;
    } else {
      index = (index - 1 + list.length) % list.length;
    }

    const target = list[index];
    if (isFocusable(target)) {
      clearHighlight();
      target.focus({ preventScroll: false });
      target.classList.add(highlightClass);
    }
  }

  function handleKeyDown(e) {
    const activeTag = document.activeElement.tagName.toLowerCase();
    const skipTags = ["input", "textarea", "select"];
    if (skipTags.includes(activeTag)) return;

    switch (e.key) {
      case "ArrowDown":
        direction = 1;
        break;
      case "ArrowUp":
        direction = -1;
        break;
      case "h":
      case "H":
        e.preventDefault();
        focusNext(headers);
        break;
      case "l":
      case "L":
        e.preventDefault();
        focusNext(links);
        break;
      case "m":
      case "M":
        e.preventDefault();
        focusNext(landmarks);
        break;
    }
  }

  function injectStyle() {
    const style = document.createElement("style");
    style.textContent = `
      .${highlightClass} {
        outline: 3px solid yellow !important;
        background-color: black !important;
        color: white !important;
        scroll-margin-top: 50px;
      }
    `;
    document.head.appendChild(style);
  }

  // Initial run
  scanElements();
  injectStyle();

  // Keyboard listener
  document.addEventListener("keydown", handleKeyDown);

  // Dynamic updates
  const observer = new MutationObserver(() => scanElements());
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}
