// Fake FITHOP RILLIZ catalogue.
// Each release has a CSS gradient `cover` so we don't need image assets.

window.RILLIZ_DATA = {
  hero: {
    id: 'magnetic',
    badge: 'NEW RELEASE',
    title: 'Magnetic — Crew Cut',
    artist: 'ILLIT × FITHOP Crew',
    choreographer: 'HYO JIN KIM',
    bpm: 128,
    duration: '2:14',
    difficulty: 'Hard',
    date: '21 OCT 2025',
    cover: 'radial-gradient(140% 90% at 20% 0%, #A97DFF 0%, transparent 55%), radial-gradient(120% 80% at 100% 100%, #320A7A 0%, transparent 60%), linear-gradient(135deg, #1F0552 0%, #000 100%)',
    description: 'A six-week residency from HYO JIN. Mirrored, one take, no edits.',
  },
  featured: [
    { id: 'supernova',  title: 'Supernova — Mirror',       artist: 'aespa',         choreographer: 'BADA LEE',     duration: '1:48', bpm: 120, difficulty: 'Mid',  cover: 'radial-gradient(100% 70% at 70% 0%, #FF4D5E 0%, transparent 60%), linear-gradient(160deg, #1A0033 0%, #000 100%)' },
    { id: 'standby',    title: 'Standby — Slow Burn',      artist: 'BLACKPINK',     choreographer: 'KIEL TUTIN',   duration: '2:02', bpm: 96,  difficulty: 'Easy', cover: 'radial-gradient(100% 80% at 30% 0%, #7128F5 0%, transparent 60%), linear-gradient(135deg, #0A0118 0%, #000 100%)' },
    { id: 'sparks',     title: 'Sparks — A-Side',          artist: 'NewJeans',      choreographer: 'JUNHO LEE',    duration: '1:36', bpm: 140, difficulty: 'Hard', cover: 'radial-gradient(120% 80% at 80% 100%, #2FCC71 0%, transparent 55%), linear-gradient(135deg, #001A0A 0%, #000 100%)' },
    { id: 'parade',     title: 'Parade — Festival Cut',    artist: 'SEVENTEEN',     choreographer: 'WOOZI',        duration: '2:48', bpm: 132, difficulty: 'Mid',  cover: 'radial-gradient(120% 80% at 20% 100%, #F5A623 0%, transparent 55%), linear-gradient(135deg, #2A1500 0%, #000 100%)' },
  ],
  drops: [
    { id: 'd1', title: 'Magnetic — Crew Cut',  artist: 'ILLIT',        choreographer: 'HYO JIN KIM',  duration: '2:14', bpm: 128, difficulty: 'Hard', tag: 'NEW', cover: 'radial-gradient(120% 80% at 50% 0%, #8C53FF 0%, transparent 60%), linear-gradient(180deg, #1F0552, #000)' },
    { id: 'd2', title: 'Whiplash — Cypher',     artist: 'aespa',        choreographer: 'JUNHO LEE',    duration: '1:50', bpm: 122, difficulty: 'Mid',  tag: 'NEW', cover: 'radial-gradient(120% 80% at 30% 100%, #FF4D5E 0%, transparent 55%), linear-gradient(180deg, #2A0008, #000)' },
    { id: 'd3', title: 'Drama — A Side',        artist: 'aespa',        choreographer: 'BADA LEE',     duration: '2:00', bpm: 118, difficulty: 'Easy', tag: 'NEW', cover: 'radial-gradient(120% 80% at 70% 0%, #2FCC71 0%, transparent 55%), linear-gradient(180deg, #002818, #000)' },
    { id: 'd4', title: 'Easy — Slowed',         artist: 'LE SSERAFIM',  choreographer: 'MINJEE PARK',  duration: '1:38', bpm: 95,  difficulty: 'Easy', tag: 'NEW', cover: 'radial-gradient(120% 80% at 50% 100%, #A97DFF 0%, transparent 55%), linear-gradient(180deg, #14002E, #000)' },
    { id: 'd5', title: 'Smart — B Side',        artist: 'LE SSERAFIM',  choreographer: 'MINJEE PARK',  duration: '1:22', bpm: 138, difficulty: 'Hard', tag: '',    cover: 'radial-gradient(120% 80% at 20% 0%, #F5A623 0%, transparent 55%), linear-gradient(180deg, #1E1000, #000)' },
    { id: 'd6', title: 'Crazy — Camera 02',     artist: 'LE SSERAFIM',  choreographer: 'KIEL TUTIN',   duration: '2:30', bpm: 108, difficulty: 'Mid',  tag: '',    cover: 'radial-gradient(120% 80% at 80% 0%, #7128F5 0%, transparent 55%), linear-gradient(180deg, #0F0026, #000)' },
    { id: 'd7', title: 'How Sweet — Hook Loop', artist: 'NewJeans',     choreographer: 'JUNHO LEE',    duration: '0:48', bpm: 124, difficulty: 'Easy', tag: '',    cover: 'radial-gradient(120% 80% at 50% 50%, #FF8FA3 0%, transparent 55%), linear-gradient(180deg, #2E0014, #000)' },
    { id: 'd8', title: 'Supernatural — Solo',   artist: 'NewJeans',     choreographer: 'BADA LEE',     duration: '2:04', bpm: 116, difficulty: 'Mid',  tag: '',    cover: 'radial-gradient(120% 80% at 30% 50%, #5B16D6 0%, transparent 55%), linear-gradient(180deg, #0A0033, #000)' },
  ],
  choreographers: [
    { id: 'hyojin',  name: 'HYO JIN KIM',  city: 'Seoul',  color: '#7128F5' },
    { id: 'bada',    name: 'BADA LEE',     city: 'Seoul',  color: '#FF4D5E' },
    { id: 'kiel',    name: 'KIEL TUTIN',   city: 'Auckland', color: '#A97DFF' },
    { id: 'junho',   name: 'JUNHO LEE',    city: 'Busan',  color: '#2FCC71' },
    { id: 'minjee',  name: 'MINJEE PARK',  city: 'Seoul',  color: '#F5A623' },
    { id: 'reia',    name: 'REIA SATO',    city: 'Tokyo',  color: '#8C53FF' },
    { id: 'aiko',    name: 'AIKO MORI',    city: 'Osaka',  color: '#3B1078' },
  ],

  // FITCLIP player page — a single choreography "clip set" with a 6-track playlist.
  player: {
    fitclip: 'ILLIT — Magnetic',
    subtitle: 'FITCLIP · Crew Cut',
    choreographer: 'HYO JIN KIM',
    versions: [
      { id: 'mirror', label: '거울 모드' },
      { id: 'slow',   label: '느리게' },
    ],
    trackCount: 6,
    tracks: [
      { id: 't1', n: 1, title: 'Magnetic — Intro 8 Count', choreographer: 'HYO JIN KIM', duration: '0:32', bpm: 128, difficulty: 'Easy', locked: false },
      { id: 't2', n: 2, title: 'Magnetic — Verse Build',   choreographer: 'HYO JIN KIM', duration: '0:48', bpm: 128, difficulty: 'Mid',  locked: false },
      { id: 't3', n: 3, title: 'Magnetic — Pre-Chorus',    choreographer: 'HYO JIN KIM', duration: '0:40', bpm: 128, difficulty: 'Mid',  locked: false },
      { id: 't4', n: 4, title: 'Magnetic — Hook (Full)',   choreographer: 'HYO JIN KIM', duration: '1:04', bpm: 128, difficulty: 'Hard', locked: true,  price: '₩2,500' },
      { id: 't5', n: 5, title: 'Magnetic — Dance Break',   choreographer: 'BADA LEE',    duration: '0:56', bpm: 128, difficulty: 'Hard', locked: true,  price: '₩2,500' },
      { id: 't6', n: 6, title: 'Magnetic — Outro Pose',    choreographer: 'HYO JIN KIM', duration: '0:28', bpm: 128, difficulty: 'Easy', locked: true,  price: '₩2,500' },
    ],
    covers: {
      t1: 'radial-gradient(120% 80% at 30% 0%, #8C53FF 0%, transparent 60%), linear-gradient(180deg, #1F0552, #000)',
      t2: 'radial-gradient(120% 80% at 70% 0%, #7128F5 0%, transparent 60%), linear-gradient(180deg, #14002E, #000)',
      t3: 'radial-gradient(120% 80% at 50% 100%, #A97DFF 0%, transparent 55%), linear-gradient(180deg, #0F0026, #000)',
      t4: 'radial-gradient(120% 80% at 20% 0%, #FF4D5E 0%, transparent 55%), linear-gradient(180deg, #2A0008, #000)',
      t5: 'radial-gradient(120% 80% at 80% 100%, #5B16D6 0%, transparent 55%), linear-gradient(180deg, #0A0033, #000)',
      t6: 'radial-gradient(120% 80% at 50% 50%, #2FCC71 0%, transparent 55%), linear-gradient(180deg, #002818, #000)',
    },
    cover: 'radial-gradient(140% 90% at 20% 0%, #A97DFF 0%, transparent 55%), radial-gradient(120% 80% at 100% 100%, #320A7A 0%, transparent 60%), linear-gradient(135deg, #1F0552 0%, #000 100%)',
  },

  // FITHOP member / account (dummy — no real API).
  account: {
    name: '김다인',
    email: 'dain.kim@example.com',
    membershipActive: true,
    paymentMethod: 'CAFE24',
    nextBilling: '2026-06-08',
    purchased: [
      { id: 'p1', title: 'FIT48-04 Jadakiss — Who’s Real', meta: 'FITCLIP 48 · 2026.05 · BPM 96 · LOW TEMPO', cover: 'radial-gradient(120% 80% at 30% 0%, #8C53FF 0%, transparent 60%), linear-gradient(180deg, #1F0552, #000)' },
      { id: 'p2', title: 'FIT48-07 Nas — Made You Look',   meta: 'FITCLIP 48 · 2026.05 · BPM 92 · LOW TEMPO', cover: 'radial-gradient(120% 80% at 70% 100%, #FF4D5E 0%, transparent 55%), linear-gradient(180deg, #2A0008, #000)' },
    ],
  },

  // Dummy auth — UI only. Real access control (Cafe24 session ↔ admin email)
  // is wired later in the store's computeIsAdmin(); see store.jsx.
  auth: {
    currentUser: {
      id: 'user_001',
      cafe24MemberId: 'bbyeifa',
      name: '김다인',
      email: 'dain.kim@example.com',
      loggedIn: true,
      loginProvider: 'cafe24',
      membershipProvider: 'cafe24',
      subscriptionStatus: 'active',
      isAdmin: true,
    },
    adminEmails: ['admin@fithop.com', 'dain.kim@example.com'],
  },
};

function splitTrackTitle(displayTitle, fallbackArtist) {
  const parts = (displayTitle || '').split(' — ');
  if (fallbackArtist) return { artist: fallbackArtist, songTitle: displayTitle };
  if (parts.length > 1) return { artist: parts[0], songTitle: parts.slice(1).join(' — ') };
  return { artist: fallbackArtist || '', songTitle: displayTitle || '' };
}

function defaultTrackVersions(track) {
  const provider = track.videoProvider || 'placeholder';
  const embedUrl = track.videoEmbedUrl || '';
  return [
    { id: 'original', label: 'Original', provider, embedUrl },
    { id: 'mirror', label: 'Mirror', provider, embedUrl },
  ];
}

function normalizeTrack(raw, fitclip, index) {
  const displayTitle = raw.displayTitle || raw.title || [raw.artist, raw.songTitle].filter(Boolean).join(' — ');
  const parsed = splitTrackTitle(displayTitle, fitclip.fitclipNumber === 48 ? 'ILLIT' : '');
  const purchased = typeof raw.purchased === 'boolean'
    ? raw.purchased
    : raw.locked === undefined ? true : !raw.locked;
  const subscriptionStatus = raw.subscriptionStatus || 'active';
  const track = {
    ...raw,
    id: raw.id,
    fitclipNumber: fitclip.fitclipNumber,
    clipIndex: raw.clipIndex || raw.n || index + 1,
    n: raw.n || raw.clipIndex || index + 1,
    artist: raw.artist || parsed.artist,
    songTitle: raw.songTitle || parsed.songTitle,
    displayTitle,
    title: displayTitle,
    choreo: raw.choreo || raw.choreographer,
    choreographer: raw.choreographer || raw.choreo,
    videoProvider: raw.videoProvider || 'placeholder',
    videoEmbedUrl: raw.videoEmbedUrl || '',
    thumbnailUrl: raw.thumbnailUrl || '',
    purchased,
    subscriptionStatus,
    paymentProvider: raw.paymentProvider || 'cafe24',
  };

  track.versions = raw.versions || defaultTrackVersions(track);
  track.locked = !window.canWatchTrack(track);
  if (!track.price && window.canPurchaseTrack(track)) track.price = '₩2,500';
  return track;
}

// =========================================================================
// FITCLIP catalogue — 48 releases. #48 reuses the live player set above;
// the rest are generated (gradient covers, months, dummy tracks). A few are
// intentionally empty to exercise the "no tracks yet" state.
// =========================================================================
(function () {
  const base = window.RILLIZ_DATA.player;

  // dark, distinct accent palettes cycled by fitclip number
  const PALETTES = [
    { a: '#8C53FF', b: '#3A0E8C', tag: 'purple / indigo' },
    { a: '#3B6BFF', b: '#0A1B5C', tag: 'deep blue / violet' },
    { a: '#FF4DA6', b: '#3A0A33', tag: 'magenta / dark purple' },
    { a: '#1FB85C', b: '#06281A', tag: 'deep green / violet' },
    { a: '#FF4D5E', b: '#2A0008', tag: 'wine red / black' },
    { a: '#5B16D6', b: '#0A0033', tag: 'indigo' },
    { a: '#19B5C9', b: '#04222A', tag: 'teal / ink' },
    { a: '#F5A623', b: '#1E1000', tag: 'amber / black' },
  ];
  const coverGradient = (n) => {
    const p = PALETTES[(n - 1) % PALETTES.length];
    return `radial-gradient(120% 95% at 28% 8%, ${p.a} 0%, transparent 58%), ` +
           `radial-gradient(120% 90% at 90% 100%, ${p.b} 0%, transparent 60%), ` +
           `linear-gradient(150deg, #14071f 0%, #050505 78%)`;
  };
  window.getFitclipCoverGradient = coverGradient;

  // uploadMonth: #48 = 2026.05, one month earlier each step down
  const uploadMonth = (n) => {
    const total = (2026 * 12 + 4) - (48 - n); // 2026.05 is index 2026*12+4
    const y = Math.floor(total / 12), m = (total % 12) + 1;
    return `${y}.${String(m).padStart(2, '0')}`;
  };

  // track-name pools for generated sets
  const ARTISTS = ['Jadakiss', 'Nas', 'Mobb Deep', 'GZA', 'Big L', 'Black Star', 'Common', 'Pete Rock', 'Gang Starr', 'Rakim', 'Scarface', 'UGK'];
  const TITLES  = ['Who’s Real', 'Made You Look', 'Shook Ones', 'Liquid Swords', 'Put It On', 'Definition', 'The Light', 'They Reminisce', 'Mass Appeal', 'Microphone Fiend', 'On My Block', 'Int’l Players'];
  const CHOREOS = ['HYO JIN KIM', 'BADA LEE', 'JUNHO LEE', 'MINJEE PARK', 'KIEL TUTIN', 'REIA SATO'];
  const DIFFS   = ['Easy', 'Mid', 'Hard'];
  const DURS    = ['0:32', '0:40', '0:48', '0:56', '1:04', '1:12'];

  const emptyOnes = new Set([7, 14, 28, 35]); // a handful with no tracks yet

  const fitclips = [];
  for (let n = 1; n <= 48; n++) {
    if (n === 48) {
      const owned = base.tracks.filter(t => !t.locked).length;
      fitclips.push({
        fitclipNumber: 48,
        title: base.fitclip,
        fitclip: base.fitclip,
        uploadMonth: '2026.05',
        albumCoverUrl: '',
        coverGradient: coverGradient(48),
        tracks: base.tracks,
        covers: base.covers,
        cover: base.cover,
        trackCount: base.tracks.length,
        ownedCount: owned,
        availableCount: owned,
      });
      continue;
    }
    const empty = emptyOnes.has(n);
    const count = empty ? 0 : (4 + (n % 3));   // 4–6 tracks
    const tracks = [];
    const covers = {};
    for (let i = 0; i < count; i++) {
      const id = `f${n}t${i + 1}`;
      const locked = i >= Math.ceil(count / 2);   // first half free
      const bpm = 88 + ((n + i * 7) % 56);
      tracks.push({
        id, n: i + 1,
        title: `${ARTISTS[(n + i) % ARTISTS.length]} — ${TITLES[(n * 2 + i) % TITLES.length]}`,
        choreographer: CHOREOS[(n + i) % CHOREOS.length],
        duration: DURS[(n + i) % DURS.length],
        bpm, difficulty: DIFFS[(n + i) % DIFFS.length],
        locked, price: locked ? '₩2,500' : undefined,
      });
      const p = PALETTES[(n + i) % PALETTES.length];
      covers[id] = `radial-gradient(120% 80% at ${20 + (i * 17) % 60}% ${i % 2 ? 100 : 0}%, ${p.a} 0%, transparent 58%), linear-gradient(180deg, ${p.b}, #000)`;
    }
    const owned = tracks.filter(t => !t.locked).length;
    const repTitle = count > 0 ? tracks[0].title : `FITCLIP ${n}`;
    fitclips.push({
      fitclipNumber: n,
      title: repTitle,
      fitclip: repTitle,
      uploadMonth: uploadMonth(n),
      albumCoverUrl: '',
      coverGradient: coverGradient(n),
      tracks, covers,
      cover: coverGradient(n),
      trackCount: count,
      ownedCount: owned,
      availableCount: owned,
    });
  }
  window.RILLIZ_DATA.fitclips = fitclips;
  window.getFitclip = (num) => fitclips.find(f => f.fitclipNumber === num) || null;

  // Normalize every track into the API-ready schema while preserving legacy
  // keys used by the current static UI.
  const tempoLabel = (bpm) => bpm < 100 ? 'LOW TEMPO' : (bpm <= 125 ? 'MEDIUM TEMPO' : 'HIGH TEMPO');
  const CATS = ['WARM UP', null, 'SPECIAL CHOREO', 'COOL DOWN', null];
  fitclips.forEach(fc => {
    fc.tracks = (fc.tracks || []).map((tr, i) => {
      const normalized = normalizeTrack(tr, fc, i);
      if (!normalized.tempoLabel) normalized.tempoLabel = tempoLabel(normalized.bpm);
      if (normalized.category === undefined) normalized.category = CATS[(fc.fitclipNumber + i) % CATS.length];
      return normalized;
    });
    fc.trackCount = fc.tracks.length;
    fc.ownedCount = fc.tracks.filter(window.canWatchTrack).length;
    fc.availableCount = fc.ownedCount;
    if (fc.fitclipNumber === 48) {
      base.tracks = fc.tracks;
      base.trackCount = fc.trackCount;
    }
  });

  // global lookup maps (tracks + covers across every fitclip)
  const allTracks = {}, allCovers = {};
  fitclips.forEach(fc => {
    (fc.tracks || []).forEach(tr => { allTracks[tr.id] = tr; allCovers[tr.id] = (fc.covers && fc.covers[tr.id]) || fc.cover; });
  });
  window.RILLIZ_DATA.allTracks = allTracks;
  window.RILLIZ_DATA.allCovers = allCovers;
})();

window.RILLIZ_COPY = {
  KR: {
    hero_eyebrow: '이번 주 신곡',
    section_featured: '주목할 안무',
    section_drops: '이번 주의 릴리즈',
    section_choreographers: '주목할 안무가',
    cta_watch: '시청하기',
    cta_save: '저장',
    cta_learned: '학습 완료',
    nav_rilliz: '릴리즈',
    nav_choreographers: '안무가',
    nav_routine: '내 루틴',
    nav_search: '검색',
  },
  JP: {
    hero_eyebrow: '今週のリリース',
    section_featured: '注目の振付',
    section_drops: '今週のドロップ',
    section_choreographers: '注目の振付師',
    cta_watch: '視聴する',
    cta_save: '保存',
    cta_learned: '習得済み',
    nav_rilliz: 'リリーズ',
    nav_choreographers: '振付師',
    nav_routine: 'マイルーティン',
    nav_search: '検索',
  },
  EN: {
    hero_eyebrow: 'This week',
    section_featured: 'Featured choreography',
    section_drops: "This week's drops",
    section_choreographers: 'Featured choreographers',
    cta_watch: 'Watch',
    cta_save: 'Save',
    cta_learned: 'Mark learned',
    nav_rilliz: 'RILLIZ',
    nav_choreographers: 'Choreographers',
    nav_routine: 'My routine',
    nav_search: 'Search',
  },
};
