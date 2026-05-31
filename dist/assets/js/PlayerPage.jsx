const { useState } = React;

// ---- FITCLIP info bar (centered) + prev / next album --------------------
function FitclipSelector({ data }) {
  const f = useFithop();
  const t = f.t;
  return (
    <div className="pp-selector">
      <button className="pp-album-nav" aria-label={t.previousAlbum} disabled={data.fitclipNumber <= 1}
              onClick={() => f.stepAlbum(-1)}><Icon.Back size={20} /></button>
      <div className="pp-fitclip-center" role="button" tabIndex={0} aria-label={t.openAlbumSelector}
           onClick={() => f.setSelectorOpen(true)}
           onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); f.setSelectorOpen(true); } }}>
        <span className="no">FITCLIP {data.fitclipNumber}<span className="chev"><Icon.ChevronDown size={16} /></span></span>
        <span className="mo">{data.uploadMonth}</span>
      </div>
      <button className="pp-album-nav" aria-label={t.nextAlbum} disabled={data.fitclipNumber >= 48}
              onClick={() => f.stepAlbum(1)}><Icon.ChevronR size={20} /></button>
    </div>
  );
}

// ---- Video player block ----------------------------------------------
function VideoStage({ data, current, playing, onPlay }) {
  return (
    <div className="pp-video" style={{ background: data.covers[current.id] || data.cover }}>
      <div className="pp-video-shade" />
      <span className="pp-video-badge">NOW PLAYING</span>
      <button className="pp-video-play" onClick={onPlay} aria-label="Play/Pause">
        {playing ? <Icon.Pause size={28} /> : <Icon.Play size={28} />}
      </button>
      <div className="pp-video-scrub"><i /></div>
      <span className="pp-video-time">0:48 / {current.duration}</span>
    </div>
  );
}

// ---- Track info + player actions -------------------------------------
function TrackInfo({ current, mirror, setMirror }) {
  const f = useFithop();
  const t = f.t;
  const fav = f.isFav(current.id);
  return (
    <React.Fragment>
      <div className="pp-trackinfo">
        <h1>{current.displayTitle || current.title}</h1>
        <div className="credit">Choreography by <strong style={{ color: 'var(--fg-1)', fontWeight: 600 }}>{current.choreo || current.choreographer}</strong></div>
        <div className="meta">
          <span>{current.bpm} BPM</span><span className="dot">·</span>
          <span>{current.duration}</span><span className="dot">·</span>
          <span className="diff">#{current.difficulty}</span>
        </div>
      </div>
      <div className="pp-actions">
        <button className="pp-action" data-on={mirror} onClick={() => setMirror(m => !m)}>
          <Icon.Mirror size={16} /><span>{t.mirror}</span>
        </button>
        <button className="pp-action ghost" data-on={fav}
                onClick={() => { f.toggleFav(current.id); f.showToast(fav ? t.removeFromFavorites : t.addToFavorites); }}>
          {fav ? <Icon.HeartFill size={16} /> : <Icon.Heart size={16} />}<span>{t.favorite}</span>
        </button>
        <button className="pp-action ghost">
          <Icon.Speed size={16} /><span>1.0×</span>
        </button>
      </div>
    </React.Fragment>
  );
}

// ---- One track row ----------------------------------------------------
function TrackRow({ data, track, isCurrent, playing, onSelect, onMenu }) {
  const f = useFithop();
  const t = f.t;
  const fav = f.isFav(track.id);
  const canWatch = canWatchTrack(track);
  return (
    <div className="pp-row" data-current={isCurrent} data-locked={!canWatch}
         onClick={() => canWatch && onSelect(track)}>
      <div className="idx">
        {isCurrent && playing
          ? <span className="pp-eq" aria-label="playing"><i /><i /><i /></span>
          : track.n}
      </div>
      <div className="pp-thumb" style={{ background: data.covers[track.id] }}>
        {!canWatch ? (
          <span className="lock"><Icon.Lock size={16} /></span>
        ) : null}
      </div>
      <div className="pp-rowtext">
        <span className="t">{track.displayTitle || track.title}</span>
        <span className="s">
          <span>{track.choreo || track.choreographer}</span><span className="dot">·</span><span>{track.duration}</span>
        </span>
      </div>
      <div className="pp-rowend">
        {!canWatch ? (
          <button className="pp-buy" onClick={(e) => e.stopPropagation()}>
            <Icon.Lock size={13} />{getPurchaseButtonLabel(track, t)}
          </button>
        ) : (
          <span className="pp-dur">{track.duration}</span>
        )}
        <button className="pp-row-fav" data-on={fav}
                aria-label={fav ? t.removeFromFavorites : t.addToFavorites}
                onClick={(e) => { e.stopPropagation(); f.toggleFav(track.id); f.showToast(fav ? t.removeFromFavorites : t.addToFavorites); }}>
          {fav ? <Icon.HeartFill size={16} /> : <Icon.Heart size={16} />}
        </button>
        <button className="pp-more" onClick={(e) => { e.stopPropagation(); onMenu(track); }} aria-label="More"><Icon.More size={18} /></button>
      </div>
    </div>
  );
}

// ---- Track list panel (right column) ---------------------------------
function TrackPanel({ data, current, playing, onSelect, onMenu }) {
  const f = useFithop();
  const t = f.t;
  const ids = (data.tracks || []).map(tr => tr.id);
  const allFav = ids.length > 0 && ids.every(id => f.isFav(id));
  const hasTracks = data.tracks && data.tracks.length > 0;
  const onAlbumFav = () => {
    if (!hasTracks) return;
    if (allFav) { f.unfavoriteAll(ids); f.showToast(t.removeFromFavorites); }
    else { f.favoriteAll(ids); f.showToast(t.addToFavorites); }
  };
  return (
    <div className="pp-panel">
      <div className="pp-panel-head">
        <div className="titles">
          <span className="eyebrow">{t.trackList}</span>
          <span className="count">{data.trackCount} {t.tracks.toUpperCase()}</span>
        </div>
        <button className="pp-fav-btn" data-on={allFav} aria-label={t.favorite} disabled={!hasTracks}
                onClick={onAlbumFav}>
          {allFav ? <Icon.HeartFill size={16} /> : <Icon.Heart size={16} />}
        </button>
        <button className="pp-add" disabled={!current} onClick={() => current && onMenu(current)}><Icon.Plus size={14} />{t.addToPlaylist}</button>
      </div>
      <div className="pp-list">
        {hasTracks ? data.tracks.map(tr => (
          <TrackRow key={tr.id} data={data} track={tr}
                    isCurrent={current && tr.id === current.id} playing={playing}
                    onSelect={onSelect} onMenu={onMenu} />
        )) : (
          <div className="fh-pp-empty sm"><span className="ic"><Icon.Playlist size={26} /></span><p className="ti">{t.noTracks}</p></div>
        )}
      </div>
    </div>
  );
}

// ---- Page -------------------------------------------------------------
function firstPlayable(tracks) {
  if (!tracks || tracks.length === 0) return null;
  return tracks.find(canWatchTrack) || tracks[0];
}

function PlayerPage() {
  const f = useFithop();
  const data = f.currentFitclip;

  const [current, setCurrent] = useState(() => firstPlayable(data.tracks));
  const [playing, setPlaying] = useState(true);
  const [mirror, setMirror] = useState(false);
  const [menuTrack, setMenuTrack] = useState(null);

  const onSelect = (track) => { setCurrent(track); setPlaying(true); };

  // when the selected FITCLIP changes, reset to its first playable track
  React.useEffect(() => {
    setCurrent(firstPlayable(data.tracks));
    setPlaying(data.tracks && data.tracks.length > 0);
  }, [f.selectedFitclip, f.subscriptionVersion, f.purchaseVersion]);

  // dummy "play this track" requests from the playlist / queue
  React.useEffect(() => {
    if (!f.playRequest) return;
    const tr = f.trackById(f.playRequest.id);
    if (!tr) return;
    const inCurrent = (data.tracks || []).some(x => x.id === tr.id);
    if (!inCurrent) {
      const owner = window.RILLIZ_DATA.fitclips.find(fc => (fc.tracks || []).some(x => x.id === tr.id));
      if (owner) f.setSelectedFitclip(owner.fitclipNumber);
    }
    setCurrent(tr); setPlaying(true);
  }, [f.playRequest]);

  const miniRelease = current ? {
    title: current.displayTitle || current.title,
    choreographer: current.choreo || current.choreographer,
    duration: current.duration,
    cover: f.coverById(current.id) || data.cover,
  } : null;

  const hasTracks = data.tracks && data.tracks.length > 0;

  return (
    <React.Fragment>
      <TopNav copy={f.t} onOpenAccount={() => f.setAccountOpen(true)} onOpenPlaylists={() => f.setPlaylistOpen(true)} onOpenSearch={() => f.setSearchOpen(true)} />

      <div className="pp-root" data-dimmed={f.selectorOpen}>
        <div className="pp-page">
          <div className="pp-layout">
            <div className="pp-left">
              <FitclipSelector data={data} />
              {hasTracks && current ? (
                <React.Fragment>
                  <VideoStage data={data} current={current} playing={playing} onPlay={() => setPlaying(p => !p)} />
                  <TrackInfo current={current} mirror={mirror} setMirror={setMirror} />
                </React.Fragment>
              ) : (
                <div className="pp-video" style={{ background: data.cover, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ font: '600 15px/1.4 var(--font-sans)', color: 'var(--fg-3)' }}>{f.t.noTracks}</span>
                </div>
              )}
            </div>

            <aside className="pp-right">
              <TrackPanel data={data} current={current} playing={playing} onSelect={onSelect} onMenu={setMenuTrack} />
            </aside>
          </div>
        </div>

        {miniRelease ? (
          <MiniPlayer release={miniRelease} playing={playing} onPlay={() => setPlaying(p => !p)} progress={0.38} />
        ) : null}
      </div>

      <TrackMenu track={menuTrack} onClose={() => setMenuTrack(null)} />
      <AccountView />
      <AdminView />
      <PlaylistPanel />
      <QueueSheet />
      <FitclipAlbumSelector />
      <SongSearch />
      <Toast />
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <FithopProvider><PlayerPage /></FithopProvider>
);
