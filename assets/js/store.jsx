// FITHOP store — language + playlists + favorites (localStorage) + toast + account panel.
// Shared via React context. Other babel files read it through window.useFithop().

const FithopContext = React.createContext(null);

const LS = window.FITHOP_STORAGE_KEYS;
const { lsGet, lsSetRaw, lsSet } = window.FITHOP_STATE;

function detectLang() {
  try {
    const saved = localStorage.getItem(LS.lang);
    if (saved && ['KR', 'JP', 'EN'].includes(saved)) return saved;
  } catch (e) {}
  const n = (navigator.language || '').toLowerCase();
  if (n.startsWith('ja')) return 'JP';
  if (n.startsWith('en')) return 'EN';
  return 'KR';
}

// First-visit example playlists (only used when nothing is stored yet).
function seedPlaylists() {
  try { if (localStorage.getItem(LS.playlists) !== null) return lsGet(LS.playlists, []); } catch (e) {}
  return [
    { id: 'pl_seed_warmup', name: '나의 워밍업 루틴', trackIds: ['t1', 't2', 't3'] },
    { id: 'pl_seed_fav',    name: '좋아하는 안무',    trackIds: ['t2', 't4'] },
  ];
}

function FithopProvider({ children }) {
  const [lang, setLangState] = React.useState(detectLang);
  const [playlists, setPlaylists] = React.useState(seedPlaylists);
  const [favorites, setFavorites] = React.useState(() => lsGet(LS.favorites, ['t2']));
  const [toast, setToast] = React.useState(null);
  const [accountOpen, setAccountOpen] = React.useState(false);
  const [playlistOpen, setPlaylistOpen] = React.useState(false);
  const [selectorOpen, setSelectorOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [adminOpen, setAdminOpen] = React.useState(false);
  // dev-only preview override for the admin gate (null = use real check)
  const [forcedAdmin, setForcedAdmin] = React.useState(null);
  const [selectedFitclip, setSelectedFitclipState] = React.useState(() => {
    const n = parseInt(lsGet(LS.selectedFitclip, 48), 10);
    return (n >= 1 && n <= 48) ? n : 48;
  });
  const [playRequest, setPlayRequest] = React.useState(null);
  const [queue, setQueue] = React.useState([]);        // array of track ids (full playlist order)
  const [queueIndex, setQueueIndex] = React.useState(0);
  const [queueTitle, setQueueTitle] = React.useState('');
  const [queueSource, setQueueSource] = React.useState(null); // playlist id (or null)
  const [queueOpen, setQueueOpen] = React.useState(false);
  const toastTimer = React.useRef(null);

  React.useEffect(() => { lsSet(LS.playlists, playlists); }, [playlists]);
  React.useEffect(() => { lsSet(LS.favorites, favorites); }, [favorites]);

  const setLang = (l) => { setLangState(l); lsSetRaw(LS.lang, l); };
  const t = window.RILLIZ_COPY[lang] || window.RILLIZ_COPY.KR;

  // ---- access control (ISOLATED) -------------------------------------
  // Dummy for now. Later (Codex): replace `currentUser` with the real Cafe24
  // session and keep this email comparison — nothing else needs to change.
  const currentUser = window.RILLIZ_DATA.auth.currentUser;
  const computeIsAdmin = (user) =>
    !!user && user.loggedIn && window.RILLIZ_DATA.auth.adminEmails.includes(user.email);
  const realIsAdmin = computeIsAdmin(currentUser);
  const isAdmin = forcedAdmin === null ? realIsAdmin : forcedAdmin;

  const setSelectedFitclip = (n) => { const v = Math.min(48, Math.max(1, n)); setSelectedFitclipState(v); lsSet(LS.selectedFitclip, v); };
  const stepAlbum = (dir) => setSelectedFitclip(selectedFitclip + dir);
  const getFitclip = (n) => window.getFitclip(n);
  const currentFitclip = window.getFitclip(selectedFitclip) || window.getFitclip(48);

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };

  // ---- playlists ----
  const createPlaylist = (name) => {
    const pl = { id: 'pl_' + Date.now().toString(36), name: (name || '').trim() || 'New Playlist', trackIds: [] };
    setPlaylists(p => [...p, pl]);
    return pl;
  };
  const addToPlaylist = (plId, trackId) => {
    let added = false;
    setPlaylists(p => p.map(pl => {
      if (pl.id !== plId) return pl;
      if (pl.trackIds.includes(trackId)) return pl;
      added = true;
      return { ...pl, trackIds: [...pl.trackIds, trackId] };
    }));
    return added;
  };
  const removeFromPlaylist = (plId, trackId) =>
    setPlaylists(p => p.map(pl => pl.id === plId ? { ...pl, trackIds: pl.trackIds.filter(x => x !== trackId) } : pl));
  const renamePlaylist = (plId, name) =>
    setPlaylists(p => p.map(pl => pl.id === plId ? { ...pl, name: (name || '').trim() || pl.name } : pl));
  const deletePlaylist = (plId) => setPlaylists(p => p.filter(pl => pl.id !== plId));
  const reorderPlaylist = (plId, from, to) => {
    setPlaylists(p => p.map(pl => {
      if (pl.id !== plId) return pl;
      const arr = [...pl.trackIds];
      if (from < 0 || from >= arr.length || to < 0 || to >= arr.length) return pl;
      const [m] = arr.splice(from, 1); arr.splice(to, 0, m);
      return { ...pl, trackIds: arr };
    }));
    // keep the active queue in sync if it mirrors this playlist
    setQueueSource(src => {
      if (src === plId) {
        setQueue(q => {
          const arr = [...q];
          if (from < 0 || from >= arr.length || to < 0 || to >= arr.length) return q;
          const curId = arr[queueIndex];
          const [m] = arr.splice(from, 1); arr.splice(to, 0, m);
          const ni = arr.indexOf(curId); if (ni >= 0) setQueueIndex(ni);
          return arr;
        });
      }
      return src;
    });
  };

  // ---- favorites ----
  const isFav = (trackId) => favorites.includes(trackId);
  const toggleFav = (trackId) => setFavorites(f => f.includes(trackId) ? f.filter(x => x !== trackId) : [...f, trackId]);
  const favoriteAll = (ids) => setFavorites(f => Array.from(new Set([...f, ...ids])));
  const unfavoriteAll = (ids) => setFavorites(f => f.filter(x => !ids.includes(x)));

  // ---- track lookup (favorites/playlists store ids only) ----
  const trackById = (id) => (window.RILLIZ_DATA.allTracks[id] || null);
  const coverById = (id) => (window.RILLIZ_DATA.allCovers[id] || null);

  // ---- dummy "play this track in the main player" request ----
  const requestPlay = (trackId) => setPlayRequest({ id: trackId, ts: Date.now() });

  // ---- play queue ----
  const firstPlayable = (ids, from) => {
    for (let i = Math.max(0, from); i < ids.length; i++) { const tr = trackById(ids[i]); if (tr && canWatchTrack(tr)) return i; }
    for (let i = 0; i < ids.length; i++) { const tr = trackById(ids[i]); if (tr && canWatchTrack(tr)) return i; }
    return -1;
  };
  const playQueue = (trackIds, title, source, startIndex = 0) => {
    const ids = trackIds.filter(id => trackById(id));
    setQueue(ids); setQueueTitle(title || ''); setQueueSource(source || null);
    const i = firstPlayable(ids, startIndex);
    if (i < 0) { showToast(getTrackStatusLabel(ids.map(trackById).find(Boolean), t)); return; }
    setQueueIndex(i); requestPlay(ids[i]);
  };
  const playAt = (i) => {
    const id = queue[i]; const tr = trackById(id);
    if (!tr) return;
    if (!canWatchTrack(tr)) { showToast(getTrackStatusLabel(tr, t)); return; }
    setQueueIndex(i); requestPlay(id);
  };
  const queueStep = (dir) => {
    if (queue.length === 0) return;
    let i = queueIndex;
    for (let k = 0; k < queue.length; k++) {
      i += dir;
      if (i < 0 || i >= queue.length) return;
      const tr = trackById(queue[i]);
      if (tr && canWatchTrack(tr)) { setQueueIndex(i); requestPlay(queue[i]); return; }
    }
  };

  const value = {
    lang, setLang, t,
    playlists, createPlaylist, addToPlaylist, removeFromPlaylist, renamePlaylist, deletePlaylist, reorderPlaylist,
    favorites, isFav, toggleFav, favoriteAll, unfavoriteAll,
    toast, showToast,
    accountOpen, setAccountOpen,
    playlistOpen, setPlaylistOpen,
    selectorOpen, setSelectorOpen,
    searchOpen, setSearchOpen,
    adminOpen, setAdminOpen,
    currentUser, isAdmin, forcedAdmin, setForcedAdmin,
    selectedFitclip, setSelectedFitclip, stepAlbum, getFitclip, currentFitclip,
    playRequest, requestPlay,
    queue, queueIndex, queueTitle, queueSource, queueOpen, setQueueOpen,
    playQueue, playAt, queueStep,
    trackById, coverById,
  };
  return <FithopContext.Provider value={value}>{children}</FithopContext.Provider>;
}

const useFithop = () => React.useContext(FithopContext);

window.FithopProvider = FithopProvider;
window.useFithop = useFithop;
