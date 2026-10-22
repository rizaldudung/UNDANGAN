// ====== Pengaturan (ubah sesuai kebutuhan) ======
const WEDDING_DATE = new Date('2027-01-17T08:00:00+07:00');
const STORAGE_KEY = 'wishes-raka-sinta';
const PHOTO_COLORS = [
  ['#d9a5a0', '#c9a96a'], ['#1a2a4d', '#d9a5a0'], ['#c9a96a', '#eef0f4'],
  ['#101b33', '#c9a96a'], ['#eef0f4', '#d9a5a0'], ['#1a2a4d', '#c9a96a']
]; // ganti dengan foto: <img src="img/foto1.jpg">

const $ = (id) => document.getElementById(id);

// 1. Nama tamu dari URL, contoh: index.html?to=Budi+Santoso
const guest = new URLSearchParams(location.search).get('to');
if (guest) $('guestName').textContent = guest;

// 2. Buka undangan + putar musik
const bgm = $('bgm');
const musicBtn = $('musicBtn');

$('openBtn').addEventListener('click', () => {
  const cover = $('cover');
  cover.classList.add('open');
  document.body.classList.remove('locked');
  setTimeout(() => cover.classList.add('gone'), 1500);

  musicBtn.hidden = false;
  bgm.play().then(() => musicBtn.classList.add('playing')).catch(() => {});
});

// Tombol putar/jeda
musicBtn.addEventListener('click', () => {
  if (bgm.paused) {
    bgm.play();
    musicBtn.classList.add('playing');
  } else {
    bgm.pause();
    musicBtn.classList.remove('playing');
  }
});

// 3. Hitung mundur
function tick() {
  const diff = Math.max(0, WEDDING_DATE - new Date());
  const s = Math.floor(diff / 1000);
  $('cd-d').textContent = Math.floor(s / 86400);
  $('cd-h').textContent = Math.floor((s % 86400) / 3600);
  $('cd-m').textContent = Math.floor((s % 3600) / 60);
  $('cd-s').textContent = s % 60;
}
tick();
setInterval(tick, 1000);

// 4. Galeri + modal Bootstrap
const PHOTOS = [
  'img/foto1.jpg',
  'img/foto2.jpg',
  'img/foto3.jpg',
  'img/foto4.jpg',
  'img/foto5.jpg',
  'img/foto6.jpg'
];
const modal = new bootstrap.Modal($('photoModal'));
PHOTOS.forEach((src, i) => {
  const col = document.createElement('div');
  col.className = 'col-6 col-md-4';
  const btn = document.createElement('button');
  btn.className = 'photo';
  btn.setAttribute('aria-label', 'Lihat foto ' + (i + 1));
  const img = document.createElement('img');
  img.src = src;
  img.alt = 'Foto ' + (i + 1);
  img.loading = 'lazy';
  btn.appendChild(img);
  btn.addEventListener('click', () => {
    $('modalPhoto').src = src;
    modal.show();
  });
  col.appendChild(btn);
  $('galleryGrid').appendChild(col);
});

// 5. RSVP & ucapan (disimpan di localStorage)
const loadWishes = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
function renderWishes() {
  const box = $('wishes');
  box.innerHTML = '';
  const list = loadWishes();
  if (!list.length) { box.textContent = 'Belum ada ucapan. Jadilah yang pertama.'; return; }
  list.forEach((w) => {
    const d = document.createElement('div');
    d.className = 'wish';
    const n = document.createElement('b'); n.textContent = w.name;
    const s = document.createElement('small'); s.textContent = w.status;
    const p = document.createElement('p'); p.className = 'mb-0'; p.textContent = w.msg;
    d.append(n, s, p);
    box.appendChild(d);
  });
}
$('rsvpForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const form = e.target;
  form.classList.add('was-validated');
  if (!form.checkValidity()) return;
  const list = loadWishes();
  list.unshift({ name: $('fName').value.trim(), status: $('fStatus').value, msg: $('fMsg').value.trim() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  form.reset();
  form.classList.remove('was-validated');
  renderWishes();
});
renderWishes();

// 6. Salin nomor rekening
$('copyBtn').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('rekNo').textContent); $('copyBtn').textContent = 'Tersalin'; }
  catch { $('copyBtn').textContent = 'Salin manual'; }
  setTimeout(() => ($('copyBtn').textContent = 'Salin nomor'), 2000);
});

// 7. Simpan ke kalender (file .ics)
$('calBtn').addEventListener('click', (e) => {
  e.preventDefault();
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT',
    'SUMMARY:Pernikahan Raka & Sinta', 'DTSTART:20270117T010000Z', 'DTEND:20270117T070000Z',
    'LOCATION:Sidoarjo', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  a.download = 'pernikahan.ics';
  a.click();
});