(function () {
  var toggle = document.querySelector(".menu-toggle");
  var panel = document.querySelector(".nav-mobile");
  if (!toggle || !panel) return;

  if (!toggle.getAttribute("aria-label")) {
    toggle.setAttribute("aria-label", "Menu");
  }
  if (!panel.getAttribute("aria-label")) {
    panel.setAttribute("aria-label", "Menu");
  }

  function setOpen(open) {
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      panel.removeAttribute("hidden");
      document.body.classList.add("nav-open");
    } else {
      panel.setAttribute("hidden", "");
      document.body.classList.remove("nav-open");
    }
  }

  setOpen(false);

  toggle.addEventListener("click", function () {
    var open = toggle.getAttribute("aria-expanded") === "true";
    setOpen(!open);
  });

  panel.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      setOpen(false);
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setOpen(false);
      toggle.focus();
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 760) setOpen(false);
  });
})();
