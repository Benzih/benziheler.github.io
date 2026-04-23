// BENZI HELER — client-side interactions

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
  window.addEventListener('mouseleave', () => {
    c.style.opacity = 0; t.style.opacity = 0;
  });
  window.addEventListener('mouseenter', () => {
    c.style.opacity = 1; t.style.opacity = 1;
  });

  const loop = () => {
    c.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    tx += (mx - tx) * 0.18;
    ty += (my - ty) * 0.18;
    t.style.transform = `translate(${tx}px, ${ty}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  };
  loop();

  // hover state
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

// ===== 3D tilt on cards =====
(() => {
  document.querySelectorAll('[data-tilt]').forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      const maxRot = 7;
      el.style.transform = `translateY(-8px) perspective(800px) rotateX(${-py * maxRot}deg) rotateY(${px * maxRot}deg)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
})();

// ===== Parallax hero background =====
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
