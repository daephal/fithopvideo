// FITHOP track "..." menu — favorite / add-to-playlist / track info / buy.
// Mobile: bottom sheet. Tablet+PC: centered panel (see .fh-sheet CSS).
const { useState: useTMState, useEffect: useTMEffect } = React;

function TrackMenu({ track, onClose }) {
  const f = useFithop();
  const t = f.t;
  const [view, setView] = useTMState('main');     // main | playlists | info
  const [creating, setCreating] = useTMState(false);
  const [name, setName] = useTMState('');

  useTMEffect(() => { if (track) { setView('main'); setCreating(false); setName(''); } }, [track]);
  if (!track) return null;

  const cover = window.RILLIZ_DATA.allCovers[track.id];
  const locked = track.locked;
  const fav = f.isFav(track.id);

  const onFav = () => { f.toggleFav(track.id); f.showToast(fav ? t.remove_favorite : t.add_favorite); onClose(); };
  const onAdd = (pl) => { const added = f.addToPlaylist(pl.id, track.id); f.showToast(added ? t.added_to_playlist : t.already_in_playlist); onClose(); };
  const onCreate = () => { const n = name.trim(); if (!n) return; const pl = f.createPlaylist(n); f.addToPlaylist(pl.id, track.id); f.showToast(t.added_to_playlist); onClose(); };

  const info = [
    [t.choreographer, track.choreographer],
    [t.bpm, track.bpm],
    [t.duration, track.duration],
    [t.difficulty, '#' + track.difficulty],
  ];

  return (
    <div className="fh-sheet-scrim" onClick={onClose}>
      <div className="fh-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="fh-sheet-grip" />

        <div className="fh-sheet-head">
          {view !== 'main'
            ? <button className="fh-icon-btn" onClick={() => setView('main')} aria-label="Back"><Icon.Back size={20} /></button>
            : null}
          <div className="fh-sheet-thumb" style={{ background: cover }} />
          <div className="fh-sheet-titles">
            <span className="t">{track.title}</span>
            <span className="s">{track.choreographer} · {track.duration}</span>
          </div>
          <button className="fh-icon-btn" onClick={onClose} aria-label="Close"><Icon.Close size={18} /></button>
        </div>

        {view === 'main' ? (
          <div className="fh-menu">
            <button className="fh-menu-item" onClick={onFav}>
              <span className="ic" data-on={fav}>{fav ? <Icon.HeartFill size={19} /> : <Icon.Heart size={19} />}</span>
              <span className="lb">{fav ? t.remove_favorite : t.add_favorite}</span>
            </button>
            <button className="fh-menu-item" onClick={() => setView('playlists')}>
              <span className="ic"><Icon.Plus size={19} /></span>
              <span className="lb">{t.add_to_playlist}</span>
              <Icon.ChevronR size={16} />
            </button>
            <button className="fh-menu-item" onClick={() => setView('info')}>
              <span className="ic"><Icon.Info size={19} /></span>
              <span className="lb">{t.track_info}</span>
            </button>
            {locked ? (
              <button className="fh-menu-item buy" onClick={() => { f.showToast(t.buy_now); onClose(); }}>
                <span className="ic"><Icon.Lock size={18} /></span>
                <span className="lb">{t.buy_now}</span>
                <span className="price">{track.price || '₩2,500'}</span>
              </button>
            ) : (
              <div className="fh-menu-item owned" aria-disabled="true">
                <span className="ic"><Icon.Check size={19} /></span>
                <span className="lb">{t.owned}</span>
              </div>
            )}
          </div>
        ) : null}

        {view === 'playlists' ? (
          <div className="fh-pl-list">
            {f.playlists.length === 0 && !creating ? <p className="fh-empty">{t.no_playlists}</p> : null}
            {f.playlists.map(pl => {
              const inIt = pl.trackIds.includes(track.id);
              return (
                <button key={pl.id} className="fh-pl-item" disabled={inIt} onClick={() => onAdd(pl)}>
                  <span className="ic"><Icon.Playlist size={18} /></span>
                  <span className="nm">{pl.name}</span>
                  <span className="ct">{pl.trackIds.length}{t.tracks_suffix}</span>
                  {inIt ? <span className="chk"><Icon.Check size={16} /></span> : null}
                </button>
              );
            })}
            {creating ? (
              <div className="fh-pl-create">
                <input className="fh-input" value={name} onChange={(e) => setName(e.target.value)}
                       placeholder={t.playlist_name} autoFocus
                       onKeyDown={(e) => { if (e.key === 'Enter') onCreate(); }} />
                <div className="row">
                  <button className="fh-btn ghost" onClick={() => setCreating(false)}>{t.cancel}</button>
                  <button className="fh-btn primary" onClick={onCreate} disabled={!name.trim()}>{t.create}</button>
                </div>
              </div>
            ) : (
              <button className="fh-pl-new" onClick={() => setCreating(true)}>
                <Icon.Plus size={18} />{t.create_playlist}
              </button>
            )}
          </div>
        ) : null}

        {view === 'info' ? (
          <div className="fh-info">
            {info.map(([k, v]) => (
              <div key={k} className="fh-info-row"><span className="k">{k}</span><span className="v">{v}</span></div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

window.TrackMenu = TrackMenu;
