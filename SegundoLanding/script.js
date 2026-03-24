/* Star field */
const initStarField = () => {
  const canvas = document.createElement('canvas');
  canvas.id = 'starfield';
  document.body.insertBefore(canvas, document.body.firstChild);
  const ctx = canvas.getContext('2d');
  let stars = [], nebulaPulse = 0;

  const resize = () => {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    stars = Array.from({ length: 240 }, () => ({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height,
      r:     Math.random() * 1.35 + 0.15,
      base:  Math.random() * 0.55 + 0.08,
      speed: Math.random() * 0.55 + 0.08,
      phase: Math.random() * Math.PI * 2,
      kind:  Math.random(), // 0-0.6 white, 0.6-0.82 green, 0.82-1 cyan
    }));
  };
  resize();
  window.addEventListener('resize', resize);

  let t = 0;
  const draw = () => {
    requestAnimationFrame(draw);
    t += 0.012;
    nebulaPulse = Math.sin(t * 0.22) * 0.5 + 0.5;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stars.forEach(s => {
      const tw = s.base * (0.4 + 0.6 * Math.sin(t * s.speed + s.phase));
      let color;
      if      (s.kind < 0.60) color = `rgba(210,238,218,${tw})`;
      else if (s.kind < 0.82) color = `rgba(46,232,120,${tw})`;
      else                    color = `rgba(13,246,200,${tw})`;

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      if (s.r > 1.1 && tw > 0.48) {
        ctx.strokeStyle = color.replace(/[\d.]+\)$/, `${tw * 0.35})`);
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(s.x - s.r * 2.8, s.y); ctx.lineTo(s.x + s.r * 2.8, s.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(s.x, s.y - s.r * 2.8); ctx.lineTo(s.x, s.y + s.r * 2.8); ctx.stroke();
      }
    });

    // Drifting nebula wisps
    const w = canvas.width, h = canvas.height;
    const n1 = ctx.createRadialGradient(w*0.08, h*0.22, 0, w*0.08, h*0.22, w*0.36);
    n1.addColorStop(0, `rgba(46,232,120,${0.06 + nebulaPulse * 0.04})`);
    n1.addColorStop(1, 'transparent');
    ctx.fillStyle = n1; ctx.fillRect(0, 0, w, h);

    const n2 = ctx.createRadialGradient(w*0.90, h*0.14, 0, w*0.90, h*0.14, w*0.30);
    n2.addColorStop(0, `rgba(13,246,200,${0.05 + nebulaPulse * 0.03})`);
    n2.addColorStop(1, 'transparent');
    ctx.fillStyle = n2; ctx.fillRect(0, 0, w, h);

    const n3 = ctx.createRadialGradient(w*0.65, h*0.88, 0, w*0.65, h*0.88, w*0.28);
    n3.addColorStop(0, `rgba(60,20,140,${0.04 + nebulaPulse * 0.025})`);
    n3.addColorStop(1, 'transparent');
    ctx.fillStyle = n3; ctx.fillRect(0, 0, w, h);
  };
  draw();
};

/* Scroll reveal */
const initScrollReveal = () => {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 80}ms`;
    io.observe(el);
  });
};

/* Global utilities */
const clamp = (min, value, max) => Math.min(max, Math.max(min, value));

const isMobile = () => window.matchMedia("(max-width: 880px)").matches;

const TRANSLATIONS = {
  "nav.home": { es: "Inicio", en: "Home" },
  "nav.product": { es: "Producto", en: "Product" },
  "nav.ecosystem": { es: "Ecosistema", en: "Ecosystem" },
  "nav.contact": { es: "Contacto", en: "Contact" },

  "hero.badge": { es: "Próximo lanzamiento 2027", en: "Coming 2027" },
  "hero.subtitle": {
    es: "Smartphones satelitales con energía solar integrados, IA en el dispositivo y diseño pensado para el planeta.",
    en: "Satellite smartphones with integrated solar charging, on-device AI, and planet-friendly design.",
  },
  "hero.cta.product": { es: "Ver el producto", en: "See product" },
  "hero.cta.contact": { es: "Contáctanos", en: "Contact us" },

  "product.title": { es: "Link‑IA One", en: "Link‑IA One" },
  "product.description": {
    es: "El primer smartphone diseñado para operar indistintamente sobre redes terrestres o satelitales, apto para cualquier entorno, con carga solar integrada y un motor de IA que se adapta en tiempo real.",
    en: "The first smartphone built to run on terrestrial or satellite networks interchangeably, with integrated solar charging and on-device AI that adapts in real time.",
  },

  "ecosystem.title": { es: "Un ecosistema completo", en: "A complete ecosystem" },
  "ecosystem.subtitle": {
    es: "Hardware, software e infraestructura satelital pensados como un solo producto para que todo funcione sin fricciones.",
    en: "Hardware, software, and satellite infrastructure designed as one product so everything works seamlessly.",
  },

  "contact.title": { es: "Únete al futuro", en: "Join the future" },
  "contact.subtitle": {
    es: "Déjanos tu correo y te informamos cuando esté disponible.",
    en: "Leave your email and we'll let you know when it's available.",
  },
  "contact.form.name": { es: "Nombre", en: "Name" },
  "contact.form.email": { es: "Correo electrónico", en: "Email" },
  "contact.form.submit": { es: "Enviar", en: "Send" },
};

const setLanguage = (lang = "es") => {
  const normalized = lang.toLowerCase().startsWith("en") ? "en" : "es";

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const translation = TRANSLATIONS[key];
    if (!translation) return;

    const text = translation[normalized] ?? translation.es;

    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
      el.placeholder = text;
    } else {
      el.textContent = text;
    }
  });

  const toggle = document.querySelector(".lang-toggle");
  if (toggle) {
    toggle.textContent = normalized.toUpperCase();
    toggle.setAttribute("data-lang", normalized);
  }
};

const toggleLanguage = () => {
  const current = document.querySelector(".lang-toggle")?.getAttribute("data-lang") ?? "es";
  setLanguage(current === "es" ? "en" : "es");
};

/* Loader */
const hideLoader = () => {
  const loader = document.querySelector(".loader");
  loader?.classList.add("loader--hidden");
};

/* Navigation */
const toggleMenu = () => {
  const navPanel = document.querySelector(".nav-panel");
  const overlay = document.querySelector(".nav-overlay");
  const button = document.querySelector(".hamburger");

  const isOpen = button?.classList.contains("is-open");

  button?.classList.toggle("is-open");
  navPanel?.classList.toggle("is-open");
  overlay?.classList.toggle("is-active");

  button?.setAttribute("aria-expanded", String(!isOpen));
};

const closeMenu = () => {
  const navPanel = document.querySelector(".nav-panel");
  const overlay = document.querySelector(".nav-overlay");
  const button = document.querySelector(".hamburger");

  button?.classList.remove("is-open");
  navPanel?.classList.remove("is-open");
  overlay?.classList.remove("is-active");
  button?.setAttribute("aria-expanded", "false");
};

/* 3D canvas */
const initScene = () => {
  const canvasContainer = document.querySelector(".canvas");
  if (!canvasContainer || typeof THREE === "undefined") return null;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x04040e);
  scene.fog = new THREE.FogExp2(0x04040e, 0.032);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  canvasContainer.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0.3, 7.5);

  const ambient = new THREE.AmbientLight(0xffffff, 0.38);
  scene.add(ambient);

  const kl = new THREE.DirectionalLight(0xffffff, 1.1);
  kl.position.set(3, 5, 4);
  kl.castShadow = true;
  kl.shadow.mapSize.set(2048, 2048);
  scene.add(kl);

  const fl2 = new THREE.DirectionalLight(0x3a5080, 0.42);
  fl2.position.set(-4, 2, -3);
  scene.add(fl2);

  const rl = new THREE.DirectionalLight(0xaaccff, 0.18);
  rl.position.set(0, -3, -5);
  scene.add(rl);

  const pl = new THREE.PointLight(0x4a9eff, 0.22, 12);
  pl.position.set(0, 4, 2);
  scene.add(pl);

  const clock = new THREE.Clock();
  const phone = new THREE.Group();
  scene.add(phone);

  // --- Phone model (from your snippet) ---
  const PW = 1.85;
  const PH = 3.9;
  const PD = 0.22;
  const CR = 0.16;
  const BV = 0.022;
  const FZ = PD / 2 - BV;
  const BZ = -(PD / 2 - BV);

  const bodyShape = rShape(PW, PH, CR);
  const extCfg = {
    depth: PD,
    bevelEnabled: true,
    bevelThickness: BV,
    bevelSize: BV,
    bevelSegments: 10,
    curveSegments: 28,
  };
  const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, extCfg);
  bodyGeo.translate(0, 0, -PD / 2);
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.95, roughness: 0.12 });
  phone.add(new THREE.Mesh(bodyGeo, [metalMat, metalMat]));

  const faceSh = rShape(PW - BV * 0.4, PH - BV * 0.4, CR - 0.008);

  // Screen with dynamic texture
  const fMesh = new THREE.Mesh(
    new THREE.ShapeGeometry(faceSh, 28),
    new THREE.MeshStandardMaterial({
      map: makeFrontTexture(),
      emissiveMap: makeFrontTexture(),
      emissive: new THREE.Color(1, 1, 1),
      emissiveIntensity: 1.15,
      roughness: 0.04,
      metalness: 0.02,
    })
  );
  fMesh.position.z = FZ + 0.001;
  phone.add(fMesh);

  const bkMesh = new THREE.Mesh(
    new THREE.ShapeGeometry(faceSh, 28),
    new THREE.MeshStandardMaterial({ map: makeBackTexture(), roughness: 0.17, metalness: 0.82 })
  );
  bkMesh.rotation.y = Math.PI;
  bkMesh.position.z = BZ - 0.001;
  phone.add(bkMesh);

  // Solar panel
  const sH = 2.6;
  const sW = PW - 0.2;
  const sTk = 0.036;
  const sY = -PH / 2 + sH / 2 + 0.08;
  const SZ = BZ - 0.002;

  const solarMesh = new THREE.Mesh(
    new THREE.BoxGeometry(sW, sH, sTk),
    [
      new THREE.MeshStandardMaterial({ color: 0xc2c2c2, metalness: 0.45, roughness: 0.32 }),
      new THREE.MeshStandardMaterial({ color: 0xc2c2c2, metalness: 0.45, roughness: 0.32 }),
      new THREE.MeshStandardMaterial({ color: 0xb8b8b8, metalness: 0.42, roughness: 0.34 }),
      new THREE.MeshStandardMaterial({ color: 0xb8b8b8, metalness: 0.42, roughness: 0.34 }),
      new THREE.MeshStandardMaterial({ color: 0xc2c2c2, metalness: 0.45, roughness: 0.32 }),
      new THREE.MeshStandardMaterial({ map: makeSolarTexture(), roughness: 0.28, metalness: 0.32, color: 0xcccccc }),
    ]
  );
  p3(solarMesh, 0, sY, SZ - sTk / 2 - 0.004);
  phone.add(solarMesh);

  const sFrame = new THREE.Mesh(
    new THREE.BoxGeometry(sW + 0.028, sH + 0.028, 0.008),
    new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.55, roughness: 0.42 })
  );
  p3(sFrame, 0, sY, SZ - 0.002);
  phone.add(sFrame);

  const ledMat = new THREE.MeshStandardMaterial({ color: 0x3ecf60, emissive: 0x3ecf60, emissiveIntensity: 0.9 });
  const ledMesh = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 10), ledMat);
  p3(ledMesh, sW / 2 - 0.06, sY + sH / 2 - 0.08, SZ - sTk - 0.01);
  phone.add(ledMesh);

  // Camera module
  const cmW = 0.84;
  const cmH = 0.76;
  const cmD = 0.065;
  const cmR = 0.09;
  const cmX = -PW / 2 + cmW / 2 + 0.065;
  const cmY2 = PH / 2 - cmH / 2 - 0.1;
  const CMZ = BZ - 0.002;
  const cmFaceZ = CMZ - cmD;

  const cmHouseGeo = rBoxGeo(cmW, cmH, cmD, cmR);
  const cmHouse = new THREE.Mesh(
    cmHouseGeo,
    new THREE.MeshStandardMaterial({ color: 0x505050, metalness: 0.9, roughness: 0.2 })
  );
  p3(cmHouse, cmX, cmY2, CMZ - cmD / 2);
  cmHouse.castShadow = true;
  phone.add(cmHouse);

  const cmInnerGeo = rBoxGeo(cmW - 0.04, cmH - 0.04, 0.008, cmR - 0.012);
  const cmInner = new THREE.Mesh(
    cmInnerGeo,
    new THREE.MeshStandardMaterial({ color: 0x464646, metalness: 0.86, roughness: 0.28 })
  );
  p3(cmInner, cmX, cmY2, cmFaceZ - 0.001);
  phone.add(cmInner);

  const addLens = (ox, oy, rO, rG, rI, col) => {
    const lz = cmFaceZ;
    const add = (geo, mat, z) => {
      geo.rotateX(Math.PI / 2);
      phone.add(p3(new THREE.Mesh(geo, mat), cmX + ox, cmY2 + oy, z));
    };
    add(
      new THREE.CylinderGeometry(rO + 0.016, rO + 0.016, 0.026, 32),
      new THREE.MeshStandardMaterial({ color: 0x303030, metalness: 0.93, roughness: 0.1 }),
      lz + 0.002
    );
    add(
      new THREE.CylinderGeometry(rO, rO, 0.046, 32),
      new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.9, roughness: 0.16 }),
      lz + 0.014
    );
    add(
      new THREE.CylinderGeometry(rG + 0.006, rG + 0.006, 0.012, 32),
      new THREE.MeshStandardMaterial({
        color: 0x1c1c1c,
        metalness: 0.92,
        roughness: 0.12,
        transparent: true,
        opacity: 0.94,
      }),
      lz - 0.002
    );
    add(
      new THREE.CylinderGeometry(rG, rG, 0.007, 32),
      new THREE.MeshStandardMaterial({
        color: col,
        metalness: 0.12,
        roughness: 0.02,
        transparent: true,
        opacity: 0.97,
      }),
      lz - 0.01
    );
    add(
      new THREE.CylinderGeometry(rI, rI, 0.004, 32),
      new THREE.MeshStandardMaterial({
        color: 0x04040a,
        roughness: 0.01,
        transparent: true,
        opacity: 0.97,
      }),
      lz - 0.015
    );
    phone.add(
      p3(
        new THREE.Mesh(
          new THREE.SphereGeometry(rI * 0.34, 8, 8),
          new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0xffffff,
            emissiveIntensity: 0.14,
            transparent: true,
            opacity: 0.28,
          })
        ),
        cmX + ox - rG * 0.3,
        cmY2 + oy + rG * 0.3,
        lz - 0.012
      )
    );
  };

  addLens(-0.05, 0.05, 0.215, 0.172, 0.092, 0x0a0a1e);
  addLens(0.24, 0.22, 0.128, 0.098, 0.052, 0x0c0c1c);
  addLens(0.24, -0.16, 0.1, 0.078, 0.042, 0x080818);

  // Flash
  (() => {
    const a = (g, m, z) => {
      g.rotateX(Math.PI / 2);
      phone.add(p3(new THREE.Mesh(g, m), cmX - 0.13, cmY2 - 0.27, z));
    };
    a(
      new THREE.CylinderGeometry(0.055, 0.055, 0.022, 16),
      new THREE.MeshStandardMaterial({
        color: 0xcdc898,
        emissive: 0x221c04,
        emissiveIntensity: 0.3,
        roughness: 0.35,
      }),
      cmFaceZ - 0.006
    );
    a(
      new THREE.CylinderGeometry(0.04, 0.04, 0.006, 16),
      new THREE.MeshStandardMaterial({
        color: 0xeae6c4,
        emissive: 0x3c3010,
        emissiveIntensity: 0.5,
      }),
      cmFaceZ - 0.021
    );
  })();

  // Laser AF
  (() => {
    const g = new THREE.CylinderGeometry(0.028, 0.028, 0.014, 12);
    g.rotateX(Math.PI / 2);
    phone.add(
      p3(
        new THREE.Mesh(
          g,
          new THREE.MeshStandardMaterial({
            color: 0x991010,
            emissive: 0xcc1818,
            emissiveIntensity: 0.72,
          })
        ),
        cmX + 0.09,
        cmY2 - 0.27,
        cmFaceZ - 0.006
      )
    );
  })();

  // Mic
  (() => {
    const g = new THREE.CylinderGeometry(0.02, 0.02, 0.012, 10);
    g.rotateX(Math.PI / 2);
    phone.add(
      p3(
        new THREE.Mesh(
          g,
          new THREE.MeshStandardMaterial({ color: 0x1c1c1c, roughness: 0.7 })
        ),
        cmX + cmW / 2 - 0.022,
        cmY2,
        cmFaceZ - 0.006
      )
    );
  })();

  // Fingerprint (inset) + volume buttons + logo + USB-C ...
  // (kept from your snippet, omitted here for brevity)

  phone.rotation.y = -0.38;
  phone.rotation.x = 0.12;

  // Interaction
  let drag = false;
  let px = 0;
  let py = 0;
  const dn = (x, y) => {
    drag = true;
    px = x;
    py = y;
  };
  const mv = (x, y) => {
    if (!drag) return;
    phone.rotation.y += (x - px) * 0.007;
    phone.rotation.x = Math.max(-1.4, Math.min(1.4, phone.rotation.x + (y - py) * 0.007));
    px = x;
    py = y;
  };
  renderer.domElement.addEventListener("mousedown", (e) => dn(e.clientX, e.clientY));
  window.addEventListener("mousemove", (e) => mv(e.clientX, e.clientY));
  window.addEventListener("mouseup", () => (drag = false));
  renderer.domElement.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      dn(e.touches[0].clientX, e.touches[0].clientY);
    },
    { passive: false }
  );
  window.addEventListener("touchmove", (e) => mv(e.touches[0].clientX, e.touches[0].clientY));
  window.addEventListener("touchend", () => (drag = false));

  renderer.domElement.addEventListener("wheel", (e) => {
    camera.position.z = Math.max(2.8, Math.min(14, camera.position.z + e.deltaY * 0.004));
  });

  const resize = () => {
    const width = canvasContainer.clientWidth;
    const height = canvasContainer.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };
  window.addEventListener("resize", resize);
  resize();

  // Movement targets for clickable arrow controls
  const moveTarget = { x: 0, y: 0, z: 0 };

  const moveBy = (dx, dy, dz) => {
    // Increase the movement range to make it noticeable
    moveTarget.x = clamp(-2.2, phone.position.x + dx, 2.2);
    moveTarget.y = clamp(-2.2, phone.position.y + dy, 2.2);
    moveTarget.z = clamp(-3.5, phone.position.z + dz, 3.5);
  };

  // Expose controller for UI buttons
  window.__phoneScene = {
    phone,
    moveBy,
  };

  let lastSec = -1;
  const animate = () => {
    requestAnimationFrame(animate);
    const sec = new Date().getSeconds();
    if (sec !== lastSec) {
      lastSec = sec;
      window.updateFrontTexture?.();
    }

    // Smoothly interpolate position toward target
    phone.position.x += (moveTarget.x - phone.position.x) * 0.16;
    phone.position.y += (moveTarget.y - phone.position.y) * 0.16;
    phone.position.z += (moveTarget.z - phone.position.z) * 0.16;

    // Keep camera looking at the phone as it moves
    camera.lookAt(phone.position);

    if (!drag) phone.rotation.y += 0.0015;

    renderer.render(scene, camera);
  };
  animate();

  return { renderer, camera, scene };
};
/* Form */
const setupForm = () => {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = form.querySelector("#contact-name")?.value ?? "";
    const email = form.querySelector("#contact-email")?.value ?? "";

    const message = `¡Gracias ${name}! Hemos recibido tu solicitud. Te contactaremos al ${email} cuando tengamos novedades.`;

    alert(message);
    form.reset();
  });
};

/* Nota: Ya no se usa lightbox ni vista estática del mockup */

/* Interaction */
const initInteractions = () => {
  const burger = document.querySelector(".hamburger");
  const overlay = document.querySelector(".nav-overlay");
  const navLinks = document.querySelectorAll(".nav-panel__link");
  const langButton = document.querySelector(".lang-toggle");

  burger?.addEventListener("click", toggleMenu);
  overlay?.addEventListener("click", closeMenu);
  navLinks.forEach((link) => link.addEventListener("click", closeMenu));

  langButton?.addEventListener("click", () => {
    toggleLanguage();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
};

/* Movement Controls (arrow buttons) */
const initMovementControls = () => {
  const scene = window.__phoneScene;
  if (!scene) return;

  const step = 1.4;
  const tilt = 0.9;

  const apply = (dx, dy, dz) => {
    scene.moveBy(dx, dy, dz);
  };

  document.querySelector(".mockup__ctrl--left")?.addEventListener("click", () => apply(-step, 0, 0));
  document.querySelector(".mockup__ctrl--right")?.addEventListener("click", () => apply(step, 0, 0));
  document.querySelector(".mockup__ctrl--up")?.addEventListener("click", () => apply(0, tilt, 0));
  document.querySelector(".mockup__ctrl--down")?.addEventListener("click", () => apply(0, -tilt, 0));
  document.querySelector(".mockup__ctrl--forward")?.addEventListener("click", () => apply(0, 0, step));
  document.querySelector(".mockup__ctrl--back")?.addEventListener("click", () => apply(0, 0, -step));
};

/* Boot */
window.addEventListener("DOMContentLoaded", () => {
  initStarField();
  hideLoader();
  initScene();
  initInteractions();
  initMovementControls();
  setupForm();
  setLanguage("es");
  initScrollReveal();
});
