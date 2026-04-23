// BENZI HELER — client-side interactions

// ===== i18n =====
(() => {
  const I18N = window.I18N || {};
  const SUPPORTED = Object.keys(I18N);
  const KEY = 'bh_lang';

  const detect = () => {
    const saved = localStorage.getItem(KEY);
    if (saved && SUPPORTED.includes(saved)) return saved;
    const nav = (navigator.language || 'en').toLowerCase();
    const short = nav.split('-')[0];
    if (SUPPORTED.includes(short)) return short;
    // map some variants
    if (short === 'iw') return 'he';
    if (short === 'in') return 'id';
    return 'en';
  };

  const apply = (lang) => {
    const dict = I18N[lang] || I18N.en;
    document.documentElement.lang = lang;
    document.documentElement.dir = dict.dir || 'ltr';
    document.body.classList.toggle('rtl', dict.dir === 'rtl');

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) el.textContent = dict[key];
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (dict[key] !== undefined) el.innerHTML = dict[key];
    });

    const flag = document.getElementById('langFlag');
    const code = document.getElementById('langCode');
    if (flag) flag.textContent = dict.flag;
    if (code) code.textContent = lang.toUpperCase();
    localStorage.setItem(KEY, lang);
  };

  const buildMenu = () => {
    const menu = document.getElementById('langMenu');
    if (!menu) return;
    menu.innerHTML = '';
    SUPPORTED.forEach(code => {
      const d = I18N[code];
      const li = document.createElement('li');
      li.innerHTML = `<span>${d.flag}</span><span>${d.name}</span><span class="lang-iso">${code.toUpperCase()}</span>`;
      li.dataset.lang = code;
      li.addEventListener('click', () => {
        apply(code);
        menu.classList.remove('open');
      });
      menu.appendChild(li);
    });
  };

  const initSwitcher = () => {
    const btn = document.getElementById('langBtn');
    const menu = document.getElementById('langMenu');
    if (!btn || !menu) return;
    buildMenu();
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target) && e.target !== btn) menu.classList.remove('open');
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') menu.classList.remove('open');
    });
  };

  apply(detect());
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSwitcher);
  } else {
    initSwitcher();
  }
})();

// ===== Starfield =====
(() => {
  const canvas = document.getElementById('stars');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, stars = [];

  const resize = () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const count = Math.min(160, Math.floor((w * h) / 12000));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      z: Math.random() * 1.2 + 0.3,
      tw: Math.random() * Math.PI * 2,
      color: Math.random() > 0.85
        ? (Math.random() > 0.5 ? '255,170,51' : '77,224,255')
        : '255,255,255'
    }));
  };
  resize();
  window.addEventListener('resize', resize);

  const render = (t) => {
    ctx.clearRect(0, 0, w, h);
    stars.forEach(s => {
      const a = 0.4 + Math.sin(s.tw + t * 0.002) * 0.4;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.z, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${s.color}, ${a.toFixed(2)})`;
      ctx.shadowColor = `rgba(${s.color}, ${(a * 0.5).toFixed(2)})`;
      ctx.shadowBlur = s.z * 3;
      ctx.fill();
      s.y += s.z * 0.08;
      if (s.y > h + 5) { s.y = -5; s.x = Math.random() * w; }
    });
    requestAnimationFrame(render);
  };
  requestAnimationFrame(render);
})();

// ===== Cursor =====
(() => {
  const c = document.querySelector('.cursor');
  const t = document.querySelector('.cursor-trail');
  if (!c || !t) return;
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let tx = mx, ty = my;

  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  window.addEventListener('mouseleave', () => { c.style.opacity = 0; t.style.opacity = 0; });
  window.addEventListener('mouseenter', () => { c.style.opacity = 1; t.style.opacity = 1; });

  const loop = () => {
    c.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    tx += (mx - tx) * 0.18;
    ty += (my - ty) * 0.18;
    t.style.transform = `translate(${tx}px, ${ty}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  };
  loop();

  document.querySelectorAll('a, button, [data-tilt], .card').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
  });
})();

// ===== Reveal on scroll =====
(() => {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('in'), i * 80);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

// ===== 3D tilt =====
(() => {
  document.querySelectorAll('[data-tilt]').forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      const maxRot = 7;
      el.style.transform = `translateY(-8px) perspective(800px) rotateX(${-py * maxRot}deg) rotateY(${px * maxRot}deg)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
})();

// ===== Parallax hero bg =====
(() => {
  const bg = document.querySelector('.hero-bg');
  if (!bg) return;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight) {
      bg.style.transform = `scale(1.1) translateY(${y * 0.3}px)`;
    }
  }, { passive: true });
})();

// ===== Year =====
document.getElementById('year').textContent = new Date().getFullYear();
