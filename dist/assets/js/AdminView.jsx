// FITHOP — localStorage-only admin console. No API/DB/payment integration.
const ADMIN_VERSION_PRESETS = [
  'ORIGINAL VERSION',
  'EASY VERSION',
  'SLOW VERSION',
  'BACK VIEW',
  'MIRROR VERSION',
];

const ADMIN_COVER_GRADIENTS = [
  'radial-gradient(120% 95% at 28% 8%, #8C53FF 0%, transparent 58%), radial-gradient(120% 90% at 90% 100%, #3A0E8C 0%, transparent 60%), linear-gradient(150deg, #14071f 0%, #050505 78%)',
  'radial-gradient(120% 95% at 28% 8%, #3B6BFF 0%, transparent 58%), radial-gradient(120% 90% at 90% 100%, #0A1B5C 0%, transparent 60%), linear-gradient(150deg, #080b19 0%, #050505 78%)',
  'radial-gradient(120% 95% at 28% 8%, #FF4DA6 0%, transparent 58%), radial-gradient(120% 90% at 90% 100%, #3A0A33 0%, transparent 60%), linear-gradient(150deg, #180713 0%, #050505 78%)',
  'radial-gradient(120% 95% at 28% 8%, #1FB85C 0%, transparent 58%), radial-gradient(120% 90% at 90% 100%, #06281A 0%, transparent 60%), linear-gradient(150deg, #06140f 0%, #050505 78%)',
  'radial-gradient(120% 95% at 28% 8%, #F5A623 0%, transparent 58%), radial-gradient(120% 90% at 90% 100%, #1E1000 0%, transparent 60%), linear-gradient(150deg, #160d03 0%, #050505 78%)',
];

function adminClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function adminCoverStyle(fc) {
  if (fc.albumCoverUrl) {
    return { backgroundImage: `url(${fc.albumCoverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' };
  }
  return { background: fc.coverGradient || fc.cover || ADMIN_COVER_GRADIENTS[0] };
}

function adminVersionDefaults(track) {
  const existing = Array.isArray(track.versions) ? track.versions : [];
  return ADMIN_VERSION_PRESETS.map((label) => {
    const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    const found = existing.find(v => v.id === id || v.label === label);
    return {
      id,
      label,
      provider: (found && found.provider) || track.videoProvider || 'placeholder',
      embedUrl: (found && found.embedUrl) || track.videoEmbedUrl || '',
    };
  });
}

function adminPrepareTrack(track, fitclipNumber, index) {
  const displayTitle = track.displayTitle || track.title || [track.artist, track.songTitle].filter(Boolean).join(' — ');
  const parts = displayTitle.split(' — ');
  const artist = track.artist || (parts.length > 1 ? parts[0] : '');
  const songTitle = track.songTitle || (parts.length > 1 ? parts.slice(1).join(' — ') : displayTitle);
  const prepared = {
    ...track,
    id: track.id || `admin_${fitclipNumber}_${Date.now().toString(36)}_${index + 1}`,
    fitclipNumber: Number(fitclipNumber),
    clipIndex: Number(track.clipIndex || track.n || index + 1),
    n: Number(track.clipIndex || track.n || index + 1),
    artist,
    songTitle,
    displayTitle,
    title: displayTitle,
    choreo: track.choreo || track.choreographer || '',
    choreographer: track.choreographer || track.choreo || '',
    bpm: Number(track.bpm) || 100,
    category: track.category || '',
    duration: track.duration || '0:00',
    videoProvider: track.videoProvider || 'placeholder',
    videoEmbedUrl: track.videoEmbedUrl || '',
    thumbnailUrl: track.thumbnailUrl || '',
    purchased: track.purchased !== false,
    subscriptionStatus: track.subscriptionStatus || 'active',
    paymentProvider: track.paymentProvider || 'cafe24',
    versions: Array.isArray(track.versions) && track.versions.length > 0 ? track.versions : [],
  };
  if (prepared.versions.length === 0) prepared.versions = adminVersionDefaults(prepared);
  return prepared;
}

function adminPrepareFitclip(fc) {
  const fitclipNumber = Number(fc.fitclipNumber) || 1;
  const tracks = (fc.tracks || []).map((tr, i) => adminPrepareTrack(tr, fitclipNumber, i));
  const covers = { ...(fc.covers || {}) };
  tracks.forEach(tr => {
    covers[tr.id] = covers[tr.id] || (tr.thumbnailUrl ? `url(${tr.thumbnailUrl})` : (fc.coverGradient || fc.cover || ADMIN_COVER_GRADIENTS[0]));
  });
  return {
    ...fc,
    fitclipNumber,
    uploadMonth: fc.uploadMonth || '',
    albumCoverUrl: fc.albumCoverUrl || '',
    coverGradient: fc.coverGradient || fc.cover || ADMIN_COVER_GRADIENTS[0],
    cover: fc.coverGradient || fc.cover || ADMIN_COVER_GRADIENTS[0],
    title: fc.title || fc.fitclip || `FITCLIP ${fitclipNumber}`,
    fitclip: fc.fitclip || fc.title || `FITCLIP ${fitclipNumber}`,
    trackCount: tracks.length,
    ownedCount: tracks.filter(canWatchTrack).length,
    availableCount: tracks.filter(canWatchTrack).length,
    isPublished: fc.isPublished !== false,
    tracks,
    covers,
  };
}

function adminNewTrack(fitclipNumber, index) {
  return adminPrepareTrack({
    id: `admin_${fitclipNumber}_${Date.now().toString(36)}`,
    clipIndex: index + 1,
    artist: '',
    songTitle: '',
    choreo: '',
    bpm: 100,
    category: '',
    duration: '0:00',
    videoProvider: 'placeholder',
    videoEmbedUrl: '',
    thumbnailUrl: '',
    purchased: true,
    subscriptionStatus: 'active',
    paymentProvider: 'cafe24',
  }, fitclipNumber, index);
}

function adminLoadFitclips() {
  const store = window.FITHOP_DATA_STORE;
  const stored = store && store.readAdminFitclips ? store.readAdminFitclips() : null;
  const source = stored || window.RILLIZ_DATA.adminFitclips || window.RILLIZ_DATA.fitclips || [];
  return source.map(adminPrepareFitclip).sort((a, b) => a.fitclipNumber - b.fitclipNumber);
}

function AdminView() {
  const f = useFithop();
  const t = f.t;
  const [fitclips, setFitclips] = React.useState(adminLoadFitclips);
  const [selectedNumber, setSelectedNumber] = React.useState(() => {
    const last = fitclips[fitclips.length - 1];
    return last ? last.fitclipNumber : 48;
  });
  const selected = fitclips.find(fc => fc.fitclipNumber === selectedNumber) || fitclips[0];
  const [draft, setDraft] = React.useState(() => adminClone(selected || adminPrepareFitclip(window.getFitclip(48))));
  const [trackIndex, setTrackIndex] = React.useState(0);
  const [notice, setNotice] = React.useState('');

  React.useEffect(() => {
    if (!selected) return;
    setDraft(adminClone(selected));
    setTrackIndex(0);
  }, [selectedNumber]);

  if (!f.adminOpen) return null;
  const close = () => f.setAdminOpen(false);
  const stop = (e) => e.stopPropagation();

  const flash = (message) => {
    setNotice(message);
    f.showToast(message);
  };

  const persistFitclips = (next, message) => {
    const prepared = next.map(adminPrepareFitclip).sort((a, b) => a.fitclipNumber - b.fitclipNumber);
    setFitclips(prepared);
    try { window.localStorage.setItem(window.FITHOP_ADMIN_STORAGE_KEY, JSON.stringify(prepared)); } catch (e) {}
    if (window.FITHOP_DATA_STORE) window.FITHOP_DATA_STORE.installFitclips(prepared);
    if (f.refreshCatalog) f.refreshCatalog();
    if (message) flash(message);
    return prepared;
  };

  const saveDraft = () => {
    const prepared = adminPrepareFitclip(draft);
    const exists = fitclips.some(fc => fc.fitclipNumber === prepared.fitclipNumber);
    const next = exists
      ? fitclips.map(fc => fc.fitclipNumber === prepared.fitclipNumber ? prepared : fc)
      : [...fitclips, prepared];
    persistFitclips(next, '저장되었습니다.');
    setSelectedNumber(prepared.fitclipNumber);
    setDraft(adminClone(prepared));
    if (prepared.isPublished) f.setSelectedFitclip(prepared.fitclipNumber);
  };

  const createFitclip = () => {
    const maxNumber = fitclips.reduce((max, fc) => Math.max(max, fc.fitclipNumber), 0);
    const nextNumber = maxNumber + 1;
    const created = adminPrepareFitclip({
      fitclipNumber: nextNumber,
      uploadMonth: '',
      albumCoverUrl: '',
      coverGradient: ADMIN_COVER_GRADIENTS[(nextNumber - 1) % ADMIN_COVER_GRADIENTS.length],
      title: `FITCLIP ${nextNumber}`,
      isPublished: true,
      tracks: [],
    });
    persistFitclips([...fitclips, created], '새 FITCLIP이 저장되었습니다.');
    setSelectedNumber(nextNumber);
  };

  const deleteFitclip = () => {
    if (!draft) return;
    const next = fitclips.filter(fc => fc.fitclipNumber !== draft.fitclipNumber);
    const prepared = persistFitclips(next, 'FITCLIP이 삭제되었습니다.');
    const fallback = prepared[prepared.length - 1];
    if (fallback) setSelectedNumber(fallback.fitclipNumber);
  };

  const resetData = () => {
    const defaults = window.FITHOP_DATA_STORE ? window.FITHOP_DATA_STORE.getDefaultFitclips().map(adminPrepareFitclip) : [];
    try { window.localStorage.removeItem(window.FITHOP_ADMIN_STORAGE_KEY); } catch (e) {}
    if (window.FITHOP_DATA_STORE) window.FITHOP_DATA_STORE.resetAdminFitclips();
    setFitclips(defaults);
    const fallback = defaults[defaults.length - 1];
    if (fallback) {
      setSelectedNumber(fallback.fitclipNumber);
      setDraft(adminClone(fallback));
      f.setSelectedFitclip(fallback.fitclipNumber);
    }
    if (f.refreshCatalog) f.refreshCatalog();
    flash('관리자 데이터가 초기화되었습니다.');
  };

  const updateDraft = (patch) => setDraft(prev => ({ ...prev, ...patch }));
  const updateTrack = (index, patch) => setDraft(prev => ({
    ...prev,
    tracks: (prev.tracks || []).map((tr, i) => i === index ? { ...tr, ...patch } : tr),
  }));
  const addTrack = () => {
    const next = adminNewTrack(Number(draft.fitclipNumber), (draft.tracks || []).length);
    setDraft(prev => ({ ...prev, tracks: [...(prev.tracks || []), next] }));
    setTrackIndex((draft.tracks || []).length);
  };
  const deleteTrack = (index) => {
    setDraft(prev => ({ ...prev, tracks: (prev.tracks || []).filter((_, i) => i !== index) }));
    setTrackIndex(i => Math.max(0, i - 1));
  };
  const updateVersion = (index, patch) => {
    updateTrack(trackIndex, {
      versions: ((draft.tracks || [])[trackIndex].versions || []).map((v, i) => i === index ? { ...v, ...patch } : v),
    });
  };
  const addVersion = () => {
    const tr = (draft.tracks || [])[trackIndex];
    if (!tr) return;
    const versions = Array.isArray(tr.versions) ? tr.versions : [];
    updateTrack(trackIndex, {
      versions: [...versions, { id: `custom_${Date.now().toString(36)}`, label: 'CUSTOM VERSION', provider: tr.videoProvider || 'placeholder', embedUrl: '' }],
    });
  };
  const deleteVersion = (index) => {
    const tr = (draft.tracks || [])[trackIndex];
    if (!tr) return;
    updateTrack(trackIndex, { versions: (tr.versions || []).filter((_, i) => i !== index) });
  };

  const PreviewToggle = () => (
    <div className="adm-preview">
      <span className="lbl">{t.adminPreviewAs}</span>
      <div className="adm-seg" role="tablist">
        <button role="tab" data-on={f.isAdmin} onClick={() => f.setForcedAdmin(true)}>{t.roleAdmin}</button>
        <button role="tab" data-on={!f.isAdmin} onClick={() => f.setForcedAdmin(false)}>{t.roleUser}</button>
      </div>
    </div>
  );

  const Field = ({ label, children }) => (
    <label className="adm-field">
      <span>{label}</span>
      {children}
    </label>
  );

  const track = (draft.tracks || [])[trackIndex] || null;

  return (
    <div className="fh-acc-scrim" onClick={close}>
      <aside className="fh-acc adm" onClick={stop} role="dialog" aria-modal="true" aria-label={t.adminConsole}>
        <header className="fh-acc-top">
          <div className="fh-acc-heading">
            <span className="lbl">FITHOP ADMIN</span>
            <h2>{t.adminConsole}</h2>
          </div>
          <button className="fh-icon-btn" onClick={close} aria-label={t.close}><Icon.Close size={20} /></button>
        </header>

        <div className="fh-acc-body adm-body">
          <PreviewToggle />

          {f.isAdmin ? (
            <React.Fragment>
              <div className="adm-note">localStorage 전용 관리자 모드입니다. 실제 DB/API/결제/로그인은 연결하지 않았습니다.</div>
              {notice ? <div className="adm-save-note">{notice}</div> : null}

              <div className="adm-actions">
                <button className="fh-btn primary" onClick={createFitclip}><Icon.Plus size={16} />새 FITCLIP</button>
                <button className="fh-btn solid" onClick={saveDraft}><Icon.Check size={16} />저장</button>
                <button className="fh-btn ghost" onClick={deleteFitclip}><Icon.Trash size={16} />삭제</button>
                <button className="fh-btn warn" onClick={resetData}>데이터 초기화</button>
              </div>

              <div className="adm-workspace">
                <section className="adm-list">
                  <div className="adm-head"><span>FITCLIP 회차 목록</span><b>{fitclips.length}</b></div>
                  <div className="adm-list-scroll">
                    {fitclips.slice().reverse().map(fc => (
                      <button key={fc.fitclipNumber} className="adm-row" data-on={fc.fitclipNumber === draft.fitclipNumber}
                              onClick={() => setSelectedNumber(fc.fitclipNumber)}>
                        <span className="cover" style={adminCoverStyle(fc)} />
                        <span className="tx">
                          <strong>FITCLIP {fc.fitclipNumber}</strong>
                          <em>{fc.title || fc.fitclip}</em>
                          <i>{fc.uploadMonth || '-'} · {fc.trackCount || 0} {t.tracks}</i>
                        </span>
                        <span className="pub" data-on={fc.isPublished !== false}>{fc.isPublished !== false ? '공개' : '비공개'}</span>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="adm-editor">
                  <div className="adm-head">
                    <span>FITCLIP 정보</span>
                    <button className="adm-publish" data-on={draft.isPublished !== false}
                            onClick={() => updateDraft({ isPublished: !(draft.isPublished !== false) })}>
                      {draft.isPublished !== false ? '공개' : '비공개'}
                    </button>
                  </div>

                  <div className="adm-grid2">
                    <Field label="fitclipNumber"><input className="adm-input" type="number" value={draft.fitclipNumber} onChange={(e) => updateDraft({ fitclipNumber: e.target.value })} /></Field>
                    <Field label="uploadMonth"><input className="adm-input" value={draft.uploadMonth || ''} onChange={(e) => updateDraft({ uploadMonth: e.target.value })} placeholder="2026.05" /></Field>
                    <Field label="title"><input className="adm-input" value={draft.title || ''} onChange={(e) => updateDraft({ title: e.target.value })} /></Field>
                    <Field label="albumCoverUrl"><input className="adm-input" value={draft.albumCoverUrl || ''} onChange={(e) => updateDraft({ albumCoverUrl: e.target.value })} placeholder="https://..." /></Field>
                  </div>

                  <div className="adm-gradient-box">
                    <span className="adm-label">coverGradient</span>
                    <div className="adm-gradient-list">
                      {ADMIN_COVER_GRADIENTS.map(g => (
                        <button key={g} className="adm-gradient" data-on={draft.coverGradient === g} style={{ background: g }} onClick={() => updateDraft({ coverGradient: g })} />
                      ))}
                    </div>
                  </div>

                  <div className="adm-track-toolbar">
                    <div className="adm-head mini"><span>트랙</span><b>{(draft.tracks || []).length}</b></div>
                    <button className="fh-btn sm primary" onClick={addTrack}><Icon.Plus size={15} />트랙 추가</button>
                  </div>

                  <div className="adm-track-tabs">
                    {(draft.tracks || []).length === 0 ? <span className="adm-empty">트랙이 없습니다.</span> : null}
                    {(draft.tracks || []).map((tr, i) => (
                      <button key={tr.id} className="adm-track-tab" data-on={i === trackIndex} onClick={() => setTrackIndex(i)}>
                        <span>{tr.clipIndex || i + 1}</span>
                        <strong>{tr.artist || 'artist'}</strong>
                        <em>{tr.songTitle || 'songTitle'}</em>
                      </button>
                    ))}
                  </div>

                  {track ? (
                    <React.Fragment>
                      <div className="adm-head mini">
                        <span>트랙 정보</span>
                        <button className="fh-icon-btn sm danger" onClick={() => deleteTrack(trackIndex)} aria-label="트랙 삭제"><Icon.Trash size={16} /></button>
                      </div>
                      <div className="adm-grid2">
                        <Field label="clipIndex"><input className="adm-input" type="number" value={track.clipIndex} onChange={(e) => updateTrack(trackIndex, { clipIndex: e.target.value })} /></Field>
                        <Field label="artist"><input className="adm-input" value={track.artist || ''} onChange={(e) => updateTrack(trackIndex, { artist: e.target.value })} /></Field>
                        <Field label="songTitle"><input className="adm-input" value={track.songTitle || ''} onChange={(e) => updateTrack(trackIndex, { songTitle: e.target.value })} /></Field>
                        <Field label="choreo"><input className="adm-input" value={track.choreo || ''} onChange={(e) => updateTrack(trackIndex, { choreo: e.target.value })} /></Field>
                        <Field label="bpm"><input className="adm-input" type="number" value={track.bpm} onChange={(e) => updateTrack(trackIndex, { bpm: e.target.value })} /></Field>
                        <Field label="category">
                          <select className="adm-input" value={track.category || ''} onChange={(e) => updateTrack(trackIndex, { category: e.target.value })}>
                            <option value=""></option>
                            <option value="SPECIAL CHOREO">SPECIAL CHOREO</option>
                            <option value="WARM UP">WARM UP</option>
                            <option value="COOL DOWN">COOL DOWN</option>
                            <option value="LOW TEMPO">LOW TEMPO</option>
                            <option value="MEDIUM TEMPO">MEDIUM TEMPO</option>
                            <option value="HIGH TEMPO">HIGH TEMPO</option>
                          </select>
                        </Field>
                        <Field label="videoProvider">
                          <select className="adm-input" value={track.videoProvider || 'placeholder'} onChange={(e) => updateTrack(trackIndex, { videoProvider: e.target.value })}>
                            <option value="placeholder">placeholder</option>
                            <option value="youtube">youtube</option>
                            <option value="vimeo">vimeo</option>
                            <option value="file">file</option>
                          </select>
                        </Field>
                        <Field label="videoEmbedUrl"><input className="adm-input" value={track.videoEmbedUrl || ''} onChange={(e) => updateTrack(trackIndex, { videoEmbedUrl: e.target.value })} placeholder="https://..." /></Field>
                        <Field label="thumbnailUrl"><input className="adm-input" value={track.thumbnailUrl || ''} onChange={(e) => updateTrack(trackIndex, { thumbnailUrl: e.target.value })} placeholder="https://..." /></Field>
                      </div>

                      <div className="adm-version-head">
                        <span>버전 영상</span>
                        <button className="fh-btn xs ghost" onClick={addVersion}>버전 추가</button>
                      </div>
                      <div className="adm-version-list">
                        {(track.versions || []).map((version, i) => (
                          <div className="adm-version-row" key={version.id || i}>
                            <input className="adm-input" value={version.label || ''} onChange={(e) => updateVersion(i, { label: e.target.value })} />
                            <input className="adm-input" value={version.provider || ''} onChange={(e) => updateVersion(i, { provider: e.target.value })} placeholder="provider" />
                            <input className="adm-input" value={version.embedUrl || ''} onChange={(e) => updateVersion(i, { embedUrl: e.target.value })} placeholder="embedUrl" />
                            <button className="fh-icon-btn sm danger" onClick={() => deleteVersion(i)} aria-label="버전 삭제"><Icon.Close size={15} /></button>
                          </div>
                        ))}
                      </div>
                    </React.Fragment>
                  ) : null}
                </section>

                <section className="adm-main-preview">
                  <div className="adm-head"><span>미리보기</span><b>{draft.isPublished !== false ? '공개' : '비공개'}</b></div>
                  <div className="adm-cover-preview" style={adminCoverStyle(draft)}>
                    <span>FITCLIP</span><strong>{draft.fitclipNumber}</strong>
                  </div>
                  <div className="adm-preview-meta">
                    <strong>{draft.title || `FITCLIP ${draft.fitclipNumber}`}</strong>
                    <span>{draft.uploadMonth || '-'} · {(draft.tracks || []).length} {t.tracks}</span>
                  </div>
                  <div className="adm-preview-tracks">
                    {(draft.tracks || []).map(tr => (
                      <div className="adm-preview-track" key={tr.id}>
                        <span>{tr.clipIndex}</span>
                        <div>
                          <strong>{[tr.artist, tr.songTitle].filter(Boolean).join(' — ') || '-'}</strong>
                          <em>{tr.choreo || '-'} · {tr.bpm || 0} BPM · {tr.category || '-'}</em>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </React.Fragment>
          ) : (
            <div className="adm-deny">
              <span className="ic"><Icon.Lock size={30} /></span>
              <p className="ti">{t.noPermission}</p>
              <p className="su">{t.noPermissionSub}</p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

window.AdminView = AdminView;
