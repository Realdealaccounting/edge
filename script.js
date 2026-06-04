/* ============================================================
   Edge — interactions: nav, scroll reveal, dashboard, form
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Nav: scrolled state + dark-over-hero ---------- */
  var nav = document.querySelector(".nav");
  var hero = document.querySelector(".hero");
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    nav.classList.toggle("scrolled", y > 24);
    // keep "on-dark" while hero still covers the nav area
    if (hero) {
      var heroBottom = hero.offsetTop + hero.offsetHeight;
      nav.classList.toggle("on-dark", y < heroBottom - 120);
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.querySelector(".mobile-menu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () { menu.classList.add("open"); });
    menu.querySelectorAll("a, .mobile-close").forEach(function (el) {
      el.addEventListener("click", function () { menu.classList.remove("open"); });
    });
  }

  /* ---------- Scroll reveal (manual viewport check — robust everywhere) ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  function checkReveals() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    for (var i = reveals.length - 1; i >= 0; i--) {
      var el = reveals[i];
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.92 && r.bottom > 0) {
        el.classList.add("in");
        reveals.splice(i, 1);
      }
    }
  }
  window.addEventListener("scroll", checkReveals, { passive: true });
  window.addEventListener("resize", checkReveals, { passive: true });
  checkReveals();
  // run again after layout/fonts settle, and a hard failsafe so nothing ever stays hidden
  requestAnimationFrame(checkReveals);
  setTimeout(checkReveals, 200);
  setTimeout(function () {
    document.querySelectorAll(".reveal:not(.in)").forEach(function (el) {
      el.classList.add("in");
      // paint-independent safety: clear the hidden state directly too
      el.style.opacity = "1";
      el.style.transform = "none";
    });
  }, 2500);

  /* ---------- Animated count-up (hero stats + about badge) ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var prefix = el.getAttribute("data-prefix") || "";
    var decimals = (target % 1 !== 0) ? 1 : 0;
    var dur = 1400, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = (target * eased).toFixed(decimals);
      el.textContent = prefix + val + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
  function checkCounters() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    for (var i = counters.length - 1; i >= 0; i--) {
      var el = counters[i];
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.85 && r.bottom > 0) {
        animateCount(el);
        counters.splice(i, 1);
      }
    }
  }
  window.addEventListener("scroll", checkCounters, { passive: true });
  checkCounters();
  setTimeout(checkCounters, 200);

  /* ---------- Live dashboard: animate bars on a loop ---------- */
  var bars = document.querySelectorAll(".bars .bar");
  var heights = [44, 62, 51, 78, 66, 92, 84];
  bars.forEach(function (bar, i) {
    var h = heights[i % heights.length];
    bar.style.height = h + "%";
  });
  function pulseBars() {
    var dashWrap = document.querySelector(".dash");
    if (!dashWrap) return;
    bars.forEach(function (bar) {
      bar.style.animation = "none";
      // reflow
      void bar.offsetWidth;
      bar.style.animation = "grow 1.1s cubic-bezier(.2,.8,.2,1) both";
    });
  }
  // re-pulse every 6s when in view
  if (bars.length) {
    setInterval(function () {
      var dashEl = document.querySelector(".dash-chart");
      if (!dashEl || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      var r = dashEl.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      if (r.top < vh && r.bottom > 0) pulseBars();
    }, 6000);
  }

  /* ---------- Animated KPI ticker ---------- */
  var revVal = document.getElementById("kpiRev");
  if (revVal) {
    var base = 248750;
    setInterval(function () {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      base += Math.floor(Math.random() * 900) + 100;
      revVal.textContent = "$" + base.toLocaleString();
    }, 3200);
  }

  /* ---------- Calendly placeholder slot selection ---------- */
  var slots = document.querySelectorAll(".cal-slot");
  slots.forEach(function (s) {
    s.addEventListener("click", function () {
      slots.forEach(function (x) { x.classList.remove("sel"); });
      s.classList.add("sel");
    });
  });

  /* ---------- Contact form validation ---------- */
  var form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;
      ["name", "email", "message"].forEach(function (id) {
        var field = form.querySelector('[name="' + id + '"]');
        var wrap = field.closest(".field");
        var ok = field.value.trim().length > 0;
        if (id === "email") ok = ok && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
        wrap.classList.toggle("err", !ok);
        if (!ok) valid = false;
      });
      if (valid) {
        form.style.display = "none";
        document.querySelector(".form-success").classList.add("show");
      }
    });
    form.querySelectorAll("input, textarea, select").forEach(function (f) {
      f.addEventListener("input", function () {
        var wrap = f.closest(".field");
        if (wrap) wrap.classList.remove("err");
      });
    });
  }

  /* ---------- Multi-step Quote form ---------- */
  (function quoteWizard() {
    var form = document.getElementById("quoteForm");
    if (!form) return;
    var prog = document.getElementById("qProg");
    var panels = form.querySelectorAll(".qpanel");
    var backBtn = document.getElementById("qBack");
    var nextBtn = document.getElementById("qNext");
    var countEl = document.getElementById("qCount");
    var total = panels.length;
    var step = 1;

    function render() {
      panels.forEach(function (p) { p.classList.toggle("active", +p.dataset.panel === step); });
      prog.querySelectorAll(".pstep").forEach(function (s) {
        var n = +s.dataset.step;
        s.classList.toggle("active", n === step);
        s.classList.toggle("done", n < step);
      });
      backBtn.style.visibility = step === 1 ? "hidden" : "visible";
      countEl.textContent = "Step " + step + " of " + total;
      nextBtn.firstChild.textContent = step === total ? "Submit quote request" : "Continue";
    }

    function setErr(field, on) {
      var wrap = field.closest(".field");
      if (wrap) wrap.classList.toggle("err", on);
    }

    function validateStep() {
      var ok = true;
      if (step === 1) {
        var name = form.querySelector('[name="name"]');
        var email = form.querySelector('[name="email"]');
        var phone = form.querySelector('[name="phone"]');
        var nOk = name.value.trim().length > 0; setErr(name, !nOk); ok = ok && nOk;
        var eOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()); setErr(email, !eOk); ok = ok && eOk;
        var pOk = phone.value.trim().length >= 7; setErr(phone, !pOk); ok = ok && pOk;
      }
      if (step === 3) {
        var svcs = form.querySelectorAll('[name="services"]:checked');
        var svcErr = document.getElementById("svcErr");
        var sOk = svcs.length > 0;
        if (svcErr) svcErr.style.display = sOk ? "none" : "block";
        ok = ok && sOk;
      }
      return ok;
    }

    function val(name) {
      var el = form.querySelector('[name="' + name + '"]:checked') || form.querySelector('[name="' + name + '"]');
      return el ? el.value : "";
    }

    function submit() {
      var services = Array.prototype.map.call(form.querySelectorAll('[name="services"]:checked'), function (c) {
        return c.value.replace(/&amp;/g, "&");
      });
      var rows = [
        ["Name", val("name")],
        ["Business", val("company") || "—"],
        ["Email", val("email")],
        ["Phone", val("phone")],
        ["Property type", val("propType") || "—"],
        ["Property value", val("value") || "—"],
        ["Interested in", services.join(", ") || "—"],
        ["Timeline", val("timeline") || "—"]
      ];
      var html = rows.map(function (r) {
        return '<div class="row"><b>' + r[0] + '</b><span>' + r[1] + "</span></div>";
      }).join("");
      document.getElementById("qSummary").innerHTML = html;
      form.style.display = "none";
      prog.style.display = "none";
      document.getElementById("qSuccess").classList.add("show");
      var card = form.closest(".qform-card");
      if (card) { var y = card.getBoundingClientRect().top + window.scrollY - 100; window.scrollTo({ top: y, behavior: "smooth" }); }
    }

    nextBtn.addEventListener("click", function () {
      if (!validateStep()) return;
      if (step === total) { submit(); return; }
      step++; render();
    });
    backBtn.addEventListener("click", function () {
      if (step > 1) { step--; render(); }
    });
    form.querySelectorAll("input, textarea, select").forEach(function (f) {
      f.addEventListener("input", function () { setErr(f, false); });
      f.addEventListener("change", function () {
        var se = document.getElementById("svcErr");
        if (f.name === "services" && se) se.style.display = "none";
      });
    });
    render();
  })();

  /* ---------- Footer year ---------- */
  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();
})();
