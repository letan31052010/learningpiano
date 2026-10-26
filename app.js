'use strict';
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const icon = name => `<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;
const STORAGE_KEY = 'phim-piano-v1';
let state = { completed: [], practiceSeconds: 0, language: 'vi', keyboardStart: 3, keyboardOctaves: 2, showLabels: true };
function t(key, values = {}) {
  const pair = window.PHIM_TEXT[key];
  if (!pair) throw new Error('Missing translation: ' + key);
  return pair[state.language === 'en' ? 1 : 0].replace(/\{(\w+)\}/g, (_, name) => values[name] ?? '').replaceAll('(s)',Number(values.n)===1?'':'s');
}
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (saved && typeof saved === 'object') {
    state.completed = Array.isArray(saved.completed) ? [...new Set(saved.completed.filter(n => [1, 2, 3].includes(n)))] : [];
    state.practiceSeconds = Number.isFinite(saved.practiceSeconds) ? Math.max(0, saved.practiceSeconds) : 0;
    state.language = saved.language === 'en' ? 'en' : 'vi';
    state.keyboardOctaves = [1,2,3].includes(saved.keyboardOctaves) ? saved.keyboardOctaves : 2;
    state.keyboardStart = Number.isInteger(saved.keyboardStart) ? Math.max(1, Math.min(8-state.keyboardOctaves, saved.keyboardStart)) : 3;
    state.showLabels = saved.showLabels !== false;
  }
} catch {}
let storageOK = true;
function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { storageOK = false; } }
const lessonsVI = [
  { id: 1, title: 'Làm quen với bàn phím', category: 'KHÁM PHÁ', duration: '8 phút', color: 'mint', description: 'Tìm nốt Đô, nhận ra quy luật và hiểu vì sao các nốt lặp lại.' },
  { id: 2, title: 'Nhịp điệu là nhịp thở', category: 'LẮNG NGHE', duration: '10 phút', color: 'sand', description: 'Cảm nhận phách đều và khám phá cách âm nhạc chuyển động.' },
  { id: 3, title: 'Khi các nốt cùng cất lời', category: 'KẾT NỐI', duration: '12 phút', color: 'lilac', description: 'Nghe hợp âm trưởng, thứ và hiểu điều gì làm chúng khác nhau.' }
];
const termsVI = [
  {name:'Cao độ', en:'Pitch', text:'Cảm giác âm thanh cao hay thấp. Khi tần số tăng, cao độ tăng. Trên piano, đi sang phải thường đưa bạn đến các nốt cao hơn.', example:'Ví dụ: C5 cao hơn C4 một quãng tám.', demo:'octave'},
  {name:'Quãng tám', en:'Octave', text:'Khoảng cách từ một nốt đến nốt tiếp theo cùng tên. Hai nốt cách nhau một quãng tám có tần số theo tỉ lệ 2:1.', example:'Ví dụ: C4 và C5 cùng tên Đô, nhưng ở hai cao độ khác nhau.', demo:'octave'},
  {name:'Phách', en:'Beat', text:'Nhịp đập đều làm điểm tựa để bạn đếm và chơi nhạc. Độ dài của mỗi nốt được tính trong mối quan hệ với phách.', example:'Thử đếm 1–2–3–4 đều nhau với máy đếm nhịp.', route:'practice'},
  {name:'Tốc độ', en:'Tempo · BPM', text:'Tốc độ của các phách. BPM là số phách trong một phút: 60 BPM nghĩa là mỗi giây có một phách.', example:'Ví dụ: 120 BPM nhanh gấp đôi 60 BPM.', route:'practice'},
  {name:'Hợp âm', en:'Chord', text:'Một nhóm nốt được nghe cùng nhau. Trong phần nhập môn, ta bắt đầu bằng hợp âm ba: nốt gốc, nốt bậc ba và nốt bậc năm.', example:'Ví dụ: hợp âm C trưởng gồm C–E–G.', demo:'major'},
  {name:'Nửa cung', en:'Semitone · Half step', text:'Khoảng cách cao độ nhỏ nhất giữa hai phím liền kề trên piano, tính cả phím trắng lẫn phím đen.', example:'Ví dụ: E và F cách nhau nửa cung dù cả hai đều là phím trắng.', demo:'semitone'},
  {name:'Cung', en:'Tone · Whole step', text:'Khoảng cách bằng hai nửa cung. Muốn tìm một cung trên bàn phím, bạn đi hai bước phím liền kề.', example:'Ví dụ: C → C♯ → D. Từ C đến D là một cung.'},
  {name:'Hợp âm trưởng và thứ', en:'Major & minor triads', text:'Hợp âm ba trưởng có quãng ba trưởng giữa nốt gốc và nốt bậc ba. Hạ nốt bậc ba một nửa cung sẽ tạo hợp âm ba thứ cùng nốt gốc.', example:'C–E–G → C–E♭–G. Cảm xúc còn phụ thuộc nhịp, sắc thái và ngữ cảnh.', demo:'compare'}
];
let lessonData, terms, routeTitles;
function refreshLocale() {
  lessonData = state.language === 'en' ? window.PHIM_LESSONS_EN : lessonsVI;
  terms = state.language === 'en' ? window.PHIM_TERMS_EN : termsVI;
  routeTitles = Object.fromEntries(['home','learn','practice','library'].map(key => [key,t(key)]));
}
refreshLocale();
function lessonArt(id) {
  if (id === 1) return `<svg viewBox="0 0 180 105" aria-hidden="true"><g transform="rotate(-9 90 53)"><rect x="32" y="22" width="116" height="66" rx="6" fill="#f9fcf7" stroke="#97aa8e"/><path d="M48 23v64m17-64v64m17-64v64m17-64v64m17-64v64m16-64v64" stroke="#b6c3ae"/><path d="M48 22v37m17-37v37m34-37v37m17-37v37m16-37v37" stroke="#72866c" stroke-width="8"/><rect x="35" y="63" width="10" height="18" rx="2" fill="#e3a97a" stroke="none"/></g><circle cx="155" cy="21" r="4" fill="#b7c5ab" stroke="none"/><path d="m20 67 4-5m-6 0 8 5" stroke="#bdcbb4"/></svg>`;
  if (id === 2) return `<svg viewBox="0 0 180 105" aria-hidden="true"><path d="M15 32h150M15 43h150M15 54h150M15 65h150M15 76h150" stroke="#d6c9ae" stroke-width="1"/><ellipse cx="54" cy="65" rx="9" ry="6" transform="rotate(-20 54 65)" fill="#a69168" stroke="none"/><path d="M62 64V21" stroke="#a69168" stroke-width="2.5"/><ellipse cx="98" cy="54" rx="9" ry="6" transform="rotate(-20 98 54)" fill="#a69168" stroke="none"/><path d="M106 53V18m0 0c20 5 16 18 6 18" stroke="#a69168" stroke-width="2.5"/><circle cx="139" cy="66" r="4" fill="#dbb57b" stroke="none"/></svg>`;
  return `<svg viewBox="0 0 180 105" aria-hidden="true"><path d="M35 24h110M35 36h110M35 48h110M35 60h110M35 72h110M67 84h39" stroke="#c6c2d3" stroke-width="1"/><g fill="#8c83a0" stroke="none"><ellipse cx="86" cy="84" rx="9" ry="6" transform="rotate(-18 86 84)"/><ellipse cx="86" cy="72" rx="9" ry="6" transform="rotate(-18 86 72)"/><ellipse cx="86" cy="60" rx="9" ry="6" transform="rotate(-18 86 60)"/></g><path d="M94 83V21" stroke="#8c83a0" stroke-width="2.4"/><path d="m26 44-4-5m6 2-7 1m131 13 7-4m-3-2 1 8" stroke="#bbb0ce"/></svg>`;
}

function lessonCards(wide = false) {
  return `<div class="lesson-grid ${wide ? 'wide-lessons' : ''}">${lessonData.map(l => `<article class="lesson-card"><div class="lesson-art art-${l.color}"><span class="art-number">0${l.id}</span>${lessonArt(l.id)}</div>${state.completed.includes(l.id) ? `<span class="done-badge" aria-label="${t('completed')}">${icon('check')}</span>` : ''}<div class="lesson-body"><div class="lesson-meta">${l.category} · ${t('lesson')} 0${l.id}</div><h3><a href="#lesson-${l.id}" data-lesson="${l.id}">${l.title}</a></h3><p>${l.description}</p><div class="lesson-card-footer"><span class="lesson-duration">${icon('clock')}${l.duration}</span><button class="card-action" data-lesson="${l.id}" aria-label="${t('openLesson',{title:l.title})}">${icon(state.completed.includes(l.id) ? 'check' : 'arrow')}</button></div></div></article>`).join('')}</div>`;
}
function nextLesson() { return lessonData.find(l => !state.completed.includes(l.id))?.id || 1; }
function heroArt() { return `<div class="hero-art" aria-hidden="true"><span class="float-note one">♪</span><span class="float-note two">♫</span><span class="float-note three">✦</span><div class="hero-piano"><div class="art-keys">${Array.from({length:10},(_,i)=>`<i class="${i===3?'highlight':''}"></i>`).join('')}${'<b></b>'.repeat(7)}</div></div><div class="art-tag"><span>♪</span> ${t('artTag')}</div></div>`; }
function homePage() {
  const n = state.completed.length, pct = Math.round(n / 3 * 100);
  return `<div class="page-heading"><div><h1>${t('welcome')}</h1><p>${t('welcomeSub')}</p></div><span class="day-chip">${icon('spark')} ${t('yourJourney')}</span></div>
  <section class="hero"><div class="hero-copy"><div class="eyebrow"><span class="line"></span> ${t('heroEyebrow')}</div><h2>${t('heroTitle')}<br><span>${t('heroTitle2')}</span></h2><p>${t('heroDescription')}</p><div class="hero-actions"><button class="button" data-lesson="${nextLesson()}">${t(n===0?'start':n===3?'review':'continue')} ${icon('arrow')}</button><span class="hero-small">${icon('clock')} ${t('smallSteps')}</span></div></div>${heroArt()}</section>
  <div class="overview-grid"><div><section aria-labelledby="first-lessons"><div class="section-heading"><div><h2 id="first-lessons">${t('firstSteps')}</h2><p>${t('firstSub')}</p></div><a class="section-link" href="#learn">${t('viewPath')} ${icon('arrow')}</a></div>${lessonCards()}</section><a class="practice-teaser" href="#practice"><span class="teaser-icon">${icon('piano')}</span><div class="teaser-copy"><h3>${t('teaserTitle')}</h3><p>${t('teaserSub')}</p></div><span class="small-pill">${t('freePractice')}</span>${icon('arrow')}</a></div>
  <aside class="side-stack"><section class="progress-card"><div class="widget-label">${t('stepByStep')}</div><div class="progress-title"><h3>${t('seed')}</h3><span>${pct}%</span></div><div class="progress-track" role="progressbar" aria-label="${t('progressLabel')}" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><span style="width:${pct}%"></span></div><div class="progress-detail"><span>${t('lessonsCompleted',{n})}</span><span>${t('intro')}</span></div><div class="progress-sub"><div><strong>${n}<small> / 3</small></strong><span>${t('understood')}</span></div><div><strong>${Math.floor(state.practiceSeconds / 60)}<small> ${t('minutes')}</small></strong><span>${t('timePractising')}</span></div></div></section><section class="thought-card"><div class="thought-header">${icon('spark')} ${t('curious')}</div><blockquote>${t('octaveQuestion')}</blockquote><a href="#library" class="section-link">${t('discoverOctave')} ${icon('arrow')}</a></section></aside></div>`;
}
function learnPage() { return `<div class="page-intro"><div class="eyebrow">${t('learnEyebrow')}</div><h1>${t('learnTitle')}</h1><p>${t('learnSub')}</p></div><div class="course-banner"><div><div class="eyebrow">${t('stage1')}</div><h2>${t('seed')}</h2><p>${t('courseSummary',{n:state.completed.length})}</p></div><span aria-hidden="true">♧</span></div>${lessonCards(true)}<div class="section-heading" style="margin-top:32px"><div><h2>${t('ahead')}</h2><p>${t('aheadSub')}</p></div></div><div class="future-path">${[1,2,3].map(n=>`<article class="future-stage"><span>${t('stage',{n:`0${n+1}`})}</span><h3>${t('future'+n)}</h3><p>${t('future'+n+'Sub')}</p><span class="coming">${t('planned')}</span></article>`).join('')}</div>`; }
const relativeShortcuts = {0:'A',1:'W',2:'S',3:'E',4:'D',5:'F',6:'T',7:'G',8:'Y',9:'H',10:'U',11:'J',12:'K'};
const noteNames = ['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
const solfegeVI = ['Đô','Đô thăng','Rê','Rê thăng','Mi','Fa','Fa thăng','Sol','Sol thăng','La','La thăng','Si'];
const solfegeEN = ['C','C sharp','D','D sharp','E','F','F sharp','G','G sharp','A','A sharp','B'];
function solfege(midi) { return (state.language==='en'?solfegeEN:solfegeVI)[midi%12]; }
function noteName(midi) { return noteNames[midi % 12] + (Math.floor(midi / 12) - 1); }
function keyboardBase() { return 12*(state.keyboardStart+1); }
function keyboardRange() { return t('range',{start:state.keyboardStart,end:state.keyboardStart+state.keyboardOctaves,n:state.keyboardOctaves}); }
function keyboard() {
  const base=keyboardBase(),end=base+state.keyboardOctaves*12;
  const whites=[],blacks=[];
  for(let m=base;m<=end;m++){if([0,2,4,5,7,9,11].includes(m%12))whites.push(m);else blacks.push({m,p:whites.length});}
  const count=whites.length;
  return `<div data-keyboard-region><div class="keyboard-toolbar"><div class="octave-shift"><button data-shift="-1" aria-label="${t('lower')}" ${state.keyboardStart<=1?'disabled':''}>− <span>${t('lowerShort')}</span></button><strong data-keyboard-range aria-live="polite">C${state.keyboardStart} — C${state.keyboardStart+state.keyboardOctaves}</strong><button data-shift="1" aria-label="${t('higher')}" ${state.keyboardStart>=8-state.keyboardOctaves?'disabled':''}><span>${t('higherShort')}</span> +</button></div><label class="octave-length"><span>${t('visibleRange')}</span><select data-octaves aria-label="${t('visibleRange')}">${[1,2,3].map(n=>`<option value="${n}" ${state.keyboardOctaves===n?'selected':''}>${t('octaves',{n})}</option>`).join('')}</select></label></div><div class="keyboard-scroll" style="--white-count:${count}" tabindex="0" role="region" aria-label="${t('pianoGroup',{start:state.keyboardStart,end:state.keyboardStart+state.keyboardOctaves})}"><div class="keyboard-wrap"><div class="piano-keyboard" style="--white-count:${count}" role="group" aria-label="${t('pianoGroup',{start:state.keyboardStart,end:state.keyboardStart+state.keyboardOctaves})}">${whites.map(m=>`<button class="piano-key white-key" data-midi="${m}" aria-label="${solfege(m)} ${noteName(m)}"><span class="key-name" ${state.showLabels?'':'hidden'}>${m%12===0?noteName(m):noteNames[m%12]}</span><span class="key-shortcut">${relativeShortcuts[m-base]??''}</span></button>`).join('')}${blacks.map(({m,p})=>`<button class="piano-key black-key" data-midi="${m}" style="left:calc(${p/count*100}% - 100% / ${count} * .32)" aria-label="${solfege(m)} ${noteName(m)}"><span class="key-name" ${state.showLabels?'':'hidden'}>${noteNames[m%12]}</span><span class="key-shortcut">${relativeShortcuts[m-base]??''}</span></button>`).join('')}</div></div></div><p class="keyboard-caption">${t('keyboardHint')}<br><span class="keyboard-swipe-hint">${t('keyboardScroll')} </span>${t('simulation')}</p></div>`;
}
function updateKeyboard(focusSelector) {
  cancelDemo();save();$$('[data-keyboard-region]').forEach(el=>{el.outerHTML=keyboard();});
  $$('[data-full-range]').forEach(el=>el.textContent=keyboardRange());
  if(focusSelector){const scope=activeLesson?$('#lesson-modal'):$('#main');$(focusSelector,scope)?.focus({preventScroll:true});}
}
function shiftKeyboard(delta) {
  const next=Math.max(1,Math.min(8-state.keyboardOctaves,state.keyboardStart+delta));
  if(next===state.keyboardStart)return;
  state.keyboardStart=next;updateKeyboard(`[data-shift="${delta}"]:not([disabled])`);
}
function liveNote() { return `<div class="live-note" aria-live="polite"><strong data-note-display>—</strong><div><span data-note-name>${t('playNote')}</span><small data-note-detail>${t('listenPitch')}</small></div></div>`; }
function metronome() { return `<section class="metronome-card"><h2>${t('metroTitle')}</h2><p>${t('metroSub')}</p><div class="bpm-number" id="bpm-display">${tempo}</div><div class="bpm-label">BPM</div><input class="tempo-slider" type="range" min="40" max="160" value="${tempo}" id="tempo" aria-label="${t('tempoLabel')}"><div class="tempo-labels"><span>40 · ${t('slow')}</span><span>160 · ${t('fast')}</span></div><div class="beat-dots" aria-hidden="true">${[1,2,3,4].map(i=>`<span class="beat-dot">${i}</span>`).join('')}</div><button class="button dark" id="metro-toggle">${icon('play')} ${t('startMetro')}</button><div class="metronome-hint">${t('metroHint')}</div></section>`; }
function practicePage() { return `<div class="page-intro"><div class="eyebrow">${t('practiceEyebrow')}</div><h1>${t('practiceTitle')}</h1><p>${t('practiceSub')}</p></div><div class="studio-layout"><section class="studio-panel"><div class="studio-header"><h2>${t('keyboardTitle')}</h2><span data-full-range>${keyboardRange()}</span></div>${liveNote()}${keyboard()}<div class="studio-controls"><label class="volume-control">${icon('volume')}<input type="range" min="0" max="100" value="${volume*100}" id="volume" aria-label="${t('volume')}"></label><label class="switch-label"><input type="checkbox" id="show-labels" ${state.showLabels?'checked':''}> ${t('labels')}</label></div><div class="chord-section"><p>${t('colours')}</p><div class="chord-buttons"><button data-sound="major">${t('cMajor')} · C–E–G</button><button data-sound="minor">${t('cMinor')} · C–E♭–G</button><button data-sound="scale">${t('cScale')}</button></div><p class="chord-explanation" id="chord-explanation">${t('chordPrompt')}</p></div></section>${metronome()}</div><div class="practice-callout"><span>✦</span><div><strong>${t('littleExperiment')}</strong><p>${t('experiment')}</p></div></div><p class="storage-note">${t(storageOK?'localStorage':'storageBlocked')}</p>`; }
function libraryPage() { return `<div class="page-intro"><div class="eyebrow">${t('libraryEyebrow')}</div><h1>${t('libraryTitle')}</h1><p>${t('librarySub')}</p></div><label class="search-box" style="display:block">${icon('search')}<input type="search" id="term-search" placeholder="${t('searchPlaceholder')}" aria-label="${t('search')}"></label><div class="terms-grid" id="terms-grid">${termCards(terms)}</div>`; }
function termCards(list) { return list.length ? list.map(term=>`<article class="term-card"><span class="term-en">${term.en}</span><h2>${term.name}</h2><p>${term.text}</p><div class="term-example">${term.example}</div>${term.demo?`<button class="button soft" data-sound="${term.demo}">${icon('volume')} ${t('listenDemo')}</button>`:term.route?`<a class="button soft" href="#${term.route}">${t('tryPractice')} ${icon('arrow')}</a>`:''}</article>`).join('') : `<p class="empty-search">${t('emptySearch')}</p>`; }
function languagePicker() { return `<label class="language-picker lesson-language"><span>${t('language')}</span><select data-language aria-label="${t('language')}"><option value="vi" lang="vi" ${state.language==='vi'?'selected':''}>Tiếng Việt</option><option value="en" lang="en" ${state.language==='en'?'selected':''}>English</option></select></label>`; }
function renderShell() {
  document.documentElement.lang=state.language;
  const content={'.brand-caption':'tagline','.nav-label':'space','.sidebar-note p':'sideStory','.sidebar-note>span:last-child':'curiosityStart','.sidebar-bottom strong':'newcomer','.sidebar-bottom div>span':'beginning','.footer .muted':'footer','.skip-link':'skip'};
  for(const [selector,key] of Object.entries(content))$(selector).innerHTML=t(key);
  $('.brand').setAttribute('aria-label',t('brandHome'));$('.main-nav').setAttribute('aria-label',t('nav'));$('.close-modal').setAttribute('aria-label',t('close'));
  $$('.nav-link').forEach(a=>$('span',a).textContent=t(a.dataset.route));
  $$('[data-copy]').forEach(el=>el.textContent=t(el.dataset.copy));
  $$('.footer>span')[1].innerHTML=`${t('madeWith')} <span class="orange">✦</span>`;
  $$('[data-language]').forEach(el=>{el.value=state.language;el.setAttribute('aria-label',t('language'));});
}
let route = 'home';
function render() {
  stopMetronome();refreshLocale();renderShell();
  route = Object.hasOwn(routeTitles, location.hash.slice(1)) ? location.hash.slice(1) : 'home';
  $('#main').innerHTML = ({home:homePage,learn:learnPage,practice:practicePage,library:libraryPage})[route]();
  $('#breadcrumb').textContent = routeTitles[route];
  $$('.nav-link').forEach(a => { a.classList.toggle('active',a.dataset.route === route); if(a.dataset.route===route)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current'); });
  document.title = `${routeTitles[route]} · phím. — ${state.language==='en'?'Understand, then play':'Hiểu rồi chơi'}`;
}

let audioCtx, volume = .6, soundGeneration = 0, activeNodes = new Set();
async function ensureAudio() {
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if(!AudioCtor) { toast(t('audioUnavailable')); return null; }
  if(!audioCtx) audioCtx = new AudioCtor();
  if(audioCtx.state === 'suspended') await audioCtx.resume();
  return audioCtx;
}
function tone(midi, when, duration = 1.2, strength = 1) {
  if(!audioCtx || volume === 0)return;
  const frequency = 440 * Math.pow(2,(midi - 69)/12);
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0,when);
  gain.gain.linearRampToValueAtTime(volume * .19 * strength,when + .009);
  gain.gain.exponentialRampToValueAtTime(.001,when+duration);
  gain.connect(audioCtx.destination);
  [1,2,3,4].forEach((harmonic,i)=>{
    const oscillator = audioCtx.createOscillator(), partial = audioCtx.createGain();
    oscillator.type='sine';oscillator.frequency.value=frequency*harmonic;
    partial.gain.value=[1,.28,.1,.035][i];oscillator.connect(partial);partial.connect(gain);
    oscillator.start(when);oscillator.stop(when+duration+.03);activeNodes.add(oscillator);
    oscillator.onended=()=>{activeNodes.delete(oscillator);oscillator.disconnect();partial.disconnect();if(i===3)gain.disconnect();};
  });
}
function flash(midi) {
  $$(`[data-midi="${midi}"]`).forEach(key=>{key.classList.add('pressed');setTimeout(()=>key.classList.remove('pressed'),260);});
}
function showNote(midi) {
  $$('[data-note-display]').forEach(el=>el.textContent=noteName(midi));
  $$('[data-note-name]').forEach(el=>el.textContent=solfege(midi));
  $$('[data-note-detail]').forEach(el=>el.textContent=`${Math.round(440*Math.pow(2,(midi-69)/12))} Hz · ${midi===60?t('middleC'):t('octaveNumber',{n:Math.floor(midi/12)-1})}`);
}
async function playKey(midi) {
  const ctx=await ensureAudio();
  if(ctx)tone(midi,ctx.currentTime);
  flash(midi);showNote(midi);
  if(activeLesson===1){
    if(midi%12===0){passed=true;setFeedback(t('correct1'),true);}
    else if(!passed){setFeedback(t('wrong1',{note:noteName(midi)}),false);}
  }
}
async function playSound(kind) {
  const ctx=await ensureAudio();if(!ctx)return;
  cancelDemo();const generation=soundGeneration;const start=ctx.currentTime+.025;
  let events=[];
  if(kind==='major')events=[[0,[60,64,67]]];
  if(kind==='minor')events=[[0,[60,63,67]]];
  if(kind==='compare')events=[[0,[60,64,67]],[1.7,[60,63,67]]];
  if(kind==='octave')events=[[0,[60]],[.9,[72]]];
  if(kind==='semitone')events=[[0,[64]],[.75,[65]]];
  if(kind==='scale')events=[60,62,64,65,67,69,71,72].map((n,i)=>[i*.32,[n]]);
  if(route==='practice'&&!activeLesson){const transpose=keyboardBase()-60;events=events.map(([delay,notes])=>[delay,notes.map(n=>n+transpose)]);}
  for(const [delay,notes] of events){
    for(const n of notes)tone(n,start+delay,1.4,notes.length>1?.65:1);
    setTimeout(()=>{if(generation!==soundGeneration)return;notes.forEach(flash);showNote(notes[0]);},delay*1000+25);
  }
  const explanations={major:t('majorExplanation'),minor:t('minorExplanation'),scale:t('scaleExplanation')};
  if($('#chord-explanation')&&explanations[kind])$('#chord-explanation').textContent=explanations[kind];
  $$('.chord-buttons button').forEach(b=>b.classList.toggle('active',b.dataset.sound===kind));
}
function cancelDemo(){soundGeneration++;if(audioCtx){for(const node of activeNodes){try{node.stop();}catch{}}activeNodes.clear();}}
let tempo=60,metroRunning=false,metroTimer=null,metroBeat=0,metroNextTime=0,metroGeneration=0;
async function startMetronome(){
  const ctx=await ensureAudio();if(!ctx)return;
  metroRunning=true;metroBeat=0;metroNextTime=ctx.currentTime+.05;metroGeneration++;
  $('#metro-toggle').innerHTML=`■ &nbsp; ${t('stopMetro')}`;
  function schedule(){
    if(!metroRunning)return;
    while(metroNextTime<ctx.currentTime+.12){
      const beat=metroBeat%4,at=metroNextTime,gen=metroGeneration;
      clickTone(at,beat===0);
      setTimeout(()=>{if(!metroRunning||gen!==metroGeneration)return;$$('.beat-dot').forEach((d,i)=>d.classList.toggle('on',i===beat));},Math.max(0,(at-ctx.currentTime)*1000));
      metroNextTime+=60/tempo;metroBeat++;
    }
    metroTimer=setTimeout(schedule,25);
  }
  schedule();
}
function clickTone(at,accent=false){
  const osc=audioCtx.createOscillator(),g=audioCtx.createGain();
  osc.frequency.value=accent?1100:800;g.gain.setValueAtTime(.12,at);g.gain.exponentialRampToValueAtTime(.001,at+.055);osc.connect(g);g.connect(audioCtx.destination);osc.start(at);osc.stop(at+.06);osc.onended=()=>{osc.disconnect();g.disconnect();};
}
function stopMetronome(){metroRunning=false;metroGeneration++;clearTimeout(metroTimer);$$('.beat-dot').forEach(d=>d.classList.remove('on'));if($('#metro-toggle'))$('#metro-toggle').innerHTML=`${icon('play')} ${t('startMetro')}`;}
let activeLesson=null,passed=false,returnFocus=null;

function lessonBody(id){
  const theory=`<div class="learning-goal">${icon('check')}<span>${t('goal'+id)}</span></div><section class="lesson-section"><h3>${t('heading'+id+'1')}</h3><p>${t('theory'+id)}</p><div class="concept-box">${t('concept'+id)}</div></section>`;
  let practice='';
  if(id===1)practice=`${liveNote()}${keyboard()}`;
  if(id===2)practice=`<div class="rhythm-demo" aria-label="${t('fourNotes')}">${[1,2,3,4].map(n=>`<div class="rhythm-note"><span aria-hidden="true">♩</span><small>${t('beat',{n})}</small></div>`).join('')}</div><button class="button soft rhythm-play" id="rhythm-demo">${icon('volume')} ${t('listenBeats')}</button>`;
  if(id===3)practice=`<div class="chord-compare"><button data-sound="major"><strong>${t('cMajor')}</strong><span>C · E · G</span><small>♪ ${t('tapListen')}</small></button><button data-sound="minor"><strong>${t('cMinor')}</strong><span>C · E♭ · G</span><small>♪ ${t('tapListen')}</small></button></div>`;
  let exercise='';
  if(id===1)exercise=`<p>${t('instruction1')}</p>`;
  if(id===2)exercise=`<div class="answer-options">${[1,2,4].map(n=>`<button class="answer-option" data-answer="${n}">${t('beats',{n})}</button>`).join('')}</div>`;
  if(id===3)exercise=`<div class="answer-options">${['C','E','G'].map(n=>`<button class="answer-option" data-answer="${n}">${t('answer'+n)}</button>`).join('')}</div>`;
  return `${theory}<section class="lesson-section"><h3>${t('heading'+id+'2')}</h3><p>${t('listen'+id)}</p>${practice}</section><section class="exercise"><span class="exercise-tag">${t(id===1?'yourTurn':id===2?'checkLittle':'reason')}</span><h3>${t('question'+id)}</h3>${exercise}<div class="exercise-feedback" id="exercise-feedback" role="status"></div></section>`;
}
let selectedAnswer=null, lessonCompletedView=false;
function renderLesson(){
  const id=activeLesson,l=lessonData.find(x=>x.id===id);if(!l)return;
  if(lessonCompletedView){$('#lesson-content').innerHTML=completionHTML(id);return;}
  $('#lesson-content').innerHTML=`${languagePicker()}<div class="lesson-topline">${t('seed').toUpperCase()} · ${t('lesson')} 0${id} / 03 · ${l.duration.toUpperCase()}</div><h2 id="lesson-title">${l.title}</h2><p class="lesson-lead">${l.description}</p>${lessonBody(id)}<div class="lesson-finish"><p>${t('finishHint')}</p><button class="button" id="complete-lesson" ${passed?'':'disabled'}>${t('finish')} ${icon('check')}</button></div>`;
  if(id===1&&passed)setFeedback(t('correct1'),true);
  if(id!==1&&selectedAnswer!==null){const option=$(`[data-answer="${selectedAnswer}"]`,$('#lesson-content'));if(option)answer(selectedAnswer,option);}
}
function openLesson(id){
  if(!lessonData.some(x=>x.id===id))return;
  if($('#lesson-modal').hidden)returnFocus=document.activeElement;
  cancelDemo();stopMetronome();activeLesson=id;passed=false;selectedAnswer=null;lessonCompletedView=false;renderLesson();
  $('#lesson-modal').hidden=false;document.body.style.overflow='hidden';$('.app-shell').inert=true;$('.sidebar').inert=true;$('.lesson-dialog').focus();$('#lesson-modal').scrollTop=0;
}
function closeLesson(){cancelDemo();activeLesson=null;$('#lesson-modal').hidden=true;document.body.style.overflow='';$('.app-shell').inert=false;$('.sidebar').inert=false;if(returnFocus?.isConnected)returnFocus.focus();else $('#main').focus({preventScroll:true});}
function setFeedback(text,correct){const el=$('#exercise-feedback');if(!el)return;el.textContent=text;el.classList.toggle('success',correct);if(passed)$('#complete-lesson').disabled=false;}
function answer(value,button){
  if(!activeLesson)return;selectedAnswer=value;
  const correct=activeLesson===2?value==='1':value==='E';passed=correct;$('#complete-lesson').disabled=!correct;
  $$('.answer-option').forEach(b=>b.classList.remove('correct','wrong'));button.classList.add(correct?'correct':'wrong');
  setFeedback(t((correct?'correct':'wrong')+activeLesson),correct);
}
function completionHTML(id){
  const next=lessonData.find(l=>!state.completed.includes(l.id));
  return `${languagePicker()}<div class="completion-state"><div class="completion-icon">${icon('check')}</div><div class="lesson-topline">${t('understoodMore')}</div><h2 id="lesson-title">${t('congratulations')}</h2><p>${t('completion'+id)}</p>${next?`<button class="button" data-lesson="${next.id}">${t('nextLesson',{n:next.id})} ${icon('arrow')}</button>`:`<a href="#practice" class="button" data-close-route>${t('enterPractice')} ${icon('piano')}</a>`}<button class="button secondary" data-close>${t('backHome')}</button><div class="storage-note">${t(storageOK?'saved':'storageBlocked')}</div></div>`;
}
function completeLesson(){
  if(!passed||!activeLesson)return;
  if(!state.completed.includes(activeLesson))state.completed.push(activeLesson);save();
  lessonCompletedView=true;render();renderLesson();$('.lesson-dialog').focus();$('#lesson-modal').scrollTop=0;
}
function changeLanguage(language){
  if(!['vi','en'].includes(language)||language===state.language)return;
  const scroll=$('#lesson-modal').scrollTop;
  state.language=language;save();cancelDemo();render();
  if(activeLesson){renderLesson();$('#lesson-modal').scrollTop=scroll;$('[data-language]',$('#lesson-modal'))?.focus({preventScroll:true});}
  else $('[data-language]',$('.topbar')).focus({preventScroll:true});
}

let toastTimer;
function toast(text){$('#toast').textContent=text;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,4000);}
document.addEventListener('click',event=>{
  const shift=event.target.closest('[data-shift]');if(shift){shiftKeyboard(Number(shift.dataset.shift));return;}
  const lesson=event.target.closest('[data-lesson]');if(lesson){event.preventDefault();openLesson(Number(lesson.dataset.lesson));return;}
  if(event.target.closest('.close-modal,[data-close]')){closeLesson();return;}
  if(event.target.closest('[data-close-route]')){closeLesson();return;}
  if(event.target===$('#lesson-modal')){closeLesson();return;}
  const sound=event.target.closest('[data-sound]');if(sound){playSound(sound.dataset.sound).catch(()=>toast(t('audioError')));return;}
  const key=event.target.closest('[data-midi]');if(key){playKey(Number(key.dataset.midi)).catch(()=>toast(t('audioError')));return;}
  const option=event.target.closest('[data-answer]');if(option){answer(option.dataset.answer,option);return;}
  if(event.target.closest('#complete-lesson')){completeLesson();return;}
  if(event.target.closest('#metro-toggle')){if(metroRunning)stopMetronome();else startMetronome().catch(()=>toast(t('metroError')));return;}
  if(event.target.closest('#rhythm-demo')){ensureAudio().then(ctx=>{if(!ctx)return;for(let i=0;i<4;i++)clickTone(ctx.currentTime+.05+i,i===0);}).catch(()=>toast('Chưa mở được âm thanh. Hãy thử lại.'));}
});
const normalise=text=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase();
document.addEventListener('input',event=>{
  if(event.target.id==='volume')volume=Number(event.target.value)/100;
  if(event.target.id==='tempo'){tempo=Number(event.target.value);$('#bpm-display').textContent=tempo;}
  if(event.target.id==='term-search'){const q=normalise(event.target.value.trim());$('#terms-grid').innerHTML=termCards(terms.filter(t=>normalise(t.name+' '+t.en+' '+t.text).includes(q)));}
});
document.addEventListener('change',event=>{
  if(event.target.matches('[data-language]'))changeLanguage(event.target.value);
  if(event.target.matches('[data-octaves]')){state.keyboardOctaves=Number(event.target.value);state.keyboardStart=Math.min(state.keyboardStart,8-state.keyboardOctaves);updateKeyboard('[data-octaves]');}
  if(event.target.id==='show-labels'){state.showLabels=event.target.checked;save();$$('.key-name').forEach(el=>el.hidden=!state.showLabels);}
});
document.addEventListener('keydown',event=>{
  const modalOpen=!$('#lesson-modal').hidden;
  if(event.key==='Escape'&&modalOpen){closeLesson();return;}
  if(event.key==='Tab'&&modalOpen){const controls=$$('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),[tabindex=\"0\"]',$('.lesson-dialog')).filter(el=>el.getClientRects().length);const first=controls[0],last=controls.at(-1);if(event.shiftKey&&(document.activeElement===first||document.activeElement===$('.lesson-dialog'))){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}return;}
  if(event.repeat||event.ctrlKey||event.metaKey||event.altKey||/INPUT|TEXTAREA|SELECT/.test(event.target.tagName))return;
  if((modalOpen&&activeLesson!==1)||(!modalOpen&&route!=='practice'))return;
  // Preserve Enter/Space activation and navigation shortcuts; only map letter keys.
  if(['z','x'].includes(event.key.toLowerCase())){event.preventDefault();shiftKeyboard(event.key.toLowerCase()==='z'?-1:1);return;}
  const offset=Object.keys(relativeShortcuts).find(n=>relativeShortcuts[n].toLowerCase()===event.key.toLowerCase());
  const midi=offset===undefined?null:keyboardBase()+Number(offset);
  if(midi!==null){event.preventDefault();playKey(Number(midi)).catch(()=>toast(t('audioError')));}
});
window.addEventListener('hashchange',()=>{cancelDemo();if(!$('#lesson-modal').hidden)closeLesson();render();window.scrollTo({top:0,behavior:'instant'});$('#main').focus({preventScroll:true});});
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopMetronome();cancelDemo();save();}});
window.addEventListener('pagehide',save);
setInterval(()=>{if(!document.hidden&&route==='practice'&&$('#lesson-modal').hidden){state.practiceSeconds+=5;save();}},5000);
render();
