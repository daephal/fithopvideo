// FITHOP — My Playlists side panel (right drawer, mirrors the account panel).
// Opened from the main top-bar playlist icon. Tabs: Playlists · Favorites.
// Views: list → detail. Create / rename / delete (confirm) / remove track / dummy play.
const { useState: usePLState, useEffect: usePLEffect } = React;

const FITCLIP_LABEL = 'FITCLIP · ILLIT — Magnetic';

function PlaylistThumbs({ trackIds }) {
  const covers = window.RILLIZ_DATA.allCovers;
  const ids = trackIds.slice(0, 3);
  if (ids.length === 0) {
    return <span className="fh-pp-thumb empty"><Icon.Playlist size={20} /></span>;
  }
  return (
    <span className="fh-pp-thumb stack" data-n={ids.length}>
      {ids.map((id, i) => <i key={id} style={{ background: covers[id], zIndex: 3 - i }} />)}
    </span>
  );
}

function TrackMeta({ tr }) {
  return (
    <span className="meta">
      <span>{FITCLIP_LABEL.split(' · ')[0]}</span>
      <span className="dot">·</span><span>{tr.bpm} BPM</span>
      <span className="dot">·</span><span>#{tr.difficulty}</span>
    </span>
  );
}

function PlaylistPanel() {
  const f = useFithop();
  const t = f.t;

  const [tab, setTab] = usePLState('playlists');   // playlists | favorites
  const [view, setView] = usePLState('list');      // list | detail
  const [detailId, setDetailId] = usePLState(null);
  const [creating, setCreating] = usePLState(false);
  const [name, setName] = usePLState('');
  const [renaming, setRenaming] = usePLState(false);
  const [renameVal, setRenameVal] = usePLState('');
  const [confirmDel, setConfirmDel] = usePLState(null);   // playlist id pending delete
  const [dragIdx, setDragIdx] = usePLState(null);
  const [overIdx, setOverIdx] = usePLState(null);

  const open = f.playlistOpen;

  // reset to a clean list view each time the panel opens
  usePLEffect(() => {
    if (open) { setView('list'); setTab('playlists'); setCreating(false); setName(''); setRenaming(false); setConfirmDel(null); }
  }, [open]);

  // body scroll lock + ESC to close
  usePLEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') f.setPlaylistOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [open]);

  if (!open) return null;

  const close = () => f.setPlaylistOpen(false);
  const stop = (e) => e.stopPropagation();
  const detail = f.playlists.find(p => p.id === detailId) || null;

  const onCreate = () => {
    const n = name.trim();
    if (!n) { f.showToast(t.name_required); return; }
    f.createPlaylist(n);
    setName(''); setCreating(false);
    f.showToast(t.added_to_playlist);
  };

  const openDetail = (pl) => { setDetailId(pl.id); setView('detail'); setRenaming(false); };

  const commitRename = () => { if (detail) f.renamePlaylist(detail.id, renameVal); setRenaming(false); };

  const doDelete = () => {
    const id = confirmDel;
    setConfirmDel(null);
    f.deletePlaylist(id);
    if (view === 'detail' && id === detailId) { setView('list'); setDetailId(null); }
  };

  const playTrack = (tr) => {
    if (tr.locked) { f.showToast(t.purchase_required); return; }
    f.requestPlay(tr.id);
    f.showToast(tr.title);
    if (window.matchMedia('(max-width: 767px)').matches) close();
  };

  // play a whole playlist (or favorites) in order, starting at startIndex
  const playList = (ids, title, source, startIndex = 0) => {
    f.playQueue(ids, title, source, startIndex);
    if (window.matchMedia('(max-width: 767px)').matches) close();
  };

  // ---------- detail view ----------
  function DetailView() {
    if (!detail) return null;
    const tracks = detail.trackIds.map(f.trackById).filter(Boolean);
    return (
      <React.Fragment>
        <div className="fh-pp-detailhead">
          <button className="fh-icon-btn" onClick={() => setView('list')} aria-label={t.cancel}><Icon.Back size={20} /></button>
          {renaming ? (
            <input className="fh-input sm grow" value={renameVal} autoFocus
                   onChange={(e) => setRenameVal(e.target.value)}
                   onKeyDown={(e) => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenaming(false); }} />
          ) : (
            <div className="fh-pp-detailtitle">
              <span className="nm">{detail.name}</span>
              <span className="ct">{detail.trackIds.length} {t.tracks_suffix === '곡' ? '트랙' : t.tracks_suffix.toUpperCase()}</span>
            </div>
          )}
          <div className="fh-pp-detailtools">
            {renaming ? (
              <React.Fragment>
                <button className="fh-btn ghost xs" onClick={() => setRenaming(false)}>{t.cancel}</button>
                <button className="fh-btn primary xs" onClick={commitRename}>{t.save}</button>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <button className="fh-icon-btn sm" onClick={() => { setRenameVal(detail.name); setRenaming(true); }} aria-label={t.edit}><Icon.Edit size={17} /></button>
                <button className="fh-icon-btn sm danger" onClick={() => setConfirmDel(detail.id)} aria-label={t.delete}><Icon.Trash size={17} /></button>
              </React.Fragment>
            )}
          </div>
        </div>

        <div className="fh-pp-scroll">
          {detail.trackIds.length > 0 ? (
            <div className="fh-pp-playbar">
              <button className="fh-btn primary" onClick={() => playList(detail.trackIds, detail.name, detail.id, 0)}>
                <Icon.Play size={15} />{t.play_all}
              </button>
            </div>
          ) : null}
          {tracks.length === 0 ? (
            <div className="fh-pp-empty sm">
              <span className="ic"><Icon.Playlist size={26} /></span>
              <p className="ti">{t.no_tracks}</p>
            </div>
          ) : tracks.map((tr, i) => {
            const isCur = f.queueSource === detail.id && f.queue[f.queueIndex] === tr.id;
            return (
              <div key={tr.id} className="fh-pp-track draggable" data-locked={tr.locked}
                   data-cur={isCur} data-drag={dragIdx === i} data-over={overIdx === i}
                   draggable
                   onDragStart={(e) => { setDragIdx(i); e.dataTransfer.effectAllowed = 'move'; }}
                   onDragOver={(e) => { e.preventDefault(); if (overIdx !== i) setOverIdx(i); }}
                   onDragEnd={() => { setDragIdx(null); setOverIdx(null); }}
                   onDrop={(e) => { e.preventDefault(); if (dragIdx !== null && dragIdx !== i) f.reorderPlaylist(detail.id, dragIdx, i); setDragIdx(null); setOverIdx(null); }}>
                <span className="grip" aria-hidden="true"><Icon.Grip size={18} /></span>
                <button className="play" onClick={() => playList(detail.trackIds, detail.name, detail.id, i)}>
                  <span className="th" style={{ background: window.RILLIZ_DATA.allCovers[tr.id] }}>
                    {tr.locked ? <span className="lk"><Icon.Lock size={14} /></span>
                      : isCur ? <span className="eqbadge"><i /><i /><i /></span> : null}
                  </span>
                  <span className="tx">
                    <span className="t">{tr.choreographer} — {tr.title}</span>
                    <TrackMeta tr={tr} />
                  </span>
                </button>
                {tr.locked ? <span className="needbuy">{t.purchase_required}</span> : null}
                <button className="fh-icon-btn sm" onClick={() => f.removeFromPlaylist(detail.id, tr.id)} aria-label={t.remove}><Icon.Close size={16} /></button>
              </div>
            );
          })}
        </div>
      </React.Fragment>
    );
  }

  // ---------- list view ----------
  function ListView() {
    const favTracks = f.favorites.map(f.trackById).filter(Boolean);
    return (
      <React.Fragment>
        <div className="fh-pp-tabs" role="tablist">
          <button role="tab" data-active={tab === 'playlists'} onClick={() => setTab('playlists')}>
            {t.my_playlists}<span className="n">{f.playlists.length}</span>
          </button>
          <button role="tab" data-active={tab === 'favorites'} onClick={() => setTab('favorites')}>
            {t.favorites}<span className="n">{favTracks.length}</span>
          </button>
        </div>

        <div className="fh-pp-scroll">
          {tab === 'playlists' ? (
            <React.Fragment>
              {creating ? (
                <div className="fh-pp-create">
                  <input className="fh-input" value={name} autoFocus placeholder={t.pl_name_ph}
                         onChange={(e) => setName(e.target.value)}
                         onKeyDown={(e) => { if (e.key === 'Enter') onCreate(); if (e.key === 'Escape') setCreating(false); }} />
                  <div className="row">
                    <button className="fh-btn ghost" onClick={() => { setCreating(false); setName(''); }}>{t.cancel}</button>
                    <button className="fh-btn primary" onClick={onCreate}>{t.create}</button>
                  </div>
                </div>
              ) : null}

              {f.playlists.length === 0 && !creating ? (
                <div className="fh-pp-empty">
                  <span className="ic"><Icon.Playlist size={30} /></span>
                  <p className="ti">{t.no_playlists}</p>
                  <p className="su">{t.pl_empty_sub}</p>
                  <button className="fh-btn primary" onClick={() => setCreating(true)}><Icon.Plus size={16} />{t.create_playlist}</button>
                </div>
              ) : null}

              {f.playlists.map(pl => {
                const last = pl.trackIds.length ? f.trackById(pl.trackIds[pl.trackIds.length - 1]) : null;
                return (
                  <div key={pl.id} className="fh-pp-card">
                    <button className="open" onClick={() => openDetail(pl)}>
                      <PlaylistThumbs trackIds={pl.trackIds} />
                      <span className="info">
                        <span className="nm">{pl.name}</span>
                        <span className="ct">{pl.trackIds.length} {t.tracks_suffix === '곡' ? '트랙' : 'TRACKS'}</span>
                        {last ? <span className="recent">{t.recently_added}: {last.choreographer} — {last.title}</span> : null}
                      </span>
                    </button>
                    <div className="tools">
                      <button className="fh-icon-btn sm" onClick={() => openDetail(pl)} aria-label={t.edit}><Icon.Edit size={16} /></button>
                      <button className="fh-icon-btn sm danger" onClick={() => setConfirmDel(pl.id)} aria-label={t.delete}><Icon.Trash size={16} /></button>
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          ) : (
            <React.Fragment>
              {favTracks.length === 0 ? (
                <div className="fh-pp-empty">
                  <span className="ic"><Icon.Heart size={30} /></span>
                  <p className="ti">{t.no_favorites}</p>
                  <p className="su">{t.pl_empty_sub}</p>
                </div>
              ) : favTracks.map((tr, i) => (
                <div key={tr.id} className="fh-pp-track" data-locked={tr.locked}
                     data-cur={f.queueSource === null && f.queueTitle === t.favorites && f.queue[f.queueIndex] === tr.id}>
                  <button className="play" onClick={() => playList(favTracks.map(x => x.id), t.favorites, null, i)}>
                    <span className="th" style={{ background: window.RILLIZ_DATA.allCovers[tr.id] }}>
                      {tr.locked ? <span className="lk"><Icon.Lock size={14} /></span> : null}
                    </span>
                    <span className="tx">
                      <span className="t">{tr.choreographer} — {tr.title}</span>
                      <TrackMeta tr={tr} />
                    </span>
                  </button>
                  {tr.locked ? <span className="needbuy">{t.purchase_required}</span> : null}
                  <button className="fh-icon-btn sm fav" onClick={() => f.toggleFav(tr.id)} aria-label={t.remove_favorite}><Icon.HeartFill size={16} /></button>
                </div>
              ))}
            </React.Fragment>
          )}
        </div>
      </React.Fragment>
    );
  }

  return (
    <div className="fh-acc-scrim" onClick={close}>
      <aside className="fh-acc fh-pp" onClick={stop} role="dialog" aria-modal="true" aria-label={t.my_playlists}>
        <header className="fh-acc-top">
          <div className="fh-acc-heading">
            <span className="lbl">FITHOP</span>
            <h2>{t.my_playlists}</h2>
            <p className="fh-pp-sub">{t.pl_subtitle}</p>
          </div>
          <button className="fh-icon-btn" onClick={close} aria-label={t.close}><Icon.Close size={20} /></button>
        </header>

        {view === 'list' && tab === 'playlists' && !creating ? (
          <div className="fh-pp-actionrow">
            <button className="fh-btn primary" onClick={() => setCreating(true)}><Icon.Plus size={16} />{t.create_playlist}</button>
          </div>
        ) : null}

        {view === 'detail' ? <DetailView /> : <ListView />}

        {confirmDel ? (
          <div className="fh-pp-confirm-scrim" onClick={() => setConfirmDel(null)}>
            <div className="fh-pp-confirm" onClick={stop} role="alertdialog" aria-modal="true">
              <h4>{t.delete_pl_title}</h4>
              <p>{t.delete_pl_body}</p>
              <div className="row">
                <button className="fh-btn ghost" onClick={() => setConfirmDel(null)}>{t.cancel}</button>
                <button className="fh-btn warn" onClick={doDelete}>{t.delete}</button>
              </div>
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
}

window.PlaylistPanel = PlaylistPanel;
