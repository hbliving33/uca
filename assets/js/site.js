(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Mobile menu
  const btn = document.querySelector(".menu-btn");
  const nav = document.getElementById("nav");
  if (btn && nav) btn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", open);
    btn.textContent = open ? "Close" : "Menu";
  });

  // Reveal sections as they scroll in
  if ("IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }), { threshold: 0.15 });
    document.querySelectorAll(".reveal").forEach((el) => {
      if (el.getBoundingClientRect().top > innerHeight) { el.classList.add("pre"); io.observe(el); }
    });
  }

  // Payment estimator (home page)
  const est = document.getElementById("estimator");
  if (est) {
    const cost = document.getElementById("e-cost");
    const costOut = document.getElementById("e-cost-out");
    const down = document.getElementById("e-down");
    const rate = document.getElementById("e-rate");
    const pay = document.getElementById("e-pay");
    const go = document.getElementById("e-go");
    let term = 60;
    const fmt = (n) => "$" + Math.round(n).toLocaleString("en-US");
    est.querySelectorAll(".terms button").forEach((b) => b.addEventListener("click", () => {
      term = +b.dataset.term;
      est.querySelectorAll(".terms button").forEach((x) => x.setAttribute("aria-pressed", x === b));
      calc();
    }));
    function calc() {
      const c = +cost.value;
      const d = Math.min(Math.max(+down.value || 0, 0), c);
      const r = Math.max(+rate.value || 0, 0) / 100 / 12;
      const p = c - d;
      const m = r === 0 ? p / term : (p * r) / (1 - Math.pow(1 + r, -term));
      costOut.textContent = fmt(c);
      pay.textContent = fmt(m);
      go.href = `contact.html?cost=${c}&term=${term}#request`;
    }
    [cost, down, rate].forEach((el) => el.addEventListener("input", calc));
    calc();
  }

  // Contact form: thank-you redirect and prefill from the estimator
  const nextUrl = document.getElementById("nextUrl");
  if (nextUrl) {
    try { nextUrl.value = new URL("thanks.html", location.href).href; } catch (e) {}
    const q = new URLSearchParams(location.search);
    const c = +q.get("cost"), t = +q.get("term");
    if (c > 0) {
      const sel = document.getElementById("f-cost");
      const pick = c < 25000 ? 0 : c < 100000 ? 1 : c < 250000 ? 2 : c < 1000000 ? 3 : 4;
      sel.selectedIndex = pick + 1;
      const msg = document.getElementById("f-msg");
      if (!msg.value) msg.value = `I used the payment estimator: about $${c.toLocaleString("en-US")} in equipment${t ? `, over ${t} months` : ""}.`;
    }
  }
})();
