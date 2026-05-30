// FITHOP — current play-queue. Slides up from the bottom (opened from the mini-player).
function QueueSheet() {
  const f = useFithop();
  const t = f.t;

  React.useEffect(() => {
    if (!f.queueOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') f.setQueueOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [f.queueOpen]);

  if (!f.queueOpen) return null;
  const close = () => f.setQueueOpen(false);
  const tracks = f.queue.map(id => f.trackById(id)).filter(Boolean);

  return (
    <div className="fh-q-scrim" onClick={close}>
      <div className="fh-q-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={t.queue_title}>
        <div className="fh-q-grip" />
        <div className="fh-q-head">
          <div className="fh-q-titles">
            <span className="lbl">{t.queue_title}</span>
            {f.queueTitle ? <span className="src">{f.queueTitle}</span> : null}
          </div>
          <span className="fh-count">{tracks.length}</span>
          <button className="fh-icon-btn" onClick={close} aria-label={t.close}><Icon.Close size={18} /></button>
        </div>

        <div className="fh-q-list">
          {tracks.length === 0 ? <p className="fh-empty">{t.queue_empty}</p> : null}
          {tracks.map((tr, i) => {
            const isCur = i === f.queueIndex;
            return (
              <button key={tr.id + '_' + i} className="fh-q-row" data-cur={isCur} data-locked={tr.locked}
                      onClick={() => { f.playAt(i); }}>
                <span className="num">
                  {isCur ? <span className="eqbadge"><i /><i /><i /></span> : (i + 1)}
                </span>
                <span className="th" style={{ background: window.RILLIZ_DATA.allCovers[tr.id] }}>
                  {tr.locked ? <span className="lk"><Icon.Lock size={13} /></span> : null}
                </span>
                <span className="tx">
                  <span className="t">{tr.choreographer} — {tr.title}</span>
                  <span className="s">{tr.bpm} BPM · #{tr.difficulty} · {tr.duration}</span>
                </span>
                {isCur ? <span className="nowtag">{t.now_playing}</span>
                  : tr.locked ? <span className="needbuy">{t.purchase_required}</span> : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

window.QueueSheet = QueueSheet;
