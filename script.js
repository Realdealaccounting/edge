/* ============================================================
   EdgeCostSeg script.js
   Handles: mobile nav, FAQ accordion, scroll reveal,
   savings estimator, and form submission UX.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("mobileMenu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      document.body.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        menu.classList.remove("open");
        document.body.classList.remove("menu-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var q = item.querySelector(".faq-q");
    var a = item.querySelector(".faq-a");
    if (!q || !a) return;
    q.addEventListener("click", function () {
      var open = item.classList.contains("open");
      // close siblings within the same .faq group
      var group = item.closest(".faq");
      if (group) {
        group.querySelectorAll(".faq-item.open").forEach(function (other) {
          if (other !== item) {
            other.classList.remove("open");
            other.querySelector(".faq-a").style.maxHeight = null;
            other.querySelector(".faq-q").setAttribute("aria-expanded", "false");
          }
        });
      }
      if (open) {
        item.classList.remove("open");
        a.style.maxHeight = null;
        q.setAttribute("aria-expanded", "false");
      } else {
        item.classList.add("open");
        a.style.maxHeight = a.scrollHeight + "px";
        q.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el, i) {
      el.style.transitionDelay = (Math.min(i % 4, 3) * 70) + "ms";
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Savings estimator ---------- */
  var est = document.getElementById("estimator");
  if (est) {
    // Illustrative first-year benefit factors by property type.
    // These are conservative ROUGH ranges for demonstration only, NOT tax advice.
    var TYPE = {
      multifamily:   { label: "Multifamily",          reclass: 0.28, depr: 27.5 },
      commercial:    { label: "Commercial / Office",   reclass: 0.24, depr: 39 },
      industrial:    { label: "Industrial / Warehouse",reclass: 0.22, depr: 39 },
      retail:        { label: "Retail",                reclass: 0.26, depr: 39 },
      str:           { label: "Short-Term Rental",     reclass: 0.30, depr: 27.5 },
      hospitality:   { label: "Hospitality",           reclass: 0.32, depr: 39 }
    };
    var state = { type: "multifamily", value: 2500000, land: 20, bracket: 35 };

    var fmt = function (n) {
      return "$" + Math.round(n).toLocaleString("en-US");
    };

    function compute() {
      var t = TYPE[state.type];
      var building = state.value * (1 - state.land / 100);
      // portion of building moved into 5/7/15-yr classes
      var reclassified = building * t.reclass;
      // first-year accelerated deduction (illustrative; assumes bonus + early-year weighting)
      var firstYearDeduction = reclassified * 0.6;
      var taxSavings = firstYearDeduction * (state.bracket / 100);
      var npv = taxSavings; // present-value of deferral, simplified
      return {
        building: building,
        reclassified: reclassified,
        firstYearDeduction: firstYearDeduction,
        taxSavings: taxSavings,
        npv: npv,
        typeLabel: t.label
      };
    }

    function render() {
      var r = compute();
      var set = function (id, val) { var el = document.getElementById(id); if (el) el.textContent = val; };
      set("erFig", fmt(r.taxSavings));
      set("erReclass", fmt(r.reclassified));
      set("erDeduction", fmt(r.firstYearDeduction));
      set("erType", r.typeLabel);
      var vEl = document.getElementById("valVal"); if (vEl) vEl.textContent = fmt(state.value);
      var lEl = document.getElementById("landVal"); if (lEl) lEl.textContent = state.land + "%";
      var bEl = document.getElementById("bracketVal"); if (bEl) bEl.textContent = state.bracket + "%";
    }

    est.querySelectorAll("[data-type]").forEach(function (b) {
      b.addEventListener("click", function () {
        est.querySelectorAll("[data-type]").forEach(function (x) { x.classList.remove("active"); x.setAttribute("aria-pressed", "false"); });
        b.classList.add("active"); b.setAttribute("aria-pressed", "true");
        state.type = b.getAttribute("data-type");
        render();
      });
    });
    var valR = document.getElementById("valRange");
    if (valR) valR.addEventListener("input", function () { state.value = +valR.value; render(); });
    var landR = document.getElementById("landRange");
    if (landR) landR.addEventListener("input", function () { state.land = +landR.value; render(); });
    var brR = document.getElementById("bracketRange");
    if (brR) brR.addEventListener("input", function () { state.bracket = +brR.value; render(); });

    render();
  }

  /* ---------- Lead / contact form ---------- */
  document.querySelectorAll("form[data-lead]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }

      var success = form.parentElement.querySelector(".form-success");
      var action = form.getAttribute("action");
      var btn = form.querySelector("[type=submit]");

      function showSuccess() {
        if (success) { form.style.display = "none"; success.classList.add("show"); }
      }
      function showError(msg) {
        var err = form.querySelector(".form-error");
        if (!err) {
          err = document.createElement("p");
          err.className = "form-error form-note center";
          err.style.color = "#c0362c";
          form.appendChild(err);
        }
        err.textContent = msg || "Something went wrong. Please try again, or call us directly.";
      }

      // No action wired up → keep the in-page demo behavior.
      if (!action) { showSuccess(); return; }

      // Real submission via AJAX (e.g. Formspree) so the user stays on the page.
      var original = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }

      fetch(action, {
        method: (form.getAttribute("method") || "POST").toUpperCase(),
        body: new FormData(form),
        headers: { "Accept": "application/json" }
      }).then(function (res) {
        if (res.ok) {
          showSuccess();
        } else {
          return res.json().then(function (data) {
            var m = data && data.errors ? data.errors.map(function (x) { return x.message; }).join(", ") : null;
            showError(m); if (btn) { btn.disabled = false; btn.textContent = original; }
          }).catch(function () {
            showError(); if (btn) { btn.disabled = false; btn.textContent = original; }
          });
        }
      }).catch(function () {
        showError(); if (btn) { btn.disabled = false; btn.textContent = original; }
      });
    });
  });

  /* ---------- Footer year ---------- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
