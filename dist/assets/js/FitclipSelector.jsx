// FITHOP — FITCLIP Album Selector. Slides down from the top when VIDEO is tapped.
// Cover-flow carousel + full grid + quick search. Dark theme, violet accent.
const { useState: useFsState, useEffect: useFsEffect, useRef: useFsRef } = React;

// ---- cover artwork (2-line FITCLIP / number poster) -------------------
function FitclipCoverArtwork({ fc, size = 'lg', selected = false }) {
  const bg = fc.albumCoverUrl
    ? { backgroundImage: `url(${fc.albumCoverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: fc.coverGradient };
  return (
    <div className={`fs-art ${size}`} data-selected={selected} style={bg}>
      {!fc.albumCoverUrl ? (
        <div className="fs-art-text">
          <span className="lbl">FITCLIP</span>
          <span className="num">{fc.fitclipNumber}</span>
        </div>
      ) : null}
      <div className="fs-art-sheen" />
    </div>
  );
}

// ---- cover-flow carousel ---------------------------------------------
function FitclipCoverFlow({ fitclips, focus, setFocus, onApply, maxNumber }) {
  const startX = useFsRef(null);
  const stageRef = useFsRef(null);
  const lastWheel = useFsRef(0);
  const onDown = (e) => { startX.current = (e.touches ? e.touches[0].clientX : e.clientX); };
  const onUp = (e) => {
    if (startX.current == null) return;
    const x = (e.changedTouches ? e.changedTouches[0].clientX : e.clientX);
    const dx = x - startX.current; startX.current = null;
    if (Math.abs(dx) < 40) return;
    setFocus(f => Math.min(maxNumber, Math.max(1, f + (dx < 0 ? 1 : -1))));
  };

  // mouse-wheel navigation (throttled, carousel only, no page scroll)
  useFsEffect(() => {
    const el = stageRef.current; if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastWheel.current < 320) return;
      const d = e.deltaY || e.deltaX;
      if (!d) return;
      lastWheel.current = now;
      setFocus(f => Math.min(maxNumber, Math.max(1, f + (d > 0 ? 1 : -1))));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [maxNumber]);

  // transform presets by absolute offset
  const layout = (offset) => {
    const a = Math.abs(offset);
    const dir = Math.sign(offset);
    if (a === 0) return { tx: 0, scale: 1, rot: 0, z: 10, op: 1 };
    if (a === 1) return { tx: dir * 165, scale: 0.72, rot: dir * -30, z: 8, op: 0.6 };
    if (a === 2) return { tx: dir * 290, scale: 0.52, rot: dir * -36, z: 6, op: 0.3 };
    return { tx: dir * 380, scale: 0.4, rot: dir * -40, z: 4, op: 0 };
  };

  const fcFocus = fitclips.find(x => x.fitclipNumber === focus);

  return (
    <div className="fs-flow">
      <button className="fs-arrow left" aria-label="prev" disabled={focus <= 1}
              onClick={() => setFocus(f => Math.max(1, f - 1))}><Icon.Back size={22} /></button>

      <div className="fs-stage" ref={stageRef} onMouseDown={onDown} onMouseUp={onUp}
           onTouchStart={onDown} onTouchEnd={onUp}>
        {fitclips.map(fc => {
          const offset = fc.fitclipNumber - focus;
          if (Math.abs(offset) > 2) return null;
          const L = layout(offset);
          return (
            <div key={fc.fitclipNumber} className="fs-slot"
                 style={{ transform: `translate(-50%,-50%) translateX(${L.tx}px) scale(${L.scale}) rotateY(${L.rot}deg)`, zIndex: L.z, opacity: L.op, pointerEvents: L.op ? 'auto' : 'none' }}
                 onClick={() => offset === 0 ? null : setFocus(fc.fitclipNumber)}
                 onDoubleClick={() => offset === 0 && onApply(fc.fitclipNumber)}>
              <FitclipCoverArtwork fc={fc} size="lg" selected={offset === 0} />
            </div>
          );
        })}
      </div>

      <button className="fs-arrow right" aria-label="next" disabled={focus >= maxNumber}
              onClick={() => setFocus(f => Math.min(maxNumber, f + 1))}><Icon.ChevronR size={22} /></button>
    </div>
  );
}

// ---- one grid card ----------------------------------------------------
function FitclipAlbumCard({ fc, t, isCurrent, isFocus, onFocus, onApply }) {
  return (
    <div className="fs-card" data-current={isCurrent} data-focus={isFocus}
         onClick={() => onFocus(fc.fitclipNumber)} onDoubleClick={() => onApply(fc.fitclipNumber)}>
      <FitclipCoverArtwork fc={fc} size="sm" selected={isCurrent} />
      <div className="fs-card-meta">
        <span className="no">FITCLIP {fc.fitclipNumber}</span>
        <span className="mo">{fc.uploadMonth}</span>
        <span className="tk">{fc.trackCount > 0 ? `${fc.trackCount} ${t.tracks}` : t.noTracks}</span>
      </div>
      {isCurrent ? <span className="fs-card-now">{t.nowPlaying}</span> : null}
    </div>
  );
}

// ---- full grid ---------------------------------------------------------
function FitclipAlbumGrid({ fitclips, t, current, focus, setFocus, onApply }) {
  return (
    <div className="fs-grid">
      {fitclips.slice().reverse().map(fc => (
        <FitclipAlbumCard key={fc.fitclipNumber} fc={fc} t={t}
                          isCurrent={fc.fitclipNumber === current}
                          isFocus={fc.fitclipNumber === focus}
                          onFocus={setFocus} onApply={onApply} />
      ))}
    </div>
  );
}

// ---- quick search -----------------------------------------------------
function FitclipQuickSearch({ t, onJump, maxNumber }) {
  const [val, setVal] = useFsState('');
  const [err, setErr] = useFsState(false);
  const submit = () => {
    const n = parseInt(val, 10);
    if (n >= 1 && n <= maxNumber) { onJump(n); setErr(false); }
    else setErr(true);
  };
  return (
    <div className="fs-search">
      <div className="fs-search-row">
        <Icon.Search size={16} />
        <input className="fs-search-input" inputMode="numeric" value={val}
               placeholder={t.searchFitclipNumber}
               onChange={(e) => { setVal(e.target.value.replace(/[^0-9]/g, '')); setErr(false); }}
               onKeyDown={(e) => { if (e.key === 'Enter') submit(); }} />
        <button className="fs-search-go" onClick={submit} disabled={!val}>{t.select}</button>
      </div>
      {err ? <span className="fs-search-err">{t.fitclipNotFound}</span> : null}
    </div>
  );
}

// ---- the panel --------------------------------------------------------
function FitclipAlbumSelector() {
  const f = useFithop();
  const t = f.t;
  const fitclips = window.RILLIZ_DATA.fitclips;
  const maxNumber = f.maxFitclipNumber || fitclips.reduce((max, fc) => Math.max(max, fc.fitclipNumber), 1);

  const [view, setView] = useFsState('flow');   // flow | grid
  const [focus, setFocus] = useFsState(f.selectedFitclip);
  const trackLimit = (typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches) ? 6 : 3;

  const open = f.selectorOpen;

  useFsEffect(() => { if (open) { setFocus(f.selectedFitclip); setView('flow'); } }, [open]);

  useFsEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') f.setSelectorOpen(false);
      else if (view === 'flow' && e.key === 'ArrowLeft') setFocus(n => Math.max(1, n - 1));
      else if (view === 'flow' && e.key === 'ArrowRight') setFocus(n => Math.min(maxNumber, n + 1));
    };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [open, view, maxNumber]);

  const close = () => f.setSelectorOpen(false);
  const apply = (n) => { f.setSelectedFitclip(n); f.setSelectorOpen(false); };
  const focusFc = fitclips.find(x => x.fitclipNumber === focus) || fitclips[fitclips.length - 1];

  return (
    <div className={`fs-root ${open ? 'open' : ''}`} aria-hidden={!open}>
      <div className="fs-overlay" onClick={close} />
      <section className="fs-panel" role="dialog" aria-modal="true" aria-label={t.selectAlbum}>
        <header className="fs-head">
          <div className="fs-head-titles">
            <h2>{t.selectAlbum}</h2>
            <p>{t.chooseFitclip}</p>
          </div>
          <div className="fs-head-tools">
            <button className="fs-viewtoggle" data-on={view === 'grid'}
                    onClick={() => setView(v => v === 'flow' ? 'grid' : 'flow')}>
              <Icon.Albums size={16} />{t.viewAllFitclips}
            </button>
            <button className="fh-icon-btn" onClick={close} aria-label={t.close}><Icon.Close size={20} /></button>
          </div>
        </header>

        <FitclipQuickSearch t={t} maxNumber={maxNumber} onJump={(n) => { setFocus(n); setView('flow'); }} />

        <div className="fs-body">
          {view === 'flow' ? (
            <React.Fragment>
              <FitclipCoverFlow fitclips={fitclips} focus={focus} setFocus={setFocus} onApply={apply} maxNumber={maxNumber} />
              <div className="fs-focusinfo">
                <div className="fs-focusmeta">
                  <span className="no">FITCLIP {focusFc.fitclipNumber}</span>
                  <span className="sub">{focusFc.uploadMonth} · {focusFc.trackCount > 0 ? `${focusFc.trackCount} ${t.tracks}` : t.noTracks}</span>
                  {focusFc.trackCount > 0 ? (
                    <span className="own">{focusFc.ownedCount} {t.owned} · {focusFc.availableCount} {t.available}</span>
                  ) : null}
                  {focus === f.selectedFitclip ? <span className="fs-cur-pill">{t.currentlySelected}</span> : null}
                </div>
                {focusFc.trackCount > 0 ? (
                  <div className="fs-tracklist">
                    <span className="hd">{t.tracks}</span>
                    {focusFc.tracks.slice(0, trackLimit).map((tr, i) => (
                      <span key={tr.id} className="ln" data-locked={!canWatchTrack(tr)}>
                        <span className="i">{i + 1}.</span> {tr.displayTitle || tr.title}
                      </span>
                    ))}
                    {focusFc.trackCount > trackLimit ? (
                      <span className="more">+{focusFc.trackCount - trackLimit} {t.moreTracks}</span>
                    ) : null}
                  </div>
                ) : null}
                <button className="fs-select" onClick={() => apply(focus)}>{t.select}</button>
              </div>
            </React.Fragment>
          ) : (
            <FitclipAlbumGrid fitclips={fitclips} t={t} current={f.selectedFitclip}
                              focus={focus} setFocus={(n) => { setFocus(n); setView('flow'); }} onApply={apply} />
          )}
        </div>
        <div className="fs-grip" />
      </section>
    </div>
  );
}

window.FitclipAlbumSelector = FitclipAlbumSelector;
