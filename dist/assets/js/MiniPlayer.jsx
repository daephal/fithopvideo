function MiniPlayer({ release, playing, onPlay, progress = 0.55 }) {
  if (!release) return null;
  const f = useFithop();
  const hasQueue = f.queue.length > 0;
  const [t, total] = ['1:12', release.duration || '2:14'];
  return (
    <div className="mini-player" style={miniPlayerStyles.wrap}>
      {/* progress bar sits on the top frame divider line */}
      <div style={miniPlayerStyles.topScrub}>
        <div style={{ ...miniPlayerStyles.topScrubFill, width: `${progress * 100}%` }} />
        <div style={{ ...miniPlayerStyles.topScrubKnob, left: `${progress * 100}%` }} />
      </div>

      <div style={miniPlayerStyles.inner}>
        {/* Left: track */}
        <div style={miniPlayerStyles.left}>
          <div style={miniPlayerStyles.trackText}>
            <div style={miniPlayerStyles.title}>{release.title}</div>
            <div style={miniPlayerStyles.artist}>{release.choreographer} · {total}</div>
          </div>
          <button style={miniPlayerStyles.iconBtn} aria-label="Like"><Icon.Heart size={18}/></button>
        </div>

        {/* Center: transport + time */}
        <div style={miniPlayerStyles.center}>
          <div style={miniPlayerStyles.transport}>
            <button style={miniPlayerStyles.transportBtn} aria-label="Prev" onClick={() => f.queueStep(-1)}><Icon.Prev size={18}/></button>
            <button style={miniPlayerStyles.playBtn} onClick={onPlay} aria-label="Play/Pause">
              {playing ? <Icon.Pause size={16}/> : <Icon.Play size={16}/>}
            </button>
            <button style={miniPlayerStyles.transportBtn} aria-label="Next" onClick={() => f.queueStep(1)}><Icon.Next size={18}/></button>
          </div>
          <div style={miniPlayerStyles.timeRow}>
            <span style={miniPlayerStyles.time}>{t}</span>
            <span style={{ ...miniPlayerStyles.time, color: 'var(--fg-4)' }}>/</span>
            <span style={{ ...miniPlayerStyles.time, color: 'var(--fg-3)' }}>{total}</span>
          </div>
        </div>

        {/* Right: tools */}
        <div style={miniPlayerStyles.right}>
          <button style={{ ...miniPlayerStyles.iconBtn, ...(f.queueOpen ? miniPlayerStyles.iconBtnOn : null) }}
                  aria-label={f.t.queue_title} onClick={() => f.setQueueOpen(o => !o)} disabled={!hasQueue}>
            <Icon.Queue size={18}/>
          </button>
          <button style={miniPlayerStyles.iconBtn} aria-label="Volume"><Icon.Volume size={18}/></button>
          <button style={miniPlayerStyles.iconBtn} aria-label="Fullscreen"><Icon.Fullscreen size={18}/></button>
        </div>
      </div>
    </div>
  );
}

const miniPlayerStyles = {
  wrap: {
    position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 60,
    background: 'rgba(14,14,18,0.78)',
    backdropFilter: 'blur(40px) saturate(180%)',
    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
    borderTop: '1px solid var(--line-1)',
  },
  topScrub: {
    position: 'absolute', top: -1, left: 0, right: 0, height: 3,
    background: 'rgba(255,255,255,0.10)', cursor: 'pointer',
  },
  topScrubFill: { position: 'absolute', inset: '0 auto 0 0', background: 'var(--violet-400)' },
  topScrubKnob: { position: 'absolute', top: '50%', width: 11, height: 11, borderRadius: 999, background: '#fff', transform: 'translate(-50%, -50%)', boxShadow: '0 0 0 4px rgba(140,83,255,0.25)' },
  inner: {
    maxWidth: 1440, margin: '0 auto', height: 80,
    display: 'grid', gridTemplateColumns: '1.9fr 1fr 0.7fr',
    alignItems: 'center', gap: 24, padding: '0 24px',
  },
  left: { display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 },
  trackText: { display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0, flex: 1 },
  title: { font: '700 18px/1.25 var(--font-sans)', letterSpacing: '-0.01em', color: 'var(--fg-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  artist: { font: '500 14px/1.2 var(--font-sans)', color: 'var(--fg-2)', letterSpacing: '0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },

  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 },
  transport: { display: 'flex', alignItems: 'center', gap: 16, color: 'var(--fg-1)' },
  transportBtn: { width: 32, height: 32, borderRadius: 999, background: 'rgba(255,255,255,0.1)', border: 0, color: 'var(--fg-1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  playBtn: { width: 36, height: 36, borderRadius: 999, background: '#fff', color: '#000', border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  timeRow: { display: 'flex', alignItems: 'center', gap: 6 },
  time: { font: '500 12px/1 var(--font-mono)', color: 'var(--fg-2)', fontVariantNumeric: 'tabular-nums' },

  right: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, color: 'var(--fg-2)' },
  iconBtn: { width: 36, height: 36, borderRadius: 8, background: 'transparent', border: 0, color: 'var(--fg-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  iconBtnOn: { background: 'rgba(113,40,245,0.18)', color: 'var(--violet-200)' },
};

window.MiniPlayer = MiniPlayer;
