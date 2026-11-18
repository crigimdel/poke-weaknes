'use strict';

// ---------- Datos de tipos ----------
const TYPES = {
  normal:   { es: 'Normal',    color: '#9fa19f' },
  fire:     { es: 'Fuego',     color: '#e62829' },
  water:    { es: 'Agua',      color: '#2980ef' },
  electric: { es: 'Eléctrico', color: '#e0b000' },
  grass:    { es: 'Planta',    color: '#3fa129' },
  ice:      { es: 'Hielo',     color: '#3dcef3' },
  fighting: { es: 'Lucha',     color: '#ff8000' },
  poison:   { es: 'Veneno',    color: '#9141cb' },
  ground:   { es: 'Tierra',    color: '#915121' },
  flying:   { es: 'Volador',   color: '#81b9ef' },
  psychic:  { es: 'Psíquico',  color: '#ef4179' },
  bug:      { es: 'Bicho',     color: '#91a119' },
  rock:     { es: 'Roca',      color: '#afa981' },
  ghost:    { es: 'Fantasma',  color: '#704170' },
  dragon:   { es: 'Dragón',    color: '#5060e1' },
  dark:     { es: 'Siniestro', color: '#624d4e' },
  steel:    { es: 'Acero',     color: '#60a1b8' },
  fairy:    { es: 'Hada',      color: '#ef70ef' },
};
const TYPE_KEYS = Object.keys(TYPES);

// Eficacia: CHART[atacante][defensor] (si no aparece, x1)
const CHART = {
  normal:   { rock: .5, ghost: 0, steel: .5 },
  fire:     { fire: .5, water: .5, grass: 2, ice: 2, bug: 2, rock: .5, dragon: .5, steel: 2 },
  water:    { fire: 2, water: .5, grass: .5, ground: 2, rock: 2, dragon: .5 },
  electric: { water: 2, electric: .5, grass: .5, ground: 0, flying: 2, dragon: .5 },
  grass:    { fire: .5, water: 2, grass: .5, poison: .5, ground: 2, flying: .5, bug: .5, rock: 2, dragon: .5, steel: .5 },
  ice:      { fire: .5, water: .5, grass: 2, ice: .5, ground: 2, flying: 2, dragon: 2, steel: .5 },
  fighting: { normal: 2, ice: 2, poison: .5, flying: .5, psychic: .5, bug: .5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: .5 },
  poison:   { grass: 2, poison: .5, ground: .5, rock: .5, ghost: .5, steel: 0, fairy: 2 },
  ground:   { fire: 2, electric: 2, grass: .5, poison: 2, flying: 0, bug: .5, rock: 2, steel: 2 },
  flying:   { electric: .5, grass: 2, fighting: 2, bug: 2, rock: .5, steel: .5 },
  psychic:  { fighting: 2, poison: 2, psychic: .5, dark: 0, steel: .5 },
  bug:      { fire: .5, grass: 2, fighting: .5, poison: .5, flying: .5, psychic: 2, ghost: .5, dark: 2, steel: .5, fairy: .5 },
  rock:     { fire: 2, ice: 2, fighting: .5, ground: .5, flying: 2, bug: 2, steel: .5 },
  ghost:    { normal: 0, psychic: 2, ghost: 2, dark: .5 },
  dragon:   { dragon: 2, steel: .5, fairy: 0 },
  dark:     { fighting: .5, psychic: 2, ghost: 2, dark: .5, fairy: .5 },
  steel:    { fire: .5, water: .5, electric: .5, ice: 2, rock: 2, steel: .5, fairy: 2 },
  fairy:    { fire: .5, fighting: 2, poison: .5, dragon: 2, dark: 2, steel: .5 },
};

// Habilidades que cambian las debilidades (se muestran como aviso)
const ABILITIES = {
  'levitate':       { es: 'Levitación',        note: 'inmune a Tierra' },
  'earth-eater':    { es: 'Geofagia',          note: 'inmune a Tierra' },
  'flash-fire':     { es: 'Absorbe Fuego',     note: 'inmune a Fuego' },
  'well-baked-body':{ es: 'Cuerpo Horneado',   note: 'inmune a Fuego' },
  'water-absorb':   { es: 'Absorbe Agua',      note: 'inmune a Agua' },
  'storm-drain':    { es: 'Colector',          note: 'inmune a Agua' },
  'dry-skin':       { es: 'Piel Seca',         note: 'inmune a Agua, pero recibe más daño de Fuego' },
  'volt-absorb':    { es: 'Absorbe Elec',      note: 'inmune a Eléctrico' },
  'lightning-rod':  { es: 'Pararrayos',        note: 'inmune a Eléctrico' },
  'motor-drive':    { es: 'Electromotor',      note: 'inmune a Eléctrico' },
  'sap-sipper':     { es: 'Herbívoro',         note: 'inmune a Planta' },
  'thick-fat':      { es: 'Sebo',              note: 'recibe la mitad de daño de Fuego y Hielo' },
  'heatproof':      { es: 'Ignífugo',          note: 'recibe la mitad de daño de Fuego' },
  'water-bubble':   { es: 'Pompa',             note: 'recibe la mitad de daño de Fuego' },
  'purifying-salt': { es: 'Sal Purificadora',  note: 'recibe la mitad de daño de Fantasma' },
  'fluffy':         { es: 'Peluche',           note: 'recibe el doble de daño de Fuego' },
  'wonder-guard':   { es: 'Superguarda',       note: '¡solo le dañan los ataques súper eficaces!' },
  'filter':         { es: 'Filtro',            note: 'reduce el daño de ataques súper eficaces' },
  'solid-rock':     { es: 'Roca Sólida',       note: 'reduce el daño de ataques súper eficaces' },
  'prism-armor':    { es: 'Armadura Prisma',   note: 'reduce el daño de ataques súper eficaces' },
};

const API = 'https://pokeapi.co/api/v2';

// ---------- Cálculos ----------
const eff = (atk, def) => (CHART[atk][def] ?? 1);
const defMultiplier = (atk, defTypes) => defTypes.reduce((m, d) => m * eff(atk, d), 1);

function analyze(defTypes) {
  const byAtk = TYPE_KEYS.map(t => ({ type: t, mult: defMultiplier(t, defTypes) }));

  // Mejor tipo atacante: daño que hace, y cuánto le hacen a él los tipos (STAB) del rival
  const best = byAtk
    .filter(x => x.mult >= 2)
    .map(x => ({ ...x, risk: Math.max(...defTypes.map(d => eff(d, x.type))) }))
    .sort((a, b) => b.mult - a.mult || a.risk - b.risk || TYPES[a.type].es.localeCompare(TYPES[b.type].es));

  const group = m => byAtk.filter(x => x.mult === m).map(x => x.type);
  return {
    best,
    weak: { 4: group(4), 2: group(2) },
    resist: { 0.5: group(.5), 0.25: group(.25), 0: group(0) },
  };
}

// ---------- UI helpers ----------
const $ = sel => document.querySelector(sel);
const fmt = m => 'x' + (m === .5 ? '½' : m === .25 ? '¼' : m);
const multClass = m => 'm' + String(m).replace('.', '');

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

function badge(type, size = '') {
  const s = el('span', 'badge ' + size, TYPES[type].es);
  s.style.setProperty('--c', TYPES[type].color);
  return s;
}

function setStatus(msg, kind = '') {
  const s = $('#status');
  s.textContent = msg;
  s.className = 'status ' + kind;
}

function renderGroups(container, groups, labels) {
  container.innerHTML = '';
  for (const [mult, label] of labels) {
    const types = groups[mult];
    if (!types.length) continue;
    const g = el('div', 'group');
    g.appendChild(el('span', 'mpill ' + multClass(mult), fmt(mult)));
    const body = el('div');
    body.appendChild(el('p', 'group-label', label));
    const chips = el('div', 'chips');
    types.forEach(t => chips.appendChild(badge(t)));
    body.appendChild(chips);
    g.appendChild(body);
    container.appendChild(g);
  }
  if (!container.children.length) container.appendChild(el('p', 'empty', 'Ninguna.'));
}

function riskTag(risk) {
  if (risk === 0) return ['good', 'Inmune a sus ataques de tipo'];
  if (risk < 1) return ['good', 'Resiste sus ataques de tipo'];
  if (risk === 1) return ['', 'Recibe daño neutro de sus ataques'];
  return ['bad', '¡Cuidado! También te golpea fuerte'];
}

function render(defTypes, pokemon = null) {
  const r = analyze(defTypes);

  // Tarjeta principal
  const head = $('#pokeHeader');
  head.style.setProperty('--c', TYPES[defTypes[0]].color);
  head.style.setProperty('--c2', TYPES[defTypes[1] || defTypes[0]].color);
  head.innerHTML = '';
  const art = el('div', 'poke-art');
  if (pokemon?.sprite) {
    const img = el('img');
    img.src = pokemon.sprite;
    img.alt = pokemon.name;
    art.appendChild(img);
  } else {
    art.appendChild(el('span', 'orb', defTypes.map(t => TYPES[t].es[0]).join('')));
  }
  const info = el('div', 'poke-info');
  info.appendChild(el('div', 'poke-num', pokemon ? '#' + String(pokemon.id).padStart(4, '0') : 'Combinación de tipos'));
  info.appendChild(el('h2', '', pokemon ? pokemon.name.replace(/-/g, ' ') : defTypes.map(t => TYPES[t].es).join(' / ')));
  const types = el('div', 'types');
  defTypes.forEach(t => types.appendChild(badge(t)));
  info.appendChild(types);
  const nWeak = r.weak[4].length + r.weak[2].length;
  const nRes = r.resist[0.5].length + r.resist[0.25].length + r.resist[0].length;
  const stats = el('div', 'poke-stats');
  stats.innerHTML = `<span><b>${nWeak}</b> debilidades</span><span><b>${nRes}</b> resistencias</span>`;
  info.appendChild(stats);
  head.append(art, info);

  // Mejores atacantes
  const list = $('#bestList');
  list.innerHTML = '';
  if (!r.best.length) {
    list.appendChild(el('li', 'empty', 'No tiene debilidades: usa ataques neutros potentes.'));
  }
  r.best.forEach((x, i) => {
    const li = el('li', 'pick' + (i === 0 ? ' top' : ''));
    li.style.setProperty('--c', TYPES[x.type].color);
    if (i === 0) li.appendChild(el('span', 'label', '★ Recomendado'));
    li.appendChild(badge(x.type, i === 0 ? 'lg' : ''));
    li.appendChild(el('span', 'mult', fmt(x.mult)));
    const [cls, text] = riskTag(x.risk);
    li.appendChild(el('span', 'tag ' + cls, text));
    list.appendChild(li);
  });

  renderGroups($('#weakGroups'), r.weak, [[4, 'Muy débil'], [2, 'Débil']]);
  renderGroups($('#resistGroups'), r.resist, [[0, 'Inmune'], [0.25, 'Muy resistente'], [0.5, 'Resistente']]);

  // Habilidades
  const notes = $('#abilityNotes');
  const abil = (pokemon?.abilities || []).filter(a => ABILITIES[a]);
  notes.hidden = !abil.length;
  notes.innerHTML = '';
  if (abil.length) {
    notes.appendChild(el('h2', '', 'Ojo con sus habilidades'));
    abil.forEach(a => {
      const p = el('p');
      p.append(el('b', '', ABILITIES[a].es), `: ${ABILITIES[a].note}.`);
      notes.appendChild(p);
    });
  }

  // Mostrar y relanzar animaciones
  const results = $('#results');
  results.hidden = false;
  results.querySelectorAll('.reveal').forEach(e => {
    e.style.animation = 'none';
    void e.offsetHeight;
    e.style.animation = '';
  });
}

// ---------- Selector de tipos ----------
let selected = [];

function buildPicker() {
  const grid = $('#typePicker');
  TYPE_KEYS.forEach(t => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'type-btn';
    b.dataset.type = t;
    b.style.setProperty('--c', TYPES[t].color);
    b.textContent = TYPES[t].es;
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', () => toggleType(t));
    grid.appendChild(b);
  });
  $('#clearBtn').addEventListener('click', () => { setSelected([]); $('#results').hidden = true; setStatus(''); });
}

function setSelected(types) {
  selected = types;
  document.querySelectorAll('.type-btn').forEach(b =>
    b.setAttribute('aria-pressed', String(selected.includes(b.dataset.type))));
  $('#clearBtn').hidden = !selected.length;
}

function toggleType(t) {
  let next = selected.includes(t) ? selected.filter(x => x !== t) : [...selected, t];
  if (next.length > 2) next = next.slice(-2);
  setSelected(next);
  $('#nameInput').value = '';
  setStatus('');
  if (next.length) render(next); else $('#results').hidden = true;
  setHash(next.length ? 'tipos=' + next.join(',') : '');
}

function setHash(h) {
  history.replaceState(null, '', h ? '#' + h : location.pathname + location.search);
}

function loadFromHash() {
  const h = decodeURIComponent(location.hash.slice(1));
  if (!h) return;
  if (h.startsWith('tipos=')) {
    const types = h.slice(6).split(',').filter(t => TYPES[t]).slice(0, 2);
    if (types.length) { setSelected(types); render(types); }
  } else {
    $('#nameInput').value = h;
    searchPokemon(h);
  }
}

// ---------- Búsqueda por nombre ----------
async function loadNameList() {
  const KEY = 'pokeNames.v1';
  let names = null;
  try { names = JSON.parse(localStorage.getItem(KEY)); } catch {}
  if (!names) {
    try {
      const res = await fetch(`${API}/pokemon?limit=2000`);
      const data = await res.json();
      names = data.results.map(p => p.name);
      try { localStorage.setItem(KEY, JSON.stringify(names)); } catch {}
    } catch { return; }
  }
  const dl = $('#pokeList');
  const frag = document.createDocumentFragment();
  names.forEach(n => { const o = document.createElement('option'); o.value = n; frag.appendChild(o); });
  dl.appendChild(frag);
}

async function searchPokemon(raw) {
  const q = raw.trim().toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[.'’:]/g, '').replace(/\s+/g, '-').replace(/♀/g, '-f').replace(/♂/g, '-m');
  if (!q) return;

  setStatus('Buscando…', 'loading');
  try {
    let res = await fetch(`${API}/pokemon/${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error(res.status === 404 ? 'notfound' : 'net');
    const p = await res.json();
    const types = p.types.sort((a, b) => a.slot - b.slot).map(t => t.type.name).filter(t => TYPES[t]);
    setSelected(types);
    setStatus('');
    setHash(p.name);
    render(types, {
      name: p.name,
      id: p.id,
      sprite: p.sprites?.other?.['official-artwork']?.front_default || p.sprites?.front_default,
      abilities: p.abilities.map(a => a.ability.name),
    });
  } catch (e) {
    setStatus(e.message === 'notfound'
      ? `No encuentro "${raw}". Prueba con el nombre en inglés (p. ej. "bulbasaur").`
      : 'No se pudo conectar. Revisa tu conexión o elige los tipos a mano.', 'error');
  }
}

// ---------- Instalación (PWA) ----------
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  $('#installBtn').hidden = false;
});
window.addEventListener('appinstalled', () => { $('#installBtn').hidden = true; });

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', () => {
  buildPicker();
  $('#searchForm').addEventListener('submit', e => {
    e.preventDefault();
    $('#nameInput').blur();
    searchPokemon($('#nameInput').value);
  });
  $('#installBtn').addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    $('#installBtn').hidden = true;
  });
  loadNameList();
  loadFromHash();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
});
