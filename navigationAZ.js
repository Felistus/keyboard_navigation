function initKeyboardNav() {
  // Configuration
  const CONFIG = {
    keys: {
      HEADER: "KeyH",
      LINK: "KeyL",
      LANDMARK: "KeyM",
      ARROW_UP: "ArrowUp",
      ARROW_DOWN: "ArrowDown",
    },
    selectors: {
      headers: "h1, h2, h3, h4, h5, h6",
      links: "a[href]",
      landmarks:
        'nav, main, form, aside, section, header, footer, [role="banner"], [role="navigation"], [role="main"], [role="complementary"], [role="contentinfo"], [role="search"], [role="form"], [role="region"]',
      formFields: 'input, textarea, select, button, [contenteditable="true"]',
    },
    styles: {
      focusClass: "keyboard-nav-focus",
      css: `
                        .keyboard-nav-focus {
                            outline: 3px solid #005fcc !important;
                            outline-offset: 2px !important;
                            background-color: rgba(0, 95, 204, 0.1) !important;
                            border-radius: 2px !important;
                            box-shadow: 0 0 0 1px #ffffff, 0 0 0 4px #005fcc !important;
                            position: relative !important;
                            z-index: 999999 !important;
                        }
                        
                        .keyboard-nav-focus::before {
                            content: '' !important;
                            position: absolute !important;
                            top: -4px !important;
                            left: -4px !important;
                            right: -4px !important;
                            bottom: -4px !important;
                            background: rgba(0, 95, 204, 0.05) !important;
                            border-radius: 4px !important;
                            z-index: -1 !important;
                            pointer-events: none !important;
                        }
                        
                        /* High contrast mode support */
                        @media (prefers-contrast: high) {
                            .keyboard-nav-focus {
                                outline: 4px solid #000000 !important;
                                background-color: #ffff00 !important;
                                box-shadow: 0 0 0 1px #ffffff, 0 0 0 6px #000000 !important;
                            }
                        }
                        
                        /* Reduced motion support */
                        @media (prefers-reduced-motion: reduce) {
                            .keyboard-nav-focus {
                                transition: none !important;
                            }
                        }
                    `,
    },
  };

  // State management
  let state = {
    flow: "forward",
    elements: {
      headers: [],
      links: [],
      landmarks: [],
    },
    defaultIndices: {
      headers: -1,
      links: -1,
      landmarks: -1,
    },
    lastFocusedElement: null,
    isActive: true,
  };

  // Utility functions
  const utils = {
    // Check if element is visible and interactable
    isElementVisible(element) {
      if (!element || !element.offsetParent) return false;

      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);

      return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.visibility !== "hidden" &&
        style.display !== "none" &&
        style.opacity !== "0"
      );
    },

    // Check if element is focusable
    isFocusable(element) {
      if (!element) return false;

      const tabIndex = element.getAttribute("tabindex");
      if (tabIndex === "-1") return false;

      const tagName = element.tagName.toLowerCase();
      const focusableTags = ["a", "button", "input", "textarea", "select"];

      return (
        focusableTags.includes(tagName) ||
        tabIndex !== null ||
        element.contentEditable === "true"
      );
    },

    // Get visible and valid elements
    getValidElements(selector) {
      const elements = Array.from(document.querySelectorAll(selector));
      return elements.filter((el) => {
        // Skip if element is not visible
        if (!this.isElementVisible(el)) return false;

        // For landmarks, ensure they have meaningful content or proper role
        if (selector.includes("role=")) {
          const role = el.getAttribute("role");
          if (!role || role === "presentation" || role === "none") return false;
        }

        // For links, ensure they have href and are not just anchors
        if (el.tagName.toLowerCase() === "a" && !el.getAttribute("href")) {
          return false;
        }

        return true;
      });
    },

    // Scroll element into view smoothly
    scrollToElement(element) {
      if (!element) return;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      element.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "center",
        inline: "nearest",
      });
    },

    // Add focus styling
    addFocusStyle(element) {
      if (!element) return;

      // Remove previous focus
      this.removeFocusStyle();

      element.classList.add(CONFIG.styles.focusClass);
      state.lastFocusedElement = element;

      // Set actual focus for screen readers
      if (this.isFocusable(element)) {
        element.focus();
      } else {
        // Make temporarily focusable for screen readers
        const originalTabIndex = element.getAttribute("tabindex");
        element.setAttribute("tabindex", "-1");
        element.focus();

        // Restore original tabindex after focus
        setTimeout(() => {
          if (originalTabIndex === null) {
            element.removeAttribute("tabindex");
          } else {
            element.setAttribute("tabindex", originalTabIndex);
          }
        }, 100);
      }
    },

    // Remove focus styling
    removeFocusStyle() {
      if (state.lastFocusedElement) {
        state.lastFocusedElement.classList.remove(CONFIG.styles.focusClass);
        state.lastFocusedElement = null;
      }
    },

    // Check if currently focused element is a form field
    isFormFieldFocused() {
      const activeElement = document.activeElement;
      if (!activeElement) return false;

      const tagName = activeElement.tagName.toLowerCase();
      const formFields = ["input", "textarea", "select", "button"];

      return (
        formFields.includes(tagName) ||
        activeElement.contentEditable === "true" ||
        activeElement.isContentEditable
      );
    },

    // Announce to screen readers
    notifyScreenReader(message) {
      const announcement = document.createElement("div");
      announcement.setAttribute("aria-live", "polite");
      announcement.setAttribute("aria-atomic", "true");
      announcement.style.cssText = `
                        position: absolute !important;
                        left: -10000px !important;
                        top: auto !important;
                        width: 1px !important;
                        height: 1px !important;
                        overflow: hidden !important;
                    `;

      document.body.appendChild(announcement);
      announcement.textContent = message;

      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    },
  };

  // Element collection and management
  const elementManager = {
    // Collect all navigable elements
    collectElements() {
      state.elements.headers = utils.getValidElements(CONFIG.selectors.headers);
      state.elements.links = utils.getValidElements(CONFIG.selectors.links);
      state.elements.landmarks = utils.getValidElements(
        CONFIG.selectors.landmarks
      );

      // Reset indices when elements change
      state.defaultIndices.headers = -1;
      state.defaultIndices.links = -1;
      state.defaultIndices.landmarks = -1;
    },

    // Get next element in specified flow
    getNextElement(type) {
      const elements = state.elements[type];
      if (!elements || elements.length === 0) return null;

      let currentIndex = state.defaultIndices[type];

      if (state.flow === "forward") {
        currentIndex = (currentIndex + 1) % elements.length;
      } else {
        currentIndex =
          currentIndex <= 0 ? elements.length - 1 : currentIndex - 1;
      }

      state.defaultIndices[type] = currentIndex;
      return elements[currentIndex];
    },

    // Navigate to next element of specified type
    navigateToNext(type) {
      const element = this.getNextElement(type);
      if (!element) {
        utils.notifyScreenReader(`No ${type} found`);
        return;
      }

      utils.addFocusStyle(element);
      utils.scrollToElement(element);

      // Announce navigation
      const typeNames = {
        headers: "header",
        links: "link",
        landmarks: "landmark",
      };

      let announcement = `${typeNames[type]}: ${
        element.textContent?.trim() || element.tagName
      }`;
      if (element.tagName.toLowerCase().startsWith("h")) {
        announcement = `${element.tagName.toLowerCase()}: ${element.textContent?.trim()}`;
      }

      utils.notifyScreenReader(announcement);
    },
  };

  // Event handlers
  const eventHandlers = {
    // Handle keydown events
    handleKeyDown(event) {
      // Ignore if not active or if modifier keys are pressed
      if (!state.isActive || event.ctrlKey || event.altKey || event.metaKey) {
        return;
      }

      // Check if form field is focused and ignore navigation keys
      if (
        utils.isFormFieldFocused() &&
        [CONFIG.keys.HEADER, CONFIG.keys.LINK, CONFIG.keys.LANDMARK].includes(
          event.code
        )
      ) {
        return;
      }

      let handled = false;

      switch (event.code) {
        case CONFIG.keys.ARROW_UP:
          state.flow = "backward";
          utils.notifyScreenReader("Navigation flow: backward");
          handled = true;
          break;

        case CONFIG.keys.ARROW_DOWN:
          state.flow = "forward";
          utils.notifyScreenReader("Navigation flow: forward");
          handled = true;
          break;

        case CONFIG.keys.HEADER:
          elementManager.navigateToNext("headers");
          handled = true;
          break;

        case CONFIG.keys.LINK:
          elementManager.navigateToNext("links");
          handled = true;
          break;

        case CONFIG.keys.LANDMARK:
          elementManager.navigateToNext("landmarks");
          handled = true;
          break;
      }

      if (handled) {
        event.preventDefault();
        event.stopPropagation();
      }
    },

    // Handle focus events to remove custom styling when native focus occurs
    handleFocusIn(event) {
      if (event.target !== state.lastFocusedElement) {
        utils.removeFocusStyle();
      }
    },

    // Handle DOM mutations
    handleMutation(mutations) {
      let shouldUpdate = false;

      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          // Check if any added/removed nodes affect our elements
          const checkNodes = (nodes) => {
            for (let node of nodes) {
              if (node.nodeType === Node.ELEMENT_NODE) {
                if (
                  node.matches &&
                  (node.matches(CONFIG.selectors.headers) ||
                    node.matches(CONFIG.selectors.links) ||
                    node.matches(CONFIG.selectors.landmarks) ||
                    node.querySelector(CONFIG.selectors.headers) ||
                    node.querySelector(CONFIG.selectors.links) ||
                    node.querySelector(CONFIG.selectors.landmarks))
                ) {
                  shouldUpdate = true;
                  break;
                }
              }
            }
          };

          checkNodes(mutation.addedNodes);
          checkNodes(mutation.removedNodes);
        }
      });

      if (shouldUpdate) {
        // Debounce updates to avoid excessive recalculation
        clearTimeout(elementManager.updateTimeout);
        elementManager.updateTimeout = setTimeout(() => {
          elementManager.collectElements();
        }, 100);
      }
    },
  };

  // Initialization
  const init = () => {
    // Inject CSS styles
    const styleElement = document.createElement("style");
    styleElement.textContent = CONFIG.styles.css;
    document.head.appendChild(styleElement);

    // Collect initial elements
    elementManager.collectElements();

    // Set up event listeners
    document.addEventListener("keydown", eventHandlers.handleKeyDown, true);
    document.addEventListener("focusin", eventHandlers.handleFocusIn, true);

    // Set up MutationObserver for dynamic content
    const observer = new MutationObserver(eventHandlers.handleMutation);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class", "hidden"],
    });

    // Handle page visibility changes
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        utils.removeFocusStyle();
      }
    });

    // Initial announcement
    utils.notifyScreenReader(
      "Keyboard navigation enabled. Use H for headers, L for links, M for landmarks. Arrow keys change flow."
    );

    // Return cleanup function
    return () => {
      state.isActive = false;
      utils.removeFocusStyle();
      document.removeEventListener(
        "keydown",
        eventHandlers.handleKeyDown,
        true
      );
      document.removeEventListener(
        "focusin",
        eventHandlers.handleFocusIn,
        true
      );
      observer.disconnect();
      if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
    };
  };

  // Public API
  const api = {
    // Initialize the navigation utility
    init,

    // Toggle navigation on/off
    toggle() {
      state.isActive = !state.isActive;
      if (!state.isActive) {
        utils.removeFocusStyle();
      }
      utils.notifyScreenReader(
        `Keyboard navigation ${state.isActive ? "enabled" : "disabled"}`
      );
    },

    // Get current state (for debugging)
    getState() {
      return {
        flow: state.flow,
        elementCounts: {
          headers: state.elements.headers.length,
          links: state.elements.links.length,
          landmarks: state.elements.landmarks.length,
        },
        defaultIndices: { ...state.defaultIndices },
        isActive: state.isActive,
      };
    },

    // Manually refresh elements
    refresh() {
      elementManager.collectElements();
      utils.notifyScreenReader("Navigation elements refreshed");
    },
  };

  // Auto-initialize and return API
  const cleanup = init();

  // Add cleanup to API
  api.cleanup = cleanup;

  return api;
}

// Initialize keyboard navigation
const keyboardNav = initKeyboardNav();

// Demo functions for dynamic content
let dynamicCounter = 0;

function addContent() {
  const container = document.getElementById("dynamicContent");
  const newContent = document.createElement("div");
  newContent.innerHTML = `
                <h3>Dynamic Header ${++dynamicCounter}</h3>
                <p>This content was added dynamically at ${new Date().toLocaleTimeString()}</p>
                <a href="#dynamic-${dynamicCounter}">Dynamic Link ${dynamicCounter}</a>
            `;
  container.appendChild(newContent);
}

function removeContent() {
  const container = document.getElementById("dynamicContent");
  const lastChild = container.lastElementChild;
  if (lastChild && lastChild.tagName !== "P") {
    container.removeChild(lastChild);
  }
}

function addLinks() {
  const container = document.getElementById("dynamicContent");
  const linkContainer = document.createElement("div");
  linkContainer.innerHTML = `
                <p>Dynamic links: 
                    <a href="#link1-${Date.now()}">Link 1</a> | 
                    <a href="#link2-${Date.now()}">Link 2</a> | 
                    <a href="#link3-${Date.now()}">Link 3</a>
                </p>
            `;
  container.appendChild(linkContainer);
}

function addHeaders() {
  const container = document.getElementById("dynamicContent");
  const headerContainer = document.createElement("div");
  headerContainer.innerHTML = `
                <h4>Dynamic H4 - ${new Date().toLocaleTimeString()}</h4>
                <h5>Dynamic H5 - ${new Date().toLocaleTimeString()}</h5>
                <h6>Dynamic H6 - ${new Date().toLocaleTimeString()}</h6>
            `;
  container.appendChild(headerContainer);
}

// Prevent form submission for demo
document.querySelector("form").addEventListener("submit", function (e) {
  e.preventDefault();
  alert("Form submission prevented for demo purposes");
});

// Log when elements are navigated
const originalAnnounceFn = keyboardNav.notifyScreenReader;

// Add visual feedback for successful initialization
setTimeout(() => {
  const status = document.createElement("div");
  status.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 20px;
                background: #4CAF50;
                color: white;
                padding: 10px 15px;
                border-radius: 4px;
                z-index: 1000;
                font-size: 14px;
            `;
  status.textContent = "✓ Keyboard Navigation Active";
  document.body.appendChild(status);

  setTimeout(() => {
    status.style.opacity = "0";
    status.style.transition = "opacity 0.5s";
    setTimeout(() => {
      document.body.removeChild(status);
    }, 500);
  }, 3000);
}, 500);
