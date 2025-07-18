# ♿ Keyboard Navigation Utility

A lightweight, accessible JavaScript utility that enables **keyboard-only navigation** across headings, links, and landmarks on any webpage — even as content changes dynamically.

---

## 🧠 Purpose

This utility simulates real-world keyboard navigation for users who rely on keyboard interaction (e.g., screen reader users, power users, and individuals with motor impairments). It ensures a seamless and accessible navigation experience without requiring any modifications to the existing HTML.

---

## 🚀 Features

- 🔍 Automatically scans the DOM for:

  - Headings (`<h1>`–`<h6>`)
  - Anchor links (`<a href="...">`)
  - Landmarks (`<nav>`, `<main>`, `<form>`, `<section>`, etc. and valid ARIA roles)

- 🎯 Keyboard shortcuts:

  - `H` → Jump to next/previous **Heading**
  - `L` → Jump to next/previous **Link**
  - `M` → Jump to next/previous **Landmark**

- 🔁 Directional navigation:

  - `↑` → Set navigation **backward**
  - `↓` → Set navigation **forward**

- ♻️ Dynamic DOM support:

  - Updates in real time when elements are added or removed

- 🖍️ Accessibility highlighting:

  - High-contrast focus style (yellow outline, black background)

- ✅ Works in latest versions of **Chrome**, **Firefox**, and **Edge**

- 📦 No dependencies. Just one function: `initKeyboardNav();`

---

## 🧪 Accessibility Principles Applied

- Keyboard Focus: Ensures all navigated elements receive programmatic focus.
- Visual Indicator: Provides high-contrast outline and background.
- ARIA Support: Detects valid landmark roles (e.g., role="main", role="nav").
- Skip Input Fields: Prevents hotkeys from interfering with typing.

---

## ✅ Assumptions

- All elements to be navigated are visible and part of the DOM.
- Input fields (like <input>, <textarea>) suppress shortcut behavior.
- Landmarks are defined using either semantic tags or role attributes.

---

## 🔧 Usage

1. Include `navigationAZ.js` in your page.
2. Call the function once:

```html
<script>
  initKeyboardNav();
</script>
```

## 📦 Project Structure

```text
keyboard-navigation-utility/
│
├── navigationAZ.js    # Main standalone JavaScript utility
├── demo.html          # Sample page with headings, links, landmarks
└── README.md          # Documentation
```
