/* A Little Universe Made Just for You, Oun — vanilla JS */
(() => {
'use strict';
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const rnd = a => a[Math.floor(Math.random() * a.length)];
const wait = ms => new Promise(r => setTimeout(r, ms));
const fx = $('#fx');

/* ---------- MUSIC (one audio element, never restarted) ---------- */
const audio = $('#audio'), player = $('#player');
let vol = .6, fadeId, musicMissing = false;
audio.volume = 0;
function fadeTo(target, ms) {
  cancelAnimationFrame(fadeId);
  const from = audio.volume, t0 = performance.now();
  (function step(now) {
    const p = Math.min((now - t0) / ms, 1);
    audio.volume = Math.max(0, Math.min(1, from + (target - from) * p));
    if (p < 1) fadeId = requestAnimationFrame(step);
  })(t0);
}
// Returns 'ok' | 'blocked' | 'missing'
async function startMusic() {
  if (musicMissing) return 'missing';
  if (!audio.paused) return 'ok';
  try { audio.volume = 0; await audio.play(); fadeTo(vol, 5000); return 'ok'; }
  catch (e) { return e.name === 'NotAllowedError' ? 'blocked' : markMissing(); }
}
function markMissing() {
  musicMissing = true;
  $('#musicNote').textContent = 'add music/birthday-song.mp3';
  player.classList.remove('playing');
  return 'missing';
}
audio.addEventListener('error', markMissing);
audio.addEventListener('play', () => player.classList.add('playing'));
audio.addEventListener('pause', () => player.classList.remove('playing'));
$('#musicBtn').onclick = async () => {
  if (musicMissing) return;
  if (audio.paused) { audio.volume = 0; try { await audio.play(); fadeTo(vol, 800); } catch (e) {} }
  else { fadeTo(0, 500); setTimeout(() => audio.pause(), 520); }
};
$('#vol').oninput = e => { vol = e.target.value / 100; if (!audio.paused) fadeTo(vol, 250); };

/* ---------- PARTICLES ---------- */
function burst(x, y, n = 14, set = ['❤', '✨', '💖', '💗', '💜']) {
  if (RM) n = Math.min(n, 4);
  for (let i = 0; i < n; i++) {
    const e = document.createElement('span'), a = Math.random() * 6.28, d = 60 + Math.random() * 130;
    e.className = 'p'; e.textContent = rnd(set);
    e.style.cssText = `left:${x}px;top:${y}px;--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px;font-size:${14 + Math.random() * 16}px`;
    fx.appendChild(e); setTimeout(() => e.remove(), 1300);
  }
}
function burstEl(el, n, set) { const r = el.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, n, set); }
function screenBurst(n = 40, set) { for (let i = 0; i < 6; i++) setTimeout(() => burst(Math.random() * innerWidth, Math.random() * innerHeight * .8, n / 6, set), i * 120); }
function floatUp(emoji, cls, cont, dur, max) {
  if (cont.children.length > max) return;
  const e = document.createElement('span');
  e.className = cls; e.textContent = emoji;
  e.style.cssText = `left:${Math.random() * 100}%;font-size:${14 + Math.random() * 20}px;animation-duration:${dur + Math.random() * 6}s;--sx:${(Math.random() - .5) * 120}px`;
  e.addEventListener('animationend', () => e.remove()); cont.appendChild(e);
}
const heartsBox = $('#hearts');
function heartRain(n = 14) { for (let i = 0; i < n; i++) setTimeout(() => floatUp(rnd(['❤', '💗', '💖', '💜']), 'fh', heartsBox, 5, 60), i * 120); }
if (!RM) {
  setInterval(() => floatUp(rnd(['❤', '💗', '💖']), 'fh', heartsBox, 9, 14), 1300);
  setInterval(() => floatUp('🌸', 'petal', heartsBox, 12, 16), 2200);
  setInterval(() => { if (document.hidden) return; const s = document.createElement('i'); s.className = 'shoot'; s.style.cssText = `left:${Math.random() * 40}vw;top:${Math.random() * 30}vh`; document.body.appendChild(s); setTimeout(() => s.remove(), 1400); }, 7000);
}

/* ---------- STARFIELD (canvas) ---------- */
const cv = $('#sky'), cx = cv.getContext('2d');
let stars = [], skyAlpha = 0;
function sizeSky() {
  cv.width = innerWidth; cv.height = innerHeight;
  stars = Array.from({ length: Math.min(140, Math.floor(innerWidth * innerHeight / 9000)) }, () => ({ x: Math.random() * cv.width, y: Math.random() * cv.height, r: Math.random() * 1.4 + .3, s: Math.random() * 2 + .5, o: Math.random() * 6 }));
}
function drawSky(t) {
  cx.clearRect(0, 0, cv.width, cv.height);
  if (skyAlpha < 1) skyAlpha += .004;
  for (const s of stars) {
    cx.globalAlpha = skyAlpha * (RM ? .8 : .45 + .55 * Math.sin(t / 700 * s.s + s.o) ** 2);
    cx.fillStyle = '#fff4e6'; cx.beginPath(); cx.arc(s.x, s.y, s.r, 0, 6.28); cx.fill();
  }
  requestAnimationFrame(drawSky);
}
addEventListener('resize', sizeSky); sizeSky(); requestAnimationFrame(drawSky);

/* ---------- INTRO ---------- */
async function runIntro() {
  $('#tap').classList.add('hidden');
  $('#intro').classList.remove('hidden');
  await wait(1800); $('#bigHeart').classList.add('show'); heartRain(6);
  await wait(2600); $('#t1').classList.add('show');
  await wait(2400); $('#t2').classList.add('show');
  await wait(2400); $('#enter').classList.add('show');
}
$('#enter').onclick = async () => {
  startMusic(); // no-op if already playing; a click is a valid gesture
  const intro = $('#intro');
  burstEl($('#enter'), 30); screenBurst(40); heartRain(20);
  intro.classList.add('leave');
  const u = $('#universe'); u.classList.remove('hidden');
  setTimeout(() => intro.remove(), 1500);
};
(async function boot() {
  const r = await startMusic(); // attempt autoplay immediately; never bypass restrictions
  if (r === 'blocked') {
    $('#tap').classList.remove('hidden');
    $('#tapBtn').onclick = async () => { await startMusic(); runIntro(); };
  } else runIntro();
})();

/* ---------- NAVIGATION (no page reloads) ---------- */
const panel = $('#panel');
let gameTimer = null;
function openView(id) {
  $$('.view').forEach(v => v.classList.toggle('on', v.id === 'v-' + id));
  panel.classList.remove('hidden'); panel.scrollTop = 0;
  if (id === 'reasons') buildCards();
  if (id === 'quiz') startQuiz();
  if (id === 'games') resetCatch();
  if (id === 'cake') heartRain(8);
}
function closeView() { panel.classList.add('hidden'); clearInterval(gameTimer); }
$$('.planet').forEach(p => p.onclick = () => { burstEl(p, 10); openView(p.dataset.view); });
$('#back').onclick = closeView;

/* ---------- 1. LETTER ---------- */
const env = $('#envelope');
function toggleEnv() { const o = env.classList.toggle('open'); $('#envHint').style.display = o ? 'none' : ''; if (o) { burstEl(env, 16); } }
env.onclick = toggleEnv; env.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') toggleEnv(); };

/* ---------- 2. REASONS ---------- */
const reasons = ['Your smile makes my day better.', "You're my favorite notification.", 'I love the little things about you.', 'You make ordinary days feel special.', "You're the person I want to tell everything to.", 'Even a short chat with you fixes my whole day.', 'You make me laugh when I least expect it.', 'Being far away from you is hard, but you make it worth it.'];
let cardsBuilt = false;
function buildCards() {
  if (cardsBuilt) return; cardsBuilt = true;
  $('#cards').innerHTML = reasons.map(t => `<button class="fc"><div><b>♡</b><u>${t}</u></div></button>`).join('');
  $$('.fc').forEach(c => c.onclick = () => { c.classList.toggle('flip'); if (c.classList.contains('flip')) burstEl(c, 8, ['❤', '✨']); });
}

/* ---------- 3. QUIZ ---------- */
const quiz = [
  ['Who misses the other person more?', [['Me, obviously', "Cute answer, but I'm not letting you win this one. I miss you too much."], ['You, hehe', "Ha, wrong. I miss you every single day. We'll call it a tie."], ['Both of us, equally', 'Correct. A very diplomatic answer. ♡']]],
  ['Who is more clingy?', [['Me', "Confession accepted. I'm clingy too, so we're even."], ['You', 'Rude. Accurate, but rude.'], ["Both, we're a clingy team", 'Yes. Two clingy people, one big long-distance problem.']]],
  ['Who would fall asleep first during a late-night call?', [['Me', "And I'd stay on the line anyway, listening to you breathe. Sleepy hearts."], ['You', "Guilty. I'd pretend I was still awake though."], ['Nobody, we both fight it', 'Until one of us says "okay one more minute" six times.']]],
  ['Who says "I love you" more?', [['Me', 'Hmm, suspiciously confident. I demand a recount.'], ['You', "I'm saying it right now anyway: I love you."], ["We've lost count", 'That is the best possible answer.']]],
  ["Who is more dramatic when the other doesn't reply?", [['Me', 'Dramatic, but I love it. Please keep being you.'], ['You', "Okay, fair. I do stare at my phone like it owes me money."], ['Both. Dramatic queens/kings.', "We should honestly be in a soap opera."]]],
  ['Who wants more hugs and kisses?', [['Me', 'Noted. A big pile of hugs and kisses has been scheduled for the day we meet.'], ['You', "Also me. I'm in line right behind you."], ['Both, a LOT', 'Correct. Total hugs owed: infinity.']]]
];
let qi = 0;
function startQuiz() { qi = 0; showQ(); }
function showQ() {
  const box = $('#quizBox');
  if (qi >= quiz.length) {
    box.innerHTML = `<h4>Quiz complete 🎉</h4><p>Final result: we are equally ridiculous, equally in love, and equally in need of a hug. Perfect score for both of us. ♡</p><button class="glow-btn small" id="again">Play again</button>`;
    $('#again').onclick = startQuiz; screenBurst(30); return;
  }
  const [q, opts] = quiz[qi];
  box.innerHTML = `<p class="hint">Question ${qi + 1} of ${quiz.length}</p><h4>${q}</h4>` + opts.map((o, i) => `<button class="opt" data-i="${i}">${o[0]}</button>`).join('') + '<div id="qfb"></div>';
  $$('.opt').forEach(b => b.onclick = () => {
    $$('.opt').forEach(x => x.disabled = true); b.classList.add('pick'); burstEl(b, 8);
    $('#qfb').innerHTML = `<p class="fb">${opts[b.dataset.i][1]}</p><button class="glow-btn small" id="nq">${qi === quiz.length - 1 ? 'See result' : 'Next ♡'}</button>`;
    $('#nq').onclick = () => { qi++; showQ(); };
  });
}

/* ---------- 4. SECRET MESSAGES ---------- */
const secrets = ['I still reread our old messages sometimes.', "You're the first person I want to tell good news to.", 'I practice what I will say when I finally see you. I never get past hugging you.', 'Every time my phone buzzes I hope it is you.', 'You make me want to be better, in a very quiet way.'];
$('#miniHearts').innerHTML = secrets.map((_, i) => `<button data-i="${i}" aria-label="Hidden heart ${i + 1}">💖</button>`).join('');
$('#lock').onclick = function () {
  if (this.classList.contains('open')) return;
  this.classList.add('open'); this.textContent = '🔓'; burstEl(this, 30); heartRain(10);
  setTimeout(() => { $('#secretMain').classList.add('on'); $('#secretHint').textContent = 'There are more hidden hearts below. Tap them ♡'; }, 700);
};
$$('#miniHearts button').forEach(b => b.onclick = () => { const m = $('#secretMsg'); m.textContent = secrets[b.dataset.i]; m.classList.add('on'); burstEl(b, 12); });

/* ---------- 5. WISH ---------- */
$('#wishBtn').onclick = () => {
  const s = document.createElement('i'); s.className = 'shoot'; s.style.cssText = 'left:5vw;top:12vh;width:180px;height:3px;box-shadow:0 0 14px #fff';
  document.body.appendChild(s); setTimeout(() => s.remove(), 1400);
  setTimeout(() => { screenBurst(40, ['✨', '⭐', '💖']); $('#wishMsg').classList.add('on'); }, 1000);
};

/* ---------- 6. GAMES ---------- */
// A. Catch My Love
let caught = 0;
function resetCatch() { clearInterval(gameTimer); caught = 0; updCatch(); $('#arena').innerHTML = ''; $('#catchMsg').classList.remove('on'); }
function updCatch() { $('#score').textContent = `Hearts collected: ${caught} / 10`; $('#bar').style.width = caught * 10 + '%'; }
function moveHeart(h) {
  const a = $('#arena'); h.style.left = Math.random() * (a.clientWidth - 48) + 'px'; h.style.top = Math.random() * (a.clientHeight - 48) + 'px';
}
function addHeart() {
  const h = document.createElement('button'); h.className = 'cg'; h.textContent = rnd(['❤', '💗', '💖']); h.setAttribute('aria-label', 'Catch the heart');
  h.onclick = () => {
    burstEl(h, 8); h.remove(); caught++; updCatch();
    if (caught >= 10) { clearInterval(gameTimer); $('#arena').innerHTML = ''; $('#catchMsg').classList.add('on'); screenBurst(40); }
    else addHeart();
  };
  $('#arena').appendChild(h); moveHeart(h);
}
$('#catchStart').onclick = () => {
  resetCatch(); for (let i = 0; i < 4; i++) addHeart();
  gameTimer = setInterval(() => $$('#arena .cg').forEach(moveHeart), 1500);
};
// B. How much do you love me?
const loveLines = ['Not enough. Try again!', 'Hmm... I think you need to increase that number.', "Okay, I'll accept that answer. Maybe.", 'Wrong answer. The correct answer is infinity.', 'Still not enough. I can do this all day.'];
let li = 0;
$('#loveBtn').onclick = function () { $('#loveOut').textContent = loveLines[li++ % loveLines.length]; burstEl(this, 6, ['❤']); };
// C. Virtual hug
$('#hugBtn').onclick = async function () {
  const st = $('#hugStage'); st.classList.remove('go'); $('#hugOut').textContent = '';
  await wait(60); st.classList.add('go'); await wait(1300);
  burstEl(st, 24, ['💗', '✨', '💜']);
  $('#hugOut').textContent = 'Consider this the biggest hug I can send through a screen. I wish I could hug you for real.';
};
// D. Kiss
const kissLines = ["Mwah! Delivered. Please don't let it expire.", 'That one was extra. You can keep it for later.', "I'd send a thousand more if the signal allowed.", "One kiss, tax-free, forehead included."];
$('#kissBtn').onclick = function () { burstEl(this, 26, ['💋', '💗', '❤']); heartRain(6); $('#kissOut').textContent = rnd(kissLines); };
// E. Random messages
const msgs = ["You're my favorite person to think about.", "If I could teleport, I'd already be at your door.", 'Fun fact: you are still the best part of my day.', 'I miss you, and that is just the polite version.', "You're stuck with me, sorry not sorry.", 'Today I wish I had a pause button for the distance.', "I'm proud of you, always.", 'Your laugh is a top-tier sound.', 'Roses are red, violets are blue, my phone is boring if it is not you.', 'I love you more than late-night snacks, and that is serious.', 'You make waiting for the next time we meet feel worth it.', "Hug incoming. Brace yourself, it's a long one."];
let lastMsg = -1;
$('#randBtn').onclick = function () {
  let i; do { i = Math.floor(Math.random() * msgs.length); } while (i === lastMsg); lastMsg = i;
  $('#randOut').textContent = msgs[i]; burstEl(this, 8, ['❤', '✨']);
};

/* ---------- 7. CAKE FINALE ---------- */
$('#blowBtn').onclick = function () {
  $('#cake').classList.add('out-all'); this.style.display = 'none';
  setTimeout(() => { screenBurst(60, ['✨', '💖', '⭐', '🎉']); heartRain(30); $('#finalMsg').classList.add('on'); $('#finalMsg').scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'center' }); }, 600);
};
})();
