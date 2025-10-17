// =========================
// FILE: script.js
// Efek interaktif & animasi: preloader, particles, reveal, counters, filter, modal, smooth scroll
// =========================

// Helper: qs
const $ = (s, sc = document) => sc.querySelector(s);
const $$ = (s, sc = document) => [...sc.querySelectorAll(s)];

// Pastikan tema putih dinonaktifkan seluruhnya
document.documentElement.classList.remove('light');
try {
  localStorage.removeItem('theme');
} catch (err) {
  /* ignore */
}

// Preloader progress simulasi
const preloader = $('#preloader');
const loaderPercent = $('#loaderPercent');
let p = 0;
const fakeLoad = setInterval(() => {
  p += 3;
  if (p > 100) p = 100;
  loaderPercent.textContent = p + "%";
  if (p === 100) {
    clearInterval(fakeLoad);
    setTimeout(() => {
      preloader.style.opacity = '0';
      preloader.style.pointerEvents = 'none';
      setTimeout(() => preloader.remove(), 400);
    }, 200);
  }
}, 40);

// Smooth scroll untuk anchor dalam halaman
$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Navigasi aktif berdasarkan halaman
const navLinks = $$('#navLinks a');
const navMenu = $('#navLinks');
const navToggleBtn = $('.nav-toggle');
const currentPage = document.body.dataset.page;
if (currentPage) {
  navLinks.forEach(link => link.classList.toggle('active', link.dataset.page === currentPage));
}

// Tombol kembali ke atas
const toTop = $('#toTop');
const handleScroll = () => {
  if (toTop) {
    toTop.classList.toggle('show', window.scrollY > 600);
  }
};
window.addEventListener('scroll', handleScroll);
handleScroll();
toTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// Mobile nav toggle
const closeNav = () => {
  navMenu?.classList.remove('show');
  if (navToggleBtn) {
    navToggleBtn.classList.remove('is-open');
    navToggleBtn.setAttribute('aria-expanded', 'false');
  }
};

navToggleBtn?.addEventListener('click', () => {
  if (!navMenu) return;
  const isOpen = navMenu.classList.toggle('show');
  navToggleBtn.classList.toggle('is-open', isOpen);
  navToggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
});

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
      closeNav();
    }
  });
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    closeNav();
  }
});
closeNav();

const soundToggle = $('#soundToggle');
const bgAudio = $('#bgAudio');
if (soundToggle && bgAudio) {
  const SOUND_PREF_KEY = 'site:sound';
  let isPlaying = false;

  bgAudio.volume = 0.6;

  const getPref = () => {
    try {
      return localStorage.getItem(SOUND_PREF_KEY);
    } catch (err) {
      return null;
    }
  };
  const setPref = (value) => {
    try {
      localStorage.setItem(SOUND_PREF_KEY, value);
    } catch (err) {
      /* ignore */
    }
  };
  const getTranslation = (key) => {
    const lang = window.currentLang || document.documentElement.lang || 'id';
    if (window.TRANSLATIONS?.[lang]?.[key]) return window.TRANSLATIONS[lang][key];
    if (window.TRANSLATIONS?.id?.[key]) return window.TRANSLATIONS.id[key];
    return null;
  };
  const updateSoundUI = () => {
    soundToggle.classList.toggle('is-playing', isPlaying);
    soundToggle.innerHTML = isPlaying
      ? '<i class="fa-solid fa-volume-high" aria-hidden="true"></i>'
      : '<i class="fa-solid fa-volume-xmark" aria-hidden="true"></i>';
    const labelKey = isPlaying ? 'sound.mute' : 'sound.play';
    const translatedLabel = getTranslation(labelKey);
    if (translatedLabel) {
      soundToggle.setAttribute('aria-label', translatedLabel);
    }
  };
  const enableSound = async () => {
    try {
      await bgAudio.play();
      isPlaying = true;
      setPref('on');
    } catch (err) {
      isPlaying = false;
    }
    updateSoundUI();
  };
  const disableSound = (persist = true) => {
    bgAudio.pause();
    isPlaying = false;
    if (persist) {
      setPref('off');
    }
    updateSoundUI();
  };

  soundToggle.addEventListener('click', () => {
    if (isPlaying) {
      disableSound();
    } else {
      enableSound();
    }
  });

  const storedPref = getPref();
  if (storedPref === 'on') {
    enableSound();
  } else {
    disableSound(false);
  }

  if (storedPref !== 'off') {
    const tryEnableAfterInteraction = () => {
      enableSound();
      window.removeEventListener('pointerdown', tryEnableAfterInteraction);
      window.removeEventListener('keydown', tryEnableAfterInteraction);
    };
    window.addEventListener('pointerdown', tryEnableAfterInteraction);
    window.addEventListener('keydown', tryEnableAfterInteraction);
  }

  window.addEventListener('app:languagechange', updateSoundUI);
  updateSoundUI();
}

// Typewriter effect
(function typewriter() {
  const el = $('.typewriter');
  if (!el) return;
  const phrases = [
    'Berpengalaman di Manufacturing, Logistics & Export-Import',
    'Fokus pada Business, System, & Data Analysis',
    'Siap belajar cepat & beradaptasi'
  ];
  let i = 0, t = 0, dir = 1;
  function loop() {
    const txt = phrases[i].slice(0, t);
    el.textContent = txt;
    t += dir;
    if (t > phrases[i].length + 12) { dir = -1; }
    if (t < 0) { dir = 1; i = (i + 1) % phrases.length; }
    setTimeout(loop, dir > 0 ? 40 : 18);
  }
  loop();
})();

// Particles background (canvas)
(function particles() {
  const c = document.getElementById('bg-particles');
  const ctx = c.getContext('2d');
  let w, h, pxRatio = window.devicePixelRatio || 1; const DOTS = 80; const dots = [];
  function resize() {
    w = window.innerWidth; h = window.innerHeight;
    c.width = w * pxRatio; c.height = h * pxRatio;
    ctx.setTransform(pxRatio, 0, 0, pxRatio, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);
  for (let i = 0; i < DOTS; i++) {
    dots.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .6, vy: (Math.random() - .5) * .6 });
  }
  function step() {
    ctx.clearRect(0, 0, w, h);
    for (const d of dots) {
      d.x += d.vx; d.y += d.vy;
      if (d.x < 0 || d.x > w) d.vx *= -1;
      if (d.y < 0 || d.y > h) d.vy *= -1;
    }
    for (const d of dots) {
      ctx.beginPath();
      ctx.arc(d.x, d.y, 1.6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(173,216,255,.7)';
      ctx.fill();
    }
    for (let i = 0; i < dots.length; i++) for (let j = i + 1; j < dots.length; j++) {
      const a = dots[i], b = dots[j]; const dx = a.x - b.x, dy = a.y - b.y, dist = Math.hypot(dx, dy);
      if (dist < 130) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = 'rgba(140,180,255,' + (1 - dist / 130) * .35 + ')';
        ctx.stroke();
      }
    }
    requestAnimationFrame(step);
  }
  step();
})();

// Reveal on scroll (IntersectionObserver)
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('show'); io.unobserve(e.target); }
  });
}, { threshold: .12 });
$$('.reveal, .reveal-up').forEach(el => io.observe(el));

// Bars animation on view
const barsIO = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      $$('span', e.target).forEach(s => s.style.width = s.style.getPropertyValue('--w'));
      barsIO.unobserve(e.target);
    }
  });
}, { threshold: .5 });
$$('.bar').forEach(b => barsIO.observe(b));

// Stats counters
const cntIO = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const el = e.target; const target = +el.dataset.target; let n = 0;
      const step = Math.max(1, Math.round(target / 30));
      const id = setInterval(() => {
        n += step; if (n >= target) { n = target; clearInterval(id); }
        el.textContent = n;
      }, 40);
      cntIO.unobserve(el);
    }
  });
}, { threshold: .6 });
$$('.count').forEach(c => cntIO.observe(c));

// Tilt effect (parallax tilt)
$$('.tilt').forEach(card => {
  let rAF;
  card.addEventListener('mousemove', e => {
    const b = card.getBoundingClientRect();
    const x = (e.clientX - b.left) / b.width * 2 - 1;
    const y = (e.clientY - b.top) / b.height * 2 - 1;
    cancelAnimationFrame(rAF);
    rAF = requestAnimationFrame(() => {
      card.style.transform = `perspective(700px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg)`;
    });
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(700px) rotateX(0) rotateY(0)';
  });
});

// Project filter
const filterButtons = $$('.pill');
if (filterButtons.length) {
  filterButtons.forEach(btn => btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.filter;
    $$('.project-card').forEach(card => {
      card.style.display = (cat === 'all' || card.dataset.cat === cat) ? 'flex' : 'none';
    });
  }));
}

// Modal
const modalTriggers = $$('.open-modal');
if (modalTriggers.length) {
  modalTriggers.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    const id = btn.dataset.modal;
    $('#' + id)?.classList.add('show');
  }));
  $$('.modal').forEach(m => {
    $('.modal-close', m)?.addEventListener('click', () => m.classList.remove('show'));
    m.addEventListener('click', e => { if (e.target === m) m.classList.remove('show'); });
  });
}

// Contact form (mailto)
const contactForm = $('#contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const name = fd.get('name'); const email = fd.get('email');
    const subject = fd.get('subject'); const message = fd.get('message');
    const to = 'youremail@gmail.com';
    const body = `Halo, saya ${name} (${email}).%0D%0A%0D%0A${message}`;
    const link = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${body}`;
    window.location.href = link;
    $('.form-status').textContent = 'Membuka aplikasi email...';
  });
}


const TRANSLATIONS = {
  id: {
    'preloader.loading': 'Memuat <span id="loaderPercent">0%</span>',
    'nav.toggle': 'Buka navigasi',
    'lang.toggle': 'Pilih bahasa',
    'sound.play': 'Nyalakan suara',
    'sound.mute': 'Matikan suara',
    'nav.home': 'Beranda',
    'nav.about': 'Tentang',
    'nav.skills': 'Keahlian',
    'nav.experience': 'Pengalaman',
    'nav.projects': 'Proyek',
    'nav.certifications': 'Sertifikasi',
    'nav.contact': 'Kontak',
    'hero.eyebrow': 'Business & System Analyst',
    'hero.tagline': 'Memetakan proses, merancang sistem, dan memutuskan dengan data.',
    'hero.socials': 'Kontak utama',
    'hero.scroll': 'Menuju halaman Tentang',
    'contact.title': 'Hubungi Saya',
    'contact.subtitle':
      'Isi formulir berikut atau kirim email langsung ke <a href="mailto:gideonhatorangan.09@gmail.com" class="contact-highlight-email">gideonhatorangan.09@gmail.com</a>.',
    'contact.form.nameLabel': 'Nama',
    'contact.form.namePlaceholder': 'Masukkan nama Anda',
    'contact.form.emailLabel': 'Email',
    'contact.form.emailPlaceholder': 'nama@email.com',
    'contact.form.subjectLabel': 'Subjek',
    'contact.form.subjectPlaceholder': 'Topik pesan',
    'contact.form.messageLabel': 'Pesan',
    'contact.form.messagePlaceholder': 'Tuliskan pesan Anda',
    'contact.form.submit': 'Kirim',
    'contact.form.sending': 'Mengirim...',
    'contact.form.status.initError': 'EmailJS gagal diinisialisasi. Muat ulang halaman.',
    'contact.form.status.notReady': 'EmailJS belum siap. Silakan muat ulang halaman.',
    'contact.form.status.validation': 'Lengkapi semua kolom dengan benar sebelum mengirim.',
    'contact.form.status.sending': 'Mengirim pesan...',
    'contact.form.status.success': 'Terima kasih! Pesan berhasil dikirim.',
    'contact.form.status.error': 'Pengiriman gagal. Coba lagi beberapa saat lagi.',
    'contact.form.toast.close': 'Tutup',
    'contact.form.toast.closeLabel': 'Tutup notifikasi',
    'about.title': 'Tentang Saya',
    'about.bio':
      'Saya lulusan Sistem Informasi Universitas Esa Unggul dengan fokus Business & System Analysis. Saya menerjemahkan kebutuhan bisnis menjadi BRD/Use Case, memetakan proses AS-IS ke TO-BE, dan membangun dashboard KPI untuk pemakaian harian. Pengalaman di manufaktur, logistik, dan ekspor–impor membantu saya menjembatani operasi dan engineering agar solusi tetap praktis. Di PT Astra Honda Motor (Machining), saya membangun prototipe web untuk monitoring mesin berbasis IoT. Tools: MySQL/SQL, Python (pandas), Excel/Sheets, Power BI dasar.',
    'about.education.title': 'Education',
    'about.education.item1':
      '<strong>Universitas Esa Unggul</strong> &mdash; S.Kom (Sistem Informasi) (Bekasi)<br /><span>Fokus: Business &amp; System Analysis, Database &amp; SQL, Data Warehouse, Power BI, Project Management.</span><br /><span>Skripsi: IoT-Based Machine Monitoring System with Integrated Web Dashboard (prototipe sensor &rarr; dashboard web untuk monitoring mesin).</span><br /><span>2020&ndash;2025 &mdash; IPK: 3,11/4,00</span>',
    'about.cv.title': 'CV',
    'about.cv.description': 'Unduh CV terbaru untuk melihat rangkuman pengalaman, proyek, dan kompetensi teknis.',
    'about.cv.button': 'Download CV',
    'skills.title': 'Keahlian Utama',
    'skills.subtitle': 'Memadukan analisis proses, rekayasa kebutuhan, dan analitik data untuk keputusan yang cepat dan terukur.',
    'skills.block1.title': 'Analytical &amp; Business',
    'skills.block1.skill1.title': 'Business Process Modelling',
    'skills.block1.skill1.desc': 'Memetakan alur end-to-end (AS-IS -&gt; TO-BE), mengidentifikasi bottleneck/waste, dan menyusun perbaikan yang realistis.',
    'skills.block1.skill2.title': 'Requirement Engineering',
    'skills.block1.skill2.desc': 'Menggali kebutuhan, menulis user story/BRD/SRS yang jelas, menyepakati acceptance criteria, dan menutup celah komunikasi bisnis-teknis.',
    'skills.block1.skill3.title': 'Stakeholder Alignment',
    'skills.block1.skill3.desc': 'Menyelaraskan ekspektasi lintas fungsi, memfasilitasi workshop, dan menjaga keputusan berbasis data &amp; prioritas bisnis.',
    'skills.block2.title': 'Data &amp; Technical',
    'skills.block2.skill1.title': 'SQL &amp; Data Warehouse',
    'skills.block2.skill1.desc': 'Query join/agg dasar-menengah, validasi kualitas data, dan menyiapkan dataset siap dashboard.',
    'skills.block2.skill2.title': 'Power BI &amp; Looker Studio',
    'skills.block2.skill2.desc': 'Membangun model sederhana, KPI operasional, drill-down &amp; filter interaktif, serta merilis dashboard yang hidup.',
    'skills.block2.skill3.title': 'Automation (AppScript, RPA)',
    'skills.block2.skill3.desc': 'Otomasi rekap &amp; notifikasi, validasi input, dan integrasi ringan (email/sheet/form) untuk memangkas kerja manual.',
    'skills.tools.title': 'Alat yang Saya Kuasai',
    'skills.tools.summary': 'Tableau | Python | Figma | SAP | Jira',
    'skills.tools.plus': 'Plus: Excel/Google Sheets, BPMN, Git/GitHub, REST dasar.',
    'experience.work.title': 'Pengalaman Kerja',
    'experience.work.items.1.period': 'Dec 2024 - Mar 2025 | PT Astra Honda Motor - Cikarang, Jawa Barat',
    'experience.work.items.1.role': 'Machining Production Intern',
    'experience.work.items.1.points.1': 'Kelola &amp; analisis data produksi machining.',
    'experience.work.items.1.points.2': 'IT support untuk sistem informasi &amp; peralatan produksi.',
    'experience.work.items.1.points.3': 'Buat laporan performa mesin &amp; dashboard monitoring.',
    'experience.work.items.1.points.4': 'Kolaborasi produksi-maintenance untuk troubleshooting.',
    'experience.work.items.1.points.5': 'Verifikasi &amp; validasi akurasi data.',
    'experience.work.items.1.points.6': 'Skripsi: <em>IoT-Based Machine Monitoring + Web Dashboard</em>.',
    'experience.work.items.2.period': 'Nov 2024 | PT Astra Honda Motor - Cikarang, Jawa Barat',
    'experience.work.items.2.role': 'Export-Import Process Intern',
    'experience.work.items.2.points.1': 'Pelajari alur dokumen ekspor-impor hingga customs.',
    'experience.work.items.2.points.2': 'Pahami sistem informasi ekspor-impor.',
    'experience.work.items.2.points.3': 'Observasi koordinasi logistik, gudang, dan customs.',
    'experience.work.items.3.period': 'May 2023 - Aug 2023 | Minum Yuk Kaka - Bekasi, Jawa Barat',
    'experience.work.items.3.role': 'E-commerce Staff',
    'experience.work.items.3.points.1': 'Proses pesanan online harian dengan akurasi sekitar 98%.',
    'experience.work.items.3.points.2': 'Catat penjualan &amp; persediaan untuk dukungan operasional.',
    'experience.work.items.3.points.3': 'Tangani layanan pelanggan &amp; dukung promosi online.',
    'experience.work.items.4.period': 'Oct 2020 - Nov 2022 | Mitra Alkes - Bekasi, Jawa Barat',
    'experience.work.items.4.role': 'Warehouse &amp; Logistics Staff',
    'experience.work.items.4.points.1': 'Terima &amp; periksa barang sekaligus mencatat inbound/outbound.',
    'experience.work.items.4.points.2': 'Tata penyimpanan dengan FIFO/FEFO.',
    'experience.work.items.4.points.3': 'Lakukan stock opname berkala &amp; koordinasi pengiriman.',
    'experience.org.title': 'Pengalaman Organisasi',
    'experience.org.items.1.period': 'Nov 2020 - Feb 2022 | Himpunan Mahasiswa Sistem Informasi - Bekasi, Indonesia',
    'experience.org.items.1.role': 'Anggota',
    'experience.org.items.1.points.1': 'Membantu perencanaan dan pelaksanaan seminar serta workshop IT.',
    'experience.org.items.1.points.2': 'Mengelola data peserta dan umpan balik untuk evaluasi pasca-acara.',
    'experience.org.items.1.points.3': 'Berkoordinasi dengan dosen, pembicara tamu, dan panitia lintas divisi.',
    'projects.title': 'Proyek',
    'projects.cards.1.title': 'Portal Login',
    'projects.cards.1.desc': 'Halaman login dengan branding PT XYZ untuk autentikasi pengguna monitoring.',
    'projects.cards.2.title': 'Dashboard Monitoring',
    'projects.cards.2.desc': 'Tampilan ringkasan OEE, output, downtime, dan utilitas dengan aksi refresh/reset shift.',
    'projects.cards.3.title': 'Inventori Mesin',
    'projects.cards.3.desc': 'Inventori realtime untuk status mesin milling dan lathe, lengkap dengan filter dan kontrol data.',
    'projects.cards.4.title': 'Detail Mesin',
    'projects.cards.4.desc': 'Modal detail dengan metrik cycle time, temperatur, availability, dan jadwal maintenance.',
    'projects.cards.5.title': 'Laporan &amp; Grafik',
    'projects.cards.5.desc': 'Grafik OEE per jam beserta log masalah dengan opsi ekspor CSV/PDF untuk analisis harian.',
    'projects.cards.6.title': 'Panel Peringatan',
    'projects.cards.6.desc': 'Daftar peringatan real-time untuk downtime, kondisi kritis, dan prioritas tindak lanjut.',
    'projects.cards.demo': 'Buka Demo',
    'projects.cards.slides': 'Lihat PPTX',
    'certifications.title': 'Sertifikasi',
    'certifications.subtitle': 'Ringkas pencapaian sertifikasi dan pelatihan profesional untuk menunjukkan komitmen belajar berkelanjutan.',
    'certifications.cards.1.title': 'TOEFL Preparation Test',
    'certifications.cards.1.meta': 'PAMU Universitas Esa Unggul - Prediksi Skor 450 - Juli 2025',
    'certifications.cards.1.points.1': 'Program persiapan akademik untuk evaluasi kemampuan bahasa Inggris.',
    'certifications.cards.1.points.2': 'Meliputi struktur, listening, dan reading comprehension.',
    'certifications.cards.1.points.3': 'Sertifikat digunakan sebagai prasyarat kelulusan mata kuliah.',
    'certifications.cards.2.title': 'Online Training ESQ Mahasiswa',
    'certifications.cards.2.meta': 'ESQ Leadership Center - Universitas Esa Unggul - September 2020',
    'certifications.cards.2.points.1': 'Pelatihan karakter dan leadership berbasis Emotional &amp; Spiritual Quotient.',
    'certifications.cards.2.points.2': 'Menekankan nilai integritas, visi pribadi, dan kolaborasi tim.',
    'certifications.cards.2.points.3': 'Diterapkan dalam aktivitas organisasi kemahasiswaan dan kerja tim.',
    'footer.copy': '&copy; <span id="year"></span> Gideon Hatorangan Rajagukguk - Information Systems Graduate.',
    'footer.toTop': 'Kembali ke atas',
  },
  en: {
    'preloader.loading': 'Loading <span id="loaderPercent">0%</span>',
    'nav.toggle': 'Open navigation',
    'lang.toggle': 'Choose language',
    'sound.play': 'Play ambient sound',
    'sound.mute': 'Mute ambient sound',
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.skills': 'Skills',
    'nav.experience': 'Experience',
    'nav.projects': 'Projects',
    'nav.certifications': 'Certifications',
    'nav.contact': 'Contact',
    'hero.eyebrow': 'Business & System Analyst',
    'hero.tagline': 'Mapping processes, designing systems, and making decisions with data.',
    'hero.socials': 'Primary contacts',
    'hero.scroll': 'Go to About page',
    'contact.title': 'Get in Touch',
    'contact.subtitle':
      'Fill out the form below or email <a href="mailto:gideonhatorangan.09@gmail.com" class="contact-highlight-email">gideonhatorangan.09@gmail.com</a>.',
    'contact.form.nameLabel': 'Name',
    'contact.form.namePlaceholder': 'Enter your name',
    'contact.form.emailLabel': 'Email',
    'contact.form.emailPlaceholder': 'name@email.com',
    'contact.form.subjectLabel': 'Subject',
    'contact.form.subjectPlaceholder': 'Message topic',
    'contact.form.messageLabel': 'Message',
    'contact.form.messagePlaceholder': 'Write your message',
    'contact.form.submit': 'Send',
    'contact.form.sending': 'Sending...',
    'contact.form.status.initError': 'EmailJS failed to initialize. Please reload the page.',
    'contact.form.status.notReady': 'EmailJS is not ready. Please reload and try again.',
    'contact.form.status.validation': 'Complete all fields correctly before submitting.',
    'contact.form.status.sending': 'Sending your message...',
    'contact.form.status.success': 'Thank you! Your message has been sent.',
    'contact.form.status.error': 'Sending failed. Please try again shortly.',
    'contact.form.toast.close': 'Close',
    'contact.form.toast.closeLabel': 'Close notification',
    'about.title': 'About Me',
    'about.bio':
      'I\'m an Information Systems graduate from Universitas Esa Unggul focused on Business & System Analysis. I turn business needs into BRDs/Use Cases, map AS-IS to TO-BE processes, and build KPI dashboards for daily use. I\'ve worked across manufacturing, logistics, and export–import, so I bridge operations and engineering to keep solutions practical. At PT Astra Honda Motor (Machining), I built a web prototype for IoT-based machine monitoring. Tools: MySQL/SQL, Python (pandas), Excel/Sheets, basic Power BI.',
    'about.education.title': 'Education',
    'about.education.item1':
      '<strong>Universitas Esa Unggul</strong> &mdash; S.Kom (Information Systems) (Bekasi)<br /><span>Focus: Business &amp; System Analysis, Database &amp; SQL, Data Warehouse, Power BI, Project Management.</span><br /><span>Thesis: IoT-Based Machine Monitoring System with Integrated Web Dashboard (sensor prototype &rarr; monitoring dashboard).</span><br /><span>2020&ndash;2025 &mdash; GPA: 3.11/4.00</span>',
    'about.cv.title': 'Resume',
    'about.cv.description': 'Download the latest resume to see experience, projects, and technical competencies.',
    'about.cv.button': 'Download CV',
    'skills.title': 'Core Skills',
    'skills.subtitle': 'Combining process analysis, requirements engineering, and data analytics for faster, measurable decisions.',
    'skills.block1.title': 'Analytical &amp; Business',
    'skills.block1.skill1.title': 'Business Process Modelling',
    'skills.block1.skill1.desc': 'Map end-to-end flows (AS-IS -&gt; TO-BE), surface bottlenecks/waste, and craft realistic improvements.',
    'skills.block1.skill2.title': 'Requirement Engineering',
    'skills.block1.skill2.desc': 'Elicit needs, write clear user stories/BRD/SRS, align acceptance criteria, and bridge business-tech communication.',
    'skills.block1.skill3.title': 'Stakeholder Alignment',
    'skills.block1.skill3.desc': 'Align cross-functional expectations, facilitate workshops, and keep decisions data-driven and business-prioritized.',
    'skills.block2.title': 'Data &amp; Technical',
    'skills.block2.skill1.title': 'SQL &amp; Data Warehouse',
    'skills.block2.skill1.desc': 'Author intermediate joins/aggregations, validate data quality, and prepare datasets ready for dashboards.',
    'skills.block2.skill2.title': 'Power BI &amp; Looker Studio',
    'skills.block2.skill2.desc': 'Build lean models, operational KPIs, drill-downs &amp; interactive filters, and ship living dashboards.',
    'skills.block2.skill3.title': 'Automation (AppScript, RPA)',
    'skills.block2.skill3.desc': 'Automate recaps &amp; notifications, validate inputs, and create light integrations to reduce manual work.',
    'skills.tools.title': 'Tools I Use',
    'skills.tools.summary': 'Tableau | Python | Figma | SAP | Jira',
    'skills.tools.plus': 'Plus: Excel/Google Sheets, BPMN, Git/GitHub, basic REST.',
    'experience.work.title': 'Work Experience',
    'experience.work.items.1.period': 'Dec 2024 - Mar 2025 | PT Astra Honda Motor - Cikarang, West Java',
    'experience.work.items.1.role': 'Machining Production Intern',
    'experience.work.items.1.points.1': 'Managed and analyzed machining production data.',
    'experience.work.items.1.points.2': 'Provided IT support for information systems and production equipment.',
    'experience.work.items.1.points.3': 'Built machine performance reports and monitoring dashboards.',
    'experience.work.items.1.points.4': 'Collaborated with production and maintenance teams for troubleshooting.',
    'experience.work.items.1.points.5': 'Verified and validated data accuracy.',
    'experience.work.items.1.points.6': 'Thesis: <em>IoT-Based Machine Monitoring + Web Dashboard</em>.',
    'experience.work.items.2.period': 'Nov 2024 | PT Astra Honda Motor - Cikarang, West Java',
    'experience.work.items.2.role': 'Export-Import Process Intern',
    'experience.work.items.2.points.1': 'Studied export-import document flow all the way to customs.',
    'experience.work.items.2.points.2': 'Learned the export-import information system.',
    'experience.work.items.2.points.3': 'Observed coordination across logistics, warehouse, and customs teams.',
    'experience.work.items.3.period': 'May 2023 - Aug 2023 | Minum Yuk Kaka - Bekasi, West Java',
    'experience.work.items.3.role': 'E-commerce Staff',
    'experience.work.items.3.points.1': 'Processed daily online orders with roughly 98% accuracy.',
    'experience.work.items.3.points.2': 'Recorded sales and inventory to support operations.',
    'experience.work.items.3.points.3': 'Handled customer service and supported online promotions.',
    'experience.work.items.4.period': 'Oct 2020 - Nov 2022 | Mitra Alkes - Bekasi, West Java',
    'experience.work.items.4.role': 'Warehouse &amp; Logistics Staff',
    'experience.work.items.4.points.1': 'Received and inspected goods while logging inbound/outbound items.',
    'experience.work.items.4.points.2': 'Organized storage using FIFO/FEFO principles.',
    'experience.work.items.4.points.3': 'Performed routine stock counts and coordinated shipments.',
    'experience.org.title': 'Organization Experience',
    'experience.org.items.1.period': 'Nov 2020 - Feb 2022 | Information Systems Student Association - Bekasi, Indonesia',
    'experience.org.items.1.role': 'Member',
    'experience.org.items.1.points.1': 'Supported planning and execution of IT seminars and workshops.',
    'experience.org.items.1.points.2': 'Managed participant data and feedback for post-event evaluation.',
    'experience.org.items.1.points.3': 'Coordinated with faculty, guest speakers, and cross-division committees.',
    'projects.title': 'Projects',
    'projects.cards.1.title': 'Login Portal',
    'projects.cards.1.desc': 'Login page with PT XYZ branding to authenticate monitoring users.',
    'projects.cards.2.title': 'Monitoring Dashboard',
    'projects.cards.2.desc': 'OEE, output, downtime, and utilization summary with refresh/reset controls.',
    'projects.cards.3.title': 'Machine Inventory',
    'projects.cards.3.desc': 'Real-time status for milling and lathe machines, complete with filters and data controls.',
    'projects.cards.4.title': 'Machine Detail',
    'projects.cards.4.desc': 'Detail modal with cycle time, temperature, availability, and maintenance schedule metrics.',
    'projects.cards.5.title': 'Reports &amp; Charts',
    'projects.cards.5.desc': 'Hourly OEE charts plus issue log with CSV/PDF export for daily analysis.',
    'projects.cards.6.title': 'Alert Panel',
    'projects.cards.6.desc': 'Real-time alerts covering downtime, critical conditions, and follow-up priorities.',
    'projects.cards.demo': 'Open Demo',
    'projects.cards.slides': 'View Slides',
    'certifications.title': 'Certifications',
    'certifications.subtitle': 'A snapshot of certifications and training that shows my commitment to continual learning.',
    'certifications.cards.1.title': 'TOEFL Preparation Test',
    'certifications.cards.1.meta': 'PAMU Universitas Esa Unggul - Predicted Score 450 - July 2025',
    'certifications.cards.1.points.1': 'Academic preparation program assessing English proficiency.',
    'certifications.cards.1.points.2': 'Covered structure, listening, and reading comprehension modules.',
    'certifications.cards.1.points.3': 'Certificate used as a course completion requirement.',
    'certifications.cards.2.title': 'ESQ Student Online Training',
    'certifications.cards.2.meta': 'ESQ Leadership Center - Universitas Esa Unggul - September 2020',
    'certifications.cards.2.points.1': 'Character and leadership training based on Emotional &amp; Spiritual Quotient.',
    'certifications.cards.2.points.2': 'Emphasized integrity, personal vision, and collaboration.',
    'certifications.cards.2.points.3': 'Applied across student organization activities and teamwork.',
    'footer.copy': '&copy; <span id="year"></span> Gideon Hatorangan Rajagukguk - Information Systems Graduate.',
    'footer.toTop': 'Back to top',
  },
};

window.TRANSLATIONS = TRANSLATIONS;

// Language toggle
const langButtons = $$('.lang-btn');
if (langButtons.length) {
  const getString = (lang, key) => {
    const dictionary = TRANSLATIONS[lang] || {};
    if (dictionary[key]) return dictionary[key];
    return TRANSLATIONS.id?.[key] || '';
  };

  const translate = (lang) => {
    const setContent = (el, value) => {
      if (el.dataset.i18nHtml === 'true') {
        el.innerHTML = value;
      } else {
        el.textContent = value;
      }
    };

    $$('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      if (!key) return;
      const value = getString(lang, key);
      if (!value) return;
      setContent(el, value);
    });

    $$('[data-i18n-attr]').forEach((el) => {
      const mapping = el.dataset.i18nAttr;
      if (!mapping) return;
      mapping.split(',').forEach((entry) => {
        const [attr, key] = entry.split(':').map((part) => part.trim());
        if (!attr || !key) return;
        const value = getString(lang, key);
        if (!value) return;
        el.setAttribute(attr, value);
      });
    });
  };

  const setLang = (lang) => {
    document.documentElement.lang = lang;
    localStorage.setItem('lang', lang);
    langButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    translate(lang);
    window.currentLang = lang;
    window.dispatchEvent(new CustomEvent('app:languagechange', { detail: { lang } }));
  };

  const storedLang = localStorage.getItem('lang');
  const initialLang = storedLang || document.documentElement.lang || 'id';
  setLang(initialLang);

  langButtons.forEach((btn) => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });
} else {
  window.currentLang = document.documentElement.lang || 'id';
  const getString = (lang, key) => {
    const dictionary = TRANSLATIONS[lang] || {};
    if (dictionary[key]) return dictionary[key];
    return TRANSLATIONS.id?.[key] || '';
  };
  const lang = window.currentLang;
  $$('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    if (!key) return;
    const value = getString(lang, key);
    if (!value) return;
    if (el.dataset.i18nHtml === 'true') {
      el.innerHTML = value;
    } else {
      el.textContent = value;
    }
  });
  $$('[data-i18n-attr]').forEach((el) => {
    const mapping = el.dataset.i18nAttr;
    if (!mapping) return;
    mapping.split(',').forEach((entry) => {
      const [attr, key] = entry.split(':').map((part) => part.trim());
      if (!attr || !key) return;
      const value = getString(lang, key);
      if (!value) return;
      el.setAttribute(attr, value);
    });
  });
}

// Year
const yearSpan = $('#year');
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}



