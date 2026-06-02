// FITHOP — song search. Slides down from the top; searches every track across all FITCLIPs.
// Text (title/artist/bpm/category/fitclip#) + category/tempo filter chips.
const { useState: useSrState, useEffect: useSrEffect, useMemo: useSrMemo } = React;

const FILTERS = [
  { id: 'ALL', key: 'all' },
  { id: 'SPECIAL CHOREO', key: 'specialChoreo' },
  { id: 'WARM UP', key: 'warmUp' },
  { id: 'COOL DOWN', key: 'coolDown' },
  { id: 'LOW TEMPO', key: 'lowTempo' },
  { id: 'MEDIUM TEMPO', key: 'mediumTempo' },
  { id: 'HIGH TEMPO', key: 'highTempo' },
];
const TEMPOS = ['LOW TEMPO', 'MEDIUM TEMPO', 'HIGH TEMPO'];

function SongSearch() {
  const f = useFithop();
  const t = f.t;
  const [q, setQ] = useSrState('');
  const [filter, setFilter] = useSrState('ALL');

  const open = f.searchOpen;
  useSrEffect(() => { if (open) { setQ(''); setFilter('ALL'); } }, [open]);
  useSrEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') f.setSearchOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [open]);

  const results = useSrMemo(() => {
    if (!open) return [];
    const text = q.trim().toLowerCase();
    const out = [];
    window.RILLIZ_DATA.fitclips.slice().reverse().forEach(fc => {
      (fc.tracks || []).forEach(tr => {
        // filter match
        if (filter !== 'ALL') {
          const match = TEMPOS.includes(filter) ? tr.tempoLabel === filter : tr.category === filter;
          if (!match) return;
        }
        // text match
        if (text) {
          const hay = `${tr.displayTitle || tr.title} ${tr.artist || ''} ${tr.songTitle || ''} ${tr.choreo || tr.choreographer} ${tr.bpm} ${tr.category || ''} ${tr.tempoLabel} fitclip ${fc.fitclipNumber}`.toLowerCase();
          if (!hay.includes(text)) return;
        }
        out.push({ tr, fc });
      });
    });
    return out;
  }, [open, q, filter]);

  if (!open) return null;
  const close = () => f.setSearchOpen(false);

  const pick = ({ tr, fc }) => {
    f.setSelectedFitclip(fc.fitclipNumber);
    if (!canWatchTrack(tr)) { f.showToast(getTrackStatusLabel(tr, t)); }
    else { f.requestPlay(tr.id); }
    close();
  };

  return (
    <div className="fs-root open ss-root">
      <div className="fs-overlay" onClick={close} style={{ opacity: 1 }} />
      <section className="ss-panel" role="dialog" aria-modal="true" aria-label={t.searchSongs}>
        <header className="ss-head">
          <div className="ss-inputwrap">
            <Icon.Search size={18} />
            <input className="ss-input" autoFocus value={q} placeholder={t.searchPlaceholder}
                   onChange={(e) => setQ(e.target.value)} />
            {q ? <button className="ss-clear" onClick={() => setQ('')} aria-label={t.close}><Icon.Close size={16} /></button> : null}
          </div>
          <button className="fh-icon-btn" onClick={close} aria-label={t.close}><Icon.Close size={20} /></button>
        </header>

        <div className="ss-filters">
          {FILTERS.map(fl => (
            <button key={fl.id} className="ss-chip" data-on={filter === fl.id} onClick={() => setFilter(fl.id)}>
              {t[fl.key]}
            </button>
          ))}
        </div>

        <div className="ss-results">
          <div className="ss-results-head">
            <span>{t.searchResults}</span><span className="ct">{results.length}</span>
          </div>
          {results.length === 0 ? (
            <p className="fh-empty">{t.noSearchResults}</p>
          ) : results.map(({ tr, fc }) => (
            <button key={fc.fitclipNumber + '_' + tr.id} className="ss-row" data-locked={!canWatchTrack(tr)} onClick={() => pick({ tr, fc })}>
              <span className="th" style={{ background: window.RILLIZ_DATA.allCovers[tr.id] }}>
                {!canWatchTrack(tr) ? <span className="lk"><Icon.Lock size={13} /></span> : null}
              </span>
              <span className="tx">
                <span className="t">{tr.displayTitle || tr.title}</span>
                <span className="s">
                  <span className="fc">FITCLIP {fc.fitclipNumber}</span><span className="dot">·</span>
                  <span>{tr.choreo || tr.choreographer}</span><span className="dot">·</span>
                  <span>{tr.bpm} BPM</span><span className="dot">·</span>
                  <span>{tr.category || tr.tempoLabel}</span>
                </span>
              </span>
              {!canWatchTrack(tr)
                ? <span className="ss-need">{getTrackStatusLabel(tr, t)}</span>
                : <span className="ss-ok">{t.available}</span>}
            </button>
          ))}
        </div>
        <div className="fs-grip" />
      </section>
    </div>
  );
}

window.SongSearch = SongSearch;
