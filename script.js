/* ND Construction 1992 — site script (standalone, file:// safe, no network, no storage) */
(function () {
  'use strict';

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var doc = document;

  function $(sel, root) { return (root || doc).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(sel)); }

  function mq(query) {
    return (typeof window.matchMedia === 'function') ? window.matchMedia(query) : null;
  }
  var reducedMotionMq = mq('(prefers-reduced-motion: reduce)');
  function prefersReducedMotion() { return !!(reducedMotionMq && reducedMotionMq.matches); }

  function onMqChange(m, handler) {
    if (!m) return;
    if (typeof m.addEventListener === 'function') m.addEventListener('change', handler);
    else if (typeof m.addListener === 'function') m.addListener(handler);
  }

  function makeIcon(id) {
    var svg = doc.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'icon');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    var use = doc.createElementNS(SVG_NS, 'use');
    use.setAttribute('href', '#' + id);
    svg.appendChild(use);
    return svg;
  }

  function el(tag, className, text) {
    var node = doc.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function focusAndReveal(node) {
    if (!node || typeof node.focus !== 'function') return;
    try { node.focus({ preventScroll: true }); } catch (e) { node.focus(); }
    if (typeof node.scrollIntoView === 'function') {
      try {
        node.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' });
      } catch (e2) { node.scrollIntoView(); }
    }
  }

  /* ---------------------------------------------------------------- 1. Mobile nav */
  function initNav() {
    var toggle = $('#nav-toggle');
    var nav = $('#site-nav');
    if (!toggle || !nav) return;
    var desktopMq = mq('(min-width: 1024px)');

    function isOpen() { return nav.classList.contains('is-open'); }

    function setState(open) {
      nav.classList.toggle('is-open', open);
      doc.body.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      var label = open ? 'ปิดเมนู' : 'เปิดเมนู';
      toggle.setAttribute('aria-label', label);
      toggle.setAttribute('title', label);
    }

    function openNav() {
      setState(true);
      var first = $('.nav-link, .nav-cta', nav);
      if (first) first.focus();
    }

    function closeNav(returnFocus) {
      if (!isOpen()) return;
      setState(false);
      if (returnFocus) toggle.focus();
    }

    toggle.addEventListener('click', function () {
      if (isOpen()) closeNav(false); else openNav();
    });

    nav.addEventListener('click', function (e) {
      var t = e.target;
      if (t && t.closest && t.closest('.nav-link, .nav-cta')) closeNav(false);
    });

    doc.addEventListener('keydown', function (e) {
      if ((e.key === 'Escape' || e.key === 'Esc') && isOpen()) {
        closeNav(true);
      }
    });

    doc.addEventListener('click', function (e) {
      if (!isOpen()) return;
      var t = e.target;
      if (nav.contains(t) || toggle.contains(t)) return;
      closeNav(false);
    });

    onMqChange(desktopMq, function () { setState(false); });
    setState(false);
  }

  /* ---------------------------------------------------------------- 2. Header + active link */
  function initHeader() {
    var header = $('.site-header');
    if (header) {
      var ticking = false;
      var update = function () {
        ticking = false;
        var y = window.scrollY || window.pageYOffset || 0;
        header.classList.toggle('is-scrolled', y > 8);
      };
      window.addEventListener('scroll', function () {
        if (!ticking) {
          ticking = true;
          (window.requestAnimationFrame || setTimeout)(update);
        }
      }, { passive: true });
      update();
    }

    if (!('IntersectionObserver' in window)) return;
    var ids = ['home', 'about', 'services', 'projects', 'contact'];
    var links = $all('.nav-link');
    if (!links.length) return;

    function setActive(id) {
      links.forEach(function (a) {
        if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    }

    var visible = {};
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        visible[entry.target.id] = entry.isIntersecting;
      });
      for (var i = ids.length - 1; i >= 0; i--) {
        if (visible[ids[i]]) { setActive(ids[i]); return; }
      }
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

    ids.forEach(function (id) {
      var s = doc.getElementById(id);
      if (s) observer.observe(s);
    });
  }

  /* ---------------------------------------------------------------- 3. Projects */
  /*
   * Real projects go here. Leave empty until the company supplies verified data.
   * Shape:
   * {
   *   id: 'p1',                     // unique, used by data-project-id
   *   title: 'ชื่อโครงการ',
   *   type: 'residential',          // residential | commercial | renovation | other (matches data-filter)
   *   typeLabel: 'หมวดที่ 1',
   *   location: 'เขต/จังหวัด',
   *   year: '2569',
   *   scope: 'ขอบเขตงานที่บริษัทดำเนินการ',
   *   note: 'หมายเหตุเพิ่มเติม',
   *   image: 'assets/projects/p1.jpg' // optional; currently a placeholder icon is shown
   * }
   */
  var PROJECTS = [];

  var SAMPLE_NOTE = 'ข้อมูลตัวอย่างเพื่อแสดงรูปแบบ ไม่ใช่ผลงานจริงของบริษัท';
  var SAMPLE_PROJECTS = [
    { id: 's1', sample: true, title: 'ตัวอย่างโครงการ A', type: 'residential', typeLabel: 'หมวดที่ 1',
      location: 'ตัวอย่างสถานที่', year: '—', scope: 'ตัวอย่างขอบเขตงาน', note: SAMPLE_NOTE, image: '' },
    { id: 's2', sample: true, title: 'ตัวอย่างโครงการ B', type: 'commercial', typeLabel: 'หมวดที่ 2',
      location: 'ตัวอย่างสถานที่', year: '—', scope: 'ตัวอย่างขอบเขตงาน', note: SAMPLE_NOTE, image: '' },
    { id: 's3', sample: true, title: 'ตัวอย่างโครงการ C', type: 'renovation', typeLabel: 'หมวดที่ 3',
      location: 'ตัวอย่างสถานที่', year: '—', scope: 'ตัวอย่างขอบเขตงาน', note: SAMPLE_NOTE, image: '' },
    { id: 's4', sample: true, title: 'ตัวอย่างโครงการ D', type: 'other', typeLabel: 'อื่น ๆ',
      location: 'ตัวอย่างสถานที่', year: '—', scope: 'ตัวอย่างขอบเขตงาน', note: SAMPLE_NOTE, image: '' }
  ];

  var projectState = { activeFilter: 'all', showSamples: false };

  function currentSource() {
    if (PROJECTS.length) return PROJECTS;
    return projectState.showSamples ? SAMPLE_PROJECTS : [];
  }

  function findProject(id) {
    var all = PROJECTS.concat(SAMPLE_PROJECTS);
    for (var i = 0; i < all.length; i++) if (String(all[i].id) === String(id)) return all[i];
    return null;
  }

  function buildCard(p) {
    var card = el('article', 'card project-card');
    var media = el('div', 'project-media');
    media.setAttribute('aria-hidden', 'true');
    media.appendChild(makeIcon('i-image'));
    card.appendChild(media);

    var body = el('div', 'project-body');
    if (p.sample) body.appendChild(el('span', 'badge badge-sample', 'ข้อมูลตัวอย่าง'));
    body.appendChild(el('h3', 'project-title', p.title || ''));

    var meta = el('p', 'project-meta');
    meta.appendChild(makeIcon('i-building'));
    meta.appendChild(doc.createTextNode('ประเภท: ' + (p.typeLabel || '—')));
    body.appendChild(meta);

    if (p.location) {
      var loc = el('p', 'project-meta');
      loc.appendChild(makeIcon('i-pin'));
      loc.appendChild(doc.createTextNode(p.location));
      body.appendChild(loc);
    }

    var btn = el('button', 'btn btn-soft btn-view btn-sm');
    btn.type = 'button';
    btn.setAttribute('data-project-id', String(p.id));
    btn.appendChild(makeIcon('i-eye'));
    btn.appendChild(el('span', 'btn-label', 'ดูรายละเอียด'));
    btn.setAttribute('aria-label', 'ดูรายละเอียด ' + (p.title || ''));
    body.appendChild(btn);

    card.appendChild(body);
    return card;
  }

  function setLabel(button, text) {
    if (!button) return;
    var span = $('.btn-label', button);
    if (!span) {
      // Remove bare text nodes, keep icon elements
      Array.prototype.slice.call(button.childNodes).forEach(function (n) {
        if (n.nodeType === 3) button.removeChild(n);
      });
      span = el('span', 'btn-label');
      button.appendChild(span);
    }
    span.textContent = text;
  }

  function renderProjects() {
    var grid = $('#project-grid');
    var empty = $('#projects-empty');
    var nomatch = $('#projects-nomatch');
    var status = $('#project-status');
    var clearBtn = $('#filter-clear');
    var samplesBtn = $('#toggle-samples');
    var f = projectState.activeFilter;

    $all('.tab[data-filter]').forEach(function (tab) {
      tab.setAttribute('aria-pressed', tab.getAttribute('data-filter') === f ? 'true' : 'false');
    });
    if (clearBtn) clearBtn.disabled = (f === 'all');
    if (samplesBtn) {
      samplesBtn.setAttribute('aria-pressed', projectState.showSamples ? 'true' : 'false');
      setLabel(samplesBtn, projectState.showSamples ? 'ซ่อนข้อมูลตัวอย่าง' : 'แสดงข้อมูลตัวอย่าง');
      // Sample toggle is irrelevant once real data exists
      samplesBtn.hidden = PROJECTS.length > 0;
    }

    var source = currentSource();
    var items = source.filter(function (p) { return f === 'all' || p.type === f; });

    if (grid) {
      while (grid.firstChild) grid.removeChild(grid.firstChild);
      items.forEach(function (p) { grid.appendChild(buildCard(p)); });
    }

    var statusText;
    if (!source.length) {
      if (grid) grid.hidden = true;
      if (empty) empty.hidden = false;
      if (nomatch) nomatch.hidden = true;
      statusText = 'ยังไม่มีข้อมูลผลงาน';
    } else if (!items.length) {
      if (grid) grid.hidden = true;
      if (empty) empty.hidden = true;
      if (nomatch) nomatch.hidden = false;
      statusText = 'ไม่พบผลงานในหมวดนี้';
    } else {
      if (grid) grid.hidden = false;
      if (empty) empty.hidden = true;
      if (nomatch) nomatch.hidden = true;
      statusText = 'แสดง ' + items.length + ' รายการ' + (source === SAMPLE_PROJECTS ? ' (ข้อมูลตัวอย่าง)' : '');
    }
    if (status) status.textContent = statusText;
  }

  function initProjects() {
    $all('.tab[data-filter]').forEach(function (tab) {
      tab.addEventListener('click', function () {
        projectState.activeFilter = tab.getAttribute('data-filter') || 'all';
        renderProjects();
      });
    });

    function clearFilter() {
      projectState.activeFilter = 'all';
      renderProjects();
      var allTab = $('.tab[data-filter="all"]');
      if (allTab) allTab.focus();
    }
    var clearBtn = $('#filter-clear');
    if (clearBtn) clearBtn.addEventListener('click', clearFilter);
    doc.addEventListener('click', function (e) {
      var t = e.target && e.target.closest ? e.target.closest('[data-action="clear-filter"]') : null;
      if (t && t !== clearBtn) clearFilter();
    });

    var samplesBtn = $('#toggle-samples');
    if (samplesBtn) {
      samplesBtn.addEventListener('click', function () {
        projectState.showSamples = !projectState.showSamples;
        renderProjects();
      });
    }

    renderProjects();
  }

  /* ---------------------------------------------------------------- 4. Modal */
  function initModal() {
    var dialog = $('#project-dialog');
    if (!dialog) return;
    var opener = null;
    var nativeModal = typeof dialog.showModal === 'function';

    function isOpen() { return dialog.open || dialog.hasAttribute('open'); }

    function fill(p) {
      var values = {
        title: p.title, type: p.typeLabel || p.type, location: p.location,
        year: p.year, scope: p.scope, note: p.note
      };
      $all('[data-field]', dialog).forEach(function (node) {
        var key = node.getAttribute('data-field');
        if (Object.prototype.hasOwnProperty.call(values, key)) {
          node.textContent = values[key] != null && values[key] !== '' ? String(values[key]) : '—';
        }
      });
      $all('.badge-sample', dialog).forEach(function (b) { b.hidden = !p.sample; });
    }

    function restoreFocus() {
      var o = opener;
      opener = null;
      if (o && doc.contains(o) && typeof o.focus === 'function') o.focus();
    }

    function openDialog(p, btn) {
      fill(p);
      opener = btn || null;
      if (nativeModal) {
        if (!dialog.open) dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
      }
      var closeBtn = $('.modal-close', dialog) || $('[data-close]', dialog);
      if (closeBtn) closeBtn.focus();
    }

    function closeDialog() {
      if (!isOpen()) return;
      if (nativeModal && dialog.open) {
        dialog.close(); // 'close' event restores focus
      } else {
        dialog.removeAttribute('open');
        restoreFocus();
      }
    }

    doc.addEventListener('click', function (e) {
      var t = e.target && e.target.closest ? e.target.closest('[data-project-id]') : null;
      if (!t) return;
      var p = findProject(t.getAttribute('data-project-id'));
      if (p) openDialog(p, t);
    });

    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) { closeDialog(); return; }
      var c = e.target && e.target.closest ? e.target.closest('[data-close]') : null;
      if (c && dialog.contains(c)) closeDialog();
    });

    // Native Escape fires 'cancel' then 'close'
    dialog.addEventListener('close', restoreFocus);

    if (!nativeModal) {
      doc.addEventListener('keydown', function (e) {
        if ((e.key === 'Escape' || e.key === 'Esc') && isOpen()) closeDialog();
      });
    }
  }

  /* ---------------------------------------------------------------- 5. Contact form */
  var DEMO_RESULT = 'การสาธิตเท่านั้น: ข้อมูลผ่านการตรวจรูปแบบแล้ว แต่ระบบยังไม่ส่งข้อมูลออกไป กรุณาติดต่อทางโทรศัพท์ที่ระบุไว้';

  function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }
  function isThaiPhone(v) {
    if (!/^[+\d\s-]+$/.test(v)) return false;
    var digits = v.replace(/\D/g, '');
    return digits.length >= 9 && digits.length <= 12;
  }

  var VALIDATORS = {
    'cf-name': function (v) {
      v = v.trim();
      if (!v) return 'กรุณากรอกชื่อ';
      if (v.length < 2) return 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร';
      return '';
    },
    'cf-contact': function (v) {
      v = v.trim();
      if (!v) return 'กรุณากรอกเบอร์โทรศัพท์หรืออีเมล';
      if (!isThaiPhone(v) && !isEmail(v)) return 'รูปแบบไม่ถูกต้อง กรุณากรอกเบอร์โทรศัพท์ (9–12 หลัก) หรืออีเมล';
      return '';
    },
    'cf-type': function (v) {
      return v ? '' : 'กรุณาเลือกประเภทงาน';
    },
    'cf-detail': function (v) {
      v = v.trim();
      if (!v) return 'กรุณากรอกรายละเอียดงาน';
      if (v.length < 10) return 'รายละเอียดต้องมีอย่างน้อย 10 ตัวอักษร';
      return '';
    }
  };
  var FIELD_ORDER = ['cf-name', 'cf-contact', 'cf-type', 'cf-detail'];

  function initForm() {
    var form = $('#contact-form');
    if (!form) return;
    var result = $('#form-result');
    var attempted = false;

    function field(id) { return doc.getElementById(id); }

    function showError(id, msg) {
      var input = field(id);
      var err = doc.getElementById(id + '-error');
      if (input) {
        if (msg) input.setAttribute('aria-invalid', 'true');
        else input.removeAttribute('aria-invalid');
      }
      if (err) {
        err.textContent = msg;
        err.hidden = !msg;
      }
    }

    function validateField(id) {
      var input = field(id);
      if (!input) return true;
      var msg = VALIDATORS[id](String(input.value || ''));
      showError(id, msg);
      return !msg;
    }

    function hideResult() {
      if (!result) return;
      result.hidden = true;
      result.textContent = '';
      result.classList.remove('is-demo');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      attempted = true;
      var firstInvalid = null;
      FIELD_ORDER.forEach(function (id) {
        if (!validateField(id) && !firstInvalid) firstInvalid = field(id);
      });
      if (firstInvalid) {
        hideResult();
        focusAndReveal(firstInvalid);
        return;
      }
      // Valid: demo only. Nothing is stored or transmitted.
      if (result) {
        result.textContent = DEMO_RESULT;
        result.classList.add('is-demo');
        result.hidden = false;
      }
    });

    function onEdit(e) {
      var t = e.target;
      if (!t || !t.id || !Object.prototype.hasOwnProperty.call(VALIDATORS, t.id)) return;
      if (result && !result.hidden) hideResult();
      if (attempted) validateField(t.id);
    }
    form.addEventListener('input', onEdit);
    form.addEventListener('change', onEdit);

    form.addEventListener('reset', function () {
      attempted = false;
      FIELD_ORDER.forEach(function (id) { showError(id, ''); });
      hideResult();
    });
  }

  /* ---------------------------------------------------------------- 6. Year */
  function initYear() {
    var y = $('#year');
    if (y) y.textContent = String(new Date().getFullYear());
  }

  /* ---------------------------------------------------------------- 7. Reduced-motion aware in-page links */
  function initAnchorScroll() {
    // Only intervene when the user prefers reduced motion; CSS scroll-behavior otherwise applies.
    doc.addEventListener('click', function (e) {
      if (!prefersReducedMotion()) return;
      var a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
      if (!a) return;
      var id = a.getAttribute('href').slice(1);
      if (!id) return;
      var target = doc.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'auto', block: 'start' });
      if (history.replaceState) history.replaceState(null, '', '#' + id);
      if (!target.hasAttribute('tabindex') && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(target.tagName)) {
        target.setAttribute('tabindex', '-1');
      }
      try { target.focus({ preventScroll: true }); } catch (err) { target.focus(); }
    });
  }

  /* ---------------------------------------------------------------- 8. Motion effects (skipped when prefers-reduced-motion) */
  function initScrollFx() {
    var bar = $('.scroll-progress');
    var hero = $('.hero');
    var ticking = false;
    function update() {
      ticking = false;
      var y = window.scrollY || window.pageYOffset || 0;
      var max = (doc.documentElement.scrollHeight - window.innerHeight) || 1;
      if (bar) bar.style.setProperty('--progress', Math.min(1, Math.max(0, y / max)).toFixed(4));
      // ภาพพื้นหลัง hero เลื่อนช้ากว่าเนื้อหาเล็กน้อย (parallax)
      if (hero && y < hero.offsetHeight) hero.style.setProperty('--hero-shift', (y * 0.18).toFixed(1) + 'px');
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; (window.requestAnimationFrame || setTimeout)(update); }
    }, { passive: true });
    update();
  }

  function initReveal() {
    if (!('IntersectionObserver' in window)) return;
    doc.documentElement.classList.add('js');
    var targets = $all('.section-head > *, .fact-card, .about-main, .placeholder-card, .service-card, .project-toolbar, .empty-state, .process-step, .notice, .contact-info, .contact-form');
    targets.forEach(function (node) {
      // หน่วงเวลาตามลำดับในกลุ่มเดียวกัน ให้ไล่ขึ้นทีละใบ
      var idx = 0, sib = node;
      while ((sib = sib.previousElementSibling)) idx++;
      node.style.setProperty('--d', Math.min(idx, 5) * 90 + 'ms');
      node.classList.add('reveal');
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var node = entry.target;
        io.unobserve(node);
        node.classList.add('is-in');
        // เล่นจบแล้วถอดคลาสออก เพื่อไม่ให้ transition หน่วงของ reveal ไปกวน hover
        setTimeout(function () { node.classList.remove('reveal', 'is-in'); node.style.removeProperty('--d'); }, 1100 + (parseInt(node.style.getPropertyValue('--d'), 10) || 0));
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    targets.forEach(function (n) { io.observe(n); });
  }

  function initSpotlight() {
    var cards = $all('.fact-card, .service-card:not(.is-placeholder), .process-step, .about-main, .contact-info');
    cards.forEach(function (c) {
      c.classList.add('fx-spot');
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect();
        c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        c.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  // ฝุ่นทองลอยช้า ๆ ในฉาก hero (canvas) — หยุดเมื่อพ้นจอหรือสลับแท็บ
  function initParticles() {
    var canvas = $('.hero-particles');
    var hero = $('.hero');
    if (!canvas || !hero || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var w = 0, h = 0, dpr = 1, parts = [], raf = 0, running = false, last = 0;

    function make(randomY) {
      return {
        x: Math.random() * w,
        y: randomY ? Math.random() * h : h + 10,
        r: 0.6 + Math.random() * 1.8,
        vy: 6 + Math.random() * 16,          // px ต่อวินาที (ลอยขึ้น)
        sway: 8 + Math.random() * 18,
        ph: Math.random() * Math.PI * 2,
        tw: 0.6 + Math.random() * 1.4,
        a: 0.25 + Math.random() * 0.55
      };
    }
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = hero.clientWidth; h = hero.clientHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.max(14, Math.min(56, Math.round(w / 26)));
      parts = [];
      for (var i = 0; i < n; i++) parts.push(make(true));
    }
    function frame(t) {
      if (!running) return;
      var dt = Math.min(0.05, (t - last) / 1000 || 0.016); last = t;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.y -= p.vy * dt;
        var x = p.x + Math.sin(t / 1000 * 0.6 + p.ph) * p.sway;
        if (p.y < -10) { parts[i] = make(false); continue; }
        var tw = 0.55 + 0.45 * Math.sin(t / 1000 * p.tw + p.ph);
        var fade = Math.min(1, Math.max(0, (h - p.y) / 80)) * Math.min(1, Math.max(0, p.y / 80)); // จางที่ขอบบน-ล่าง
        ctx.beginPath();
        ctx.fillStyle = 'rgba(230, 200, 136,' + (p.a * tw * fade).toFixed(3) + ')';
        ctx.arc(x, p.y, p.r, 0, 6.2832);
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }
    function start() { if (running) return; running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
    function stop() { running = false; cancelAnimationFrame(raf); }

    resize();
    var rt = 0;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(resize, 150); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { if (en[0].isIntersecting && !doc.hidden) start(); else stop(); }).observe(hero);
    } else start();
    doc.addEventListener('visibilitychange', function () { if (doc.hidden) stop(); else start(); });
  }

  // เมาส์ขยับ ชั้นแบบอาคาร/พื้นหลังเลื่อนต่างกันเล็กน้อย (เฉพาะเมาส์จริง)
  function initArchParallax() {
    var hero = $('.hero');
    var arch = $('.hero-arch');
    var fine = mq('(hover: hover) and (pointer: fine)');
    if (!hero || !arch || !fine || !fine.matches) return;
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      arch.style.setProperty('--px', (((e.clientX - r.left) / r.width) - 0.5).toFixed(3));
      arch.style.setProperty('--py', (((e.clientY - r.top) / r.height) - 0.5).toFixed(3));
    });
    hero.addEventListener('pointerleave', function () {
      arch.style.setProperty('--px', '0');
      arch.style.setProperty('--py', '0');
    });
  }

  function initMotion() {
    if (prefersReducedMotion()) return;
    [initScrollFx, initReveal, initSpotlight, initParticles, initArchParallax].forEach(function (fn) {
      try { fn(); } catch (err) { /* ลูกเล่นพังต้องไม่กระทบเว็บ */ }
    });
  }

  function init() {
    var steps = [initNav, initHeader, initProjects, initModal, initForm, initYear, initAnchorScroll, initMotion];
    steps.forEach(function (fn) {
      try { fn(); } catch (err) { /* keep other features working */ }
    });
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
  else init();
})();
