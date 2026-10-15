(() => {
  const OPTIONS = [
    { name: "Equipment lease", text: "Lower payments and flexible end-of-term choices: buy it, return it or upgrade." },
    { name: "Equipment loan", text: "Own the equipment from day one with a fixed rate and payment." },
    { name: "Sale-leaseback", text: "Turn equipment you already own into cash, and keep using it." },
    { name: "Used and private party", text: "Financing for used equipment from dealers, auctions and private sellers." },
    { name: "Vendor programs", text: "Equipment sellers offer financing at the point of sale and close more deals." },
    { name: "Start-ups", text: "Options for newer businesses, built around the equipment and the plan." }
  ];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const glyphs = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&/*+$@";
  const rnd = (s) => s[Math.floor(Math.random() * s.length)];
  const tower = document.getElementById("tower");
  const stage = document.getElementById("bstage");
  const pick = document.getElementById("floorsPick");
  const detail = document.getElementById("floorDetail");
  const signLvl = document.getElementById("signLvl");
  const signName = document.getElementById("signName");

  // Build floors, ground floor first
  const N = OPTIONS.length, floors = [], panes = [];
  for (let i = 0; i < N; i++) {
    const el = document.createElement("div");
    el.className = "floor pre" + (i === N - 1 ? " top" : "");
    el.dataset.i = i;
    ["fr", "bk", "lt", "rt", "tp", "bt"].forEach((f) => {
      const face = document.createElement("div");
      face.className = "bf " + f;
      if (f !== "tp" && f !== "bt") {
        for (let k = 0; k < 8; k++) { const p = document.createElement("i"); if (Math.random() < .35) p.className = "on"; face.appendChild(p); panes.push(p); }
      } else if (f === "tp" && i === N - 1) {
        const m = document.createElement("img"); m.src = "assets/img/mark.svg"; m.alt = ""; face.appendChild(m);
      }
      el.appendChild(face);
    });
    tower.appendChild(el);
    floors.push({ el, out: 0, peek: 0, scatter: null, drop: 1 });
  }

  const plaza = document.createElement("div");
  plaza.className = "plaza"; plaza.innerHTML = "<div></div>";
  tower.appendChild(plaza);
  const unitH = () => floors[0].el.offsetHeight;
  const unitW = () => tower.offsetWidth;
  function place(f, i) {
    const h = unitH(), w = unitW();
    let y = ((N - 1) / 2 - i) * h * 1.02;
    let x = 0, z = (f.out * 0.55 + f.peek * 0.12) * w, rot = "";
    if (f.drop) y -= w * 2.2;
    if (f.scatter) { y *= f.scatter.s; x = f.scatter.x * w; z = f.scatter.z * w; rot = `rotateY(${f.scatter.r}deg) rotateZ(${f.scatter.t}deg)`; }
    f.el.style.transform = `translate3d(${x}px, ${y}px, ${z}px) ${rot}`;
  }
  const placeAll = () => {
    floors.forEach(place);
    const h = unitH(), w = unitW();
    plaza.style.transform = `translateY(${((N - 1) / 2) * h * 1.02 + h / 2 + 2}px) rotateX(90deg)`;
  };
  placeAll();
  addEventListener("resize", placeAll);

  // Twinkling office lights
  setInterval(() => {
    for (let k = 0; k < 6; k++) panes[Math.floor(Math.random() * panes.length)].classList.toggle("on");
  }, reduce ? 1200 : 220);

  // Sign text decode
  let signTimer;
  function sign(lvl, name) {
    signLvl.textContent = lvl;
    const target = name.toUpperCase();
    let fr = 0;
    clearInterval(signTimer);
    if (reduce) { signName.textContent = target; return; }
    signTimer = setInterval(() => {
      fr++;
      signName.textContent = [...target].map((c, j) => c === " " ? " " : (j < fr / 2 ? c : rnd(glyphs))).join("");
      if (fr / 2 >= target.length) clearInterval(signTimer);
    }, 26);
  }

  // Picker
  OPTIONS.forEach((o, i) => {
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.type = "button"; b.id = "lvl" + i; b.setAttribute("aria-pressed", "false");
    b.innerHTML = `<span class="lvl">LEVEL 0${i + 1}</span><span class="nm">${o.name}</span><span class="ar" aria-hidden="true">→</span>`;
    b.addEventListener("click", () => select(i));
    b.addEventListener("mouseenter", () => { if (!floors[i].out) { floors[i].peek = 1; place(floors[i], i); } });
    b.addEventListener("mouseleave", () => { floors[i].peek = 0; place(floors[i], i); });
    li.appendChild(b); pick.appendChild(li);
  });

  // Rotation
  let rx = -16, ry = 32, vx = 0, vy = 0.22, dragging = false, moved = 0, lx = 0, ly = 0, downFloor = null;
  let aimAt = null, holdUntil = 0, tourTimer = null, seq = 0, current = -1, busy = true;
  const idle = reduce ? 0 : 0.22;
  const near = (cur, t) => cur + ((((t - cur) % 360) + 540) % 360 - 180);

  function select(i, fromTour) {
    if (busy) return;
    if (!fromTour) stopTour();
    const f = floors[i], my = ++seq;
    current = i;
    pick.querySelectorAll("button").forEach((x, j) => x.setAttribute("aria-pressed", j === i));
    detail.innerHTML = `<b>${OPTIONS[i].name}</b><p>${OPTIONS[i].text}</p>`;
    floors.forEach((o, j) => { if (j !== i) { o.out = 0; o.el.classList.remove("sel", "flash"); } place(o, j); });
    aimAt = [-14, near(ry, -24)]; vx = vy = 0; holdUntil = Infinity;
    setTimeout(() => {
      if (my !== seq) return;
      f.out = 1; f.peek = 0; f.el.classList.add("sel"); place(f, i);
      setTimeout(() => {
        if (my !== seq) return;
        f.el.classList.remove("flash"); void f.el.offsetWidth; f.el.classList.add("flash");
        sign(`LEVEL 0${i + 1}`, OPTIONS[i].name);
        holdUntil = performance.now() + (fromTour ? 2600 : 5000);
      }, 360);
    }, reduce ? 40 : 600);
  }
  function release() {
    seq++; current = -1;
    floors.forEach((o, j) => { o.out = 0; o.el.classList.remove("sel", "flash"); place(o, j); });
    pick.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", "false"));
    sign("", "Union Capital");
  }

  // Build the tower floor by floor
  function build(then) {
    busy = true;
    floors.forEach((f, i) => { f.drop = 1; f.scatter = null; f.el.classList.add("pre"); place(f, i); });
    sign("UNDER CONSTRUCTION", "Building your capital");
    floors.forEach((f, i) => setTimeout(() => {
      f.el.classList.remove("pre"); f.drop = 0; place(f, i);
    }, (reduce ? 0 : 250) + i * (reduce ? 0 : 230)));
    setTimeout(() => { busy = false; sign("", "Union Capital"); then && then(); }, reduce ? 300 : 250 + N * 230 + 700);
  }
  // Blow it apart and rebuild
  function explode() {
    if (busy) return;
    stopTour(); release(); busy = true;
    floors.forEach((f, i) => {
      f.scatter = { s: 1.6 + Math.random() * .25, x: (Math.random() - .5) * .9, z: (Math.random() - .5) * .9, r: (Math.random() - .5) * 70, t: (Math.random() - .5) * 18 };
      f.el.classList.add("flying"); place(f, i);
    });
    sign("SIX WAYS TO FINANCE", "One partner");
    vy = reduce ? 0 : 1.4;
    setTimeout(() => {
      floors.forEach((f, i) => { f.scatter = null; place(f, i); });
      setTimeout(() => { floors.forEach((f) => f.el.classList.remove("flying")); busy = false; sign("", "Union Capital"); }, 1100);
    }, 2000);
  }

  // Tour
  function startTour() {
    stopTour(); let k = 0;
    const step = () => { select(k % N, true); k++; tourTimer = setTimeout(step, 3300); };
    step();
  }
  function stopTour() { if (tourTimer) { clearTimeout(tourTimer); tourTimer = null; } }

  // Pointer: drag to spin, click a floor to select, click empty space to rebuild
  stage.addEventListener("pointerdown", (e) => {
    dragging = true; moved = 0; lx = e.clientX; ly = e.clientY; vx = vy = 0; aimAt = null;
    downFloor = e.target.closest(".floor");
    stage.classList.add("dragging"); stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - lx, dy = e.clientY - ly;
    moved += Math.abs(dx) + Math.abs(dy);
    if (moved > 6 && tourTimer) stopTour();
    ry += dx * 0.4; rx = Math.max(-40, Math.min(10, rx - dy * 0.25)); vy = dx * 0.4; vx = -dy * 0.2;
    lx = e.clientX; ly = e.clientY;
  });
  const end = () => {
    if (!dragging) return;
    dragging = false; stage.classList.remove("dragging");
    if (moved < 6) { if (downFloor) select(+downFloor.dataset.i); else explode(); }
    else if (current >= 0) release();
  };
  stage.addEventListener("pointerup", end);
  stage.addEventListener("pointercancel", end);

  (function tick(now) {
    now = now || performance.now();
    if (!dragging) {
      if (aimAt && now < holdUntil) { rx += (aimAt[0] - rx) * 0.08; ry += (aimAt[1] - ry) * 0.08; }
      else {
        if (aimAt) { aimAt = null; if (!tourTimer && current >= 0) release(); }
        ry += vy; rx += vx; vy += (idle - vy) * 0.03; vx *= 0.92; rx += (-16 - rx) * 0.02;
      }
    }
    tower.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    requestAnimationFrame(tick);
  })();

  build(() => { if (!reduce) setTimeout(startTour, 600); else select(0, true); });
})();
