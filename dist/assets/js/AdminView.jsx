// FITHOP — localStorage-only admin console.
// No API, DB, payment, or login integration is connected here.

const ADMIN_FITCLIP_KEY = 'fithop-admin-fitclips';

const ADMIN_VERSION_TYPES = [
  { id: 'original', label: 'ORIGINAL VERSION' },
  { id: 'easy', label: 'EASY VERSION' },
  { id: 'slow', label: 'SLOW VERSION' },
  { id: 'back', label: 'BACK VIEW' },
  { id: 'mirror', label: 'MIRROR VERSION' },
];

const ADMIN_GRADIENTS = [
  'radial-gradient(120% 95% at 28% 8%, #8C53FF 0%, transparent 58%), radial-gradient(120% 90% at 90% 100%, #3A0E8C 0%, transparent 60%), linear-gradient(150deg, #14071f 0%, #050505 78%)',
  'radial-gradient(120% 95% at 28% 8%, #3B6BFF 0%, transparent 58%), radial-gradient(120% 90% at 90% 100%, #0A1B5C 0%, transparent 60%), linear-gradient(150deg, #080b19 0%, #050505 78%)',
  'radial-gradient(120% 95% at 28% 8%, #FF4DA6 0%, transparent 58%), radial-gradient(120% 90% at 90% 100%, #3A0A33 0%, transparent 60%), linear-gradient(150deg, #180713 0%, #050505 78%)',
  'radial-gradient(120% 95% at 28% 8%, #1FB85C 0%, transparent 58%), radial-gradient(120% 90% at 90% 100%, #06281A 0%, transparent 60%), linear-gradient(150deg, #06140f 0%, #050505 78%)',
  'radial-gradient(120% 95% at 28% 8%, #F5A623 0%, transparent 58%), radial-gradient(120% 90% at 90% 100%, #1E1000 0%, transparent 60%), linear-gradient(150deg, #160d03 0%, #050505 78%)',
];

const ADMIN_LABELS = {
  KR: {
    saved: '저장되었습니다.',
    localOnly: 'localStorage 전용 관리자 화면입니다. 실제 DB/API/결제/로그인은 연결되어 있지 않습니다.',
    fitclipList: 'FITCLIP 회차 목록',
    newFitclip: '새 FITCLIP',
    save: '저장',
    preview: '미리보기',
    published: '공개',
    hidden: '비공개',
    fitclipInfo: 'FITCLIP 정보',
    fitclipNumber: '회차',
    uploadMonth: '업로드 월',
    albumCoverUrl: '앨범 커버 URL',
    coverGradient: '커버 그라데이션',
    title: '제목',
    tracks: '트랙',
    addTrack: '트랙 추가',
    deleteTrack: '트랙 삭제',
    trackInfo: '트랙 정보',
    versions: '버전 영상',
    emptyTracks: '트랙이 없습니다.',
    selectTrack: '트랙을 선택하세요.',
    clipIndex: 'Clip Index',
    artist: 'Artist',
    songTitle: 'Song Title',
    choreo: 'Choreo',
    bpm: 'BPM',
    category: 'Category',
    duration: 'Duration',
    videoProvider: 'Video Provider',
    videoEmbedUrl: 'Video Embed URL',
    thumbnailUrl: 'Thumbnail URL',
    provider: 'Provider',
    embedUrl: 'Embed URL',
    resetVersions: '기본 버전 채우기',
  },
  EN: {
    saved: 'Saved.',
    localOnly: 'localStorage-only admin console. No real DB, API, payment, or login is connected.',
    fitclipList: 'FITCLIP List',
    newFitclip: 'New FITCLIP',
    save: 'Save',
    preview: 'Preview',
    published: 'Public',
    hidden: 'Private',
    fitclipInfo: 'FITCLIP Info',
    fitclipNumber: 'Number',
    uploadMonth: 'Upload Month',
    albumCoverUrl: 'Album Cover URL',
    coverGradient: 'Cover Gradient',
    title: 'Title',
    tracks: 'Tracks',
    addTrack: 'Add Track',
    deleteTrack: 'Delete Track',
    trackInfo: 'Track Info',
    versions: 'Version Videos',
    emptyTracks: 'No tracks.',
    selectTrack: 'Select a track.',
    clipIndex: 'Clip Index',
    artist: 'Artist',
    songTitle: 'Song Title',
    choreo: 'Choreo',
    bpm: 'BPM',
    category: 'Category',
    duration: 'Duration',
    videoProvider: 'Video Provider',
    videoEmbedUrl: 'Video Embed URL',
    thumbnailUrl: 'Thumbnail URL',
    provider: 'Provider',
    embedUrl: 'Embed URL',
    resetVersions: 'Fill Default Versions',
  },
  JP: {
    saved: '保存しました。',
    localOnly: 'localStorage専用の管理画面です。実際のDB/API/決済/ログインは接続されていません。',
    fitclipList: 'FITCLIP一覧',
    newFitclip: '新規FITCLIP',
    save: '保存',
    preview: 'プレビュー',
    published: '公開',
    hidden: '非公開',
    fitclipInfo: 'FITCLIP情報',
    fitclipNumber: '回',
    uploadMonth: 'アップロード月',
    albumCoverUrl: 'アルバムカバーURL',
    coverGradient: 'カバーグラデーション',
    title: 'タイトル',
    tracks: 'トラック',
    addTrack: 'トラック追加',
    deleteTrack: 'トラック削除',
    trackInfo: 'トラック情報',
    versions: 'バージョン動画',
    emptyTracks: 'トラックがありません。',
    selectTrack: 'トラックを選択してください。',
    clipIndex: 'Clip Index',
    artist: 'Artist',
    songTitle: 'Song Title',
    choreo: 'Choreo',
    bpm: 'BPM',
    category: 'Category',
    duration: 'Duration',
    videoProvider: 'Video Provider',
    videoEmbedUrl: 'Video Embed URL',
    thumbnailUrl: 'Thumbnail URL',
    provider: 'Provider',
    embedUrl: 'Embed URL',
    resetVersions: '基本バージョンを入力',
  },
};

function adminClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function adminCoverStyle(fitclip) {
  if (fitclip.albumCoverUrl) {
    return { backgroundImage: `url(${fitclip.albumCoverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' };
  }
  return { background: fitclip.coverGradient || fitclip.cover || ADMIN_GRADIENTS[0] };
}

function adminDefaultVersions(track) {
  const existing = track && Array.isArray(track.versions) ? track.versions : [];
  return ADMIN_VERSION_TYPES.map(v => {
    const found = existing.find(item => item.id === v.id || item.label === v.label);
    return {
      id: v.id,
      label: v.label,
      provider: (found && found.provider) || (track && track.videoProvider) || 'placeholder',
      embedUrl: (found && found.embedUrl) || (track && track.videoEmbedUrl) || '',
    };
  });
}

function adminTrackFromData(track, fitclipNumber, index) {
  const displayTitle = track.displayTitle || track.title || [track.artist, track.songTitle].filter(Boolean).join(' — ');
  const parts = displayTitle.split(' — ');
  const artist = track.artist || (parts.length > 1 ? parts[0] : '');
  const songTitle = track.songTitle || (parts.length > 1 ? parts.slice(1).join(' — ') : displayTitle);
  const out = {
    ...track,
    id: track.id || `admin_${fitclipNumber}_${index + 1}`,
    fitclipNumber,
    clipIndex: track.clipIndex || track.n || index + 1,
    n: track.n || track.clipIndex || index + 1,
    artist,
    songTitle,
    displayTitle,
    title: displayTitle,
    choreo: track.choreo || track.choreographer || '',
    choreographer: track.choreographer || track.choreo || '',
    bpm: track.bpm || 100,
    category: track.category || '',
    duration: track.duration || '0:00',
    videoProvider: track.videoProvider || 'placeholder',
    videoEmbedUrl: track.videoEmbedUrl || '',
    thumbnailUrl: track.thumbnailUrl || '',
    purchased: track.purchased !== false,
    subscriptionStatus: track.subscriptionStatus || 'active',
    paymentProvider: track.paymentProvider || 'cafe24',
    isPublished: track.isPublished !== false,
  };
  out.versions = adminDefaultVersions(out);
  return out;
}

function adminFitclipFromData(fc) {
  const tracks = (fc.tracks || []).map((track, index) => adminTrackFromData(track, fc.fitclipNumber, index));
  return {
    fitclipNumber: fc.fitclipNumber,
    uploadMonth: fc.uploadMonth || '',
    albumCoverUrl: fc.albumCoverUrl || '',
    coverGradient: fc.coverGradient || fc.cover || ADMIN_GRADIENTS[0],
    cover: fc.cover || fc.coverGradient || ADMIN_GRADIENTS[0],
    title: fc.title || fc.fitclip || `FITCLIP ${fc.fitclipNumber}`,
    fitclip: fc.fitclip || fc.title || `FITCLIP ${fc.fitclipNumber}`,
    trackCount: tracks.length,
    ownedCount: fc.ownedCount || tracks.filter(canWatchTrack).length,
    availableCount: fc.availableCount || tracks.filter(canWatchTrack).length,
    isPublished: fc.isPublished !== false,
    tracks,
  };
}

function adminLoadFitclips() {
  try {
    const raw = localStorage.getItem(ADMIN_FITCLIP_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return (window.RILLIZ_DATA.fitclips || []).map(adminFitclipFromData);
}

function adminEmptyTrack(fitclipNumber, index) {
  const track = {
    id: `admin_${fitclipNumber}_${Date.now().toString(36)}_${index + 1}`,
    fitclipNumber,
    clipIndex: index + 1,
    n: index + 1,
    artist: '',
    songTitle: '',
    displayTitle: '',
    title: '',
    choreo: '',
    choreographer: '',
    bpm: 100,
    category: '',
    duration: '0:00',
    videoProvider: 'placeholder',
    videoEmbedUrl: '',
    thumbnailUrl: '',
    purchased: true,
    subscriptionStatus: 'active',
    paymentProvider: 'cafe24',
    isPublished: true,
  };
  track.versions = adminDefaultVersions(track);
  return track;
}

function adminNormalizeDraft(draft) {
  const tracks = (draft.tracks || []).map((track, index) => {
    const displayTitle = [track.artist, track.songTitle].filter(Boolean).join(' — ') || track.displayTitle || track.title || `Track ${index + 1}`;
    return {
      ...track,
      fitclipNumber: Number(draft.fitclipNumber),
      clipIndex: Number(track.clipIndex) || index + 1,
      n: Number(track.clipIndex) || index + 1,
      displayTitle,
      title: displayTitle,
      choreo: track.choreo || '',
      choreographer: track.choreo || track.choreographer || '',
      bpm: Number(track.bpm) || 0,
      videoProvider: track.videoProvider || 'placeholder',
      videoEmbedUrl: track.videoEmbedUrl || '',
      thumbnailUrl: track.thumbnailUrl || '',
      purchased: track.purchased !== false,
      subscriptionStatus: track.subscriptionStatus || 'active',
      paymentProvider: track.paymentProvider || 'cafe24',
      versions: adminDefaultVersions(track),
    };
  }).sort((a, b) => a.clipIndex - b.clipIndex);
  return {
    ...draft,
    fitclipNumber: Number(draft.fitclipNumber),
    cover: draft.coverGradient,
    fitclip: draft.title || `FITCLIP ${draft.fitclipNumber}`,
    title: draft.title || `FITCLIP ${draft.fitclipNumber}`,
    trackCount: tracks.length,
    ownedCount: tracks.filter(canWatchTrack).length,
    availableCount: tracks.filter(canWatchTrack).length,
    tracks,
  };
}

function AdminView() {
  const f = useFithop();
  const t = f.t;
  const a = ADMIN_LABELS[f.lang] || ADMIN_LABELS.KR;
  const [fitclips, setFitclips] = React.useState(adminLoadFitclips);
  const [selectedNumber, setSelectedNumber] = React.useState(() => {
    const latest = fitclips.reduce((max, fc) => Math.max(max, Number(fc.fitclipNumber) || 0), 0);
    return latest || 48;
  });
  const selected = fitclips.find(fc => Number(fc.fitclipNumber) === Number(selectedNumber)) || fitclips[0];
  const [draft, setDraft] = React.useState(() => adminClone(selected || adminFitclipFromData(window.getFitclip(48))));
  const [trackIndex, setTrackIndex] = React.useState(0);

  React.useEffect(() => {
    if (selected) {
      setDraft(adminClone(selected));
      setTrackIndex(0);
    }
  }, [selectedNumber]);

  if (!f.adminOpen) return null;
  const close = () => f.setAdminOpen(false);
  const stop = (e) => e.stopPropagation();

  const saveAll = (next) => {
    const sorted = next.slice().sort((x, y) => Number(x.fitclipNumber) - Number(y.fitclipNumber));
    setFitclips(sorted);
    window.FITHOP_ADMIN_FITCLIPS = sorted;
    try { localStorage.setItem(ADMIN_FITCLIP_KEY, JSON.stringify(sorted)); } catch (e) {}
  };

  const updateDraft = (patch) => setDraft(prev => ({ ...prev, ...patch }));
  const updateTrack = (index, patch) => {
    setDraft(prev => {
      const tracks = (prev.tracks || []).map((tr, i) => i === index ? { ...tr, ...patch } : tr);
      return { ...prev, tracks };
    });
  };
  const updateVersion = (trackIdx, versionIdx, patch) => {
    setDraft(prev => {
      const tracks = (prev.tracks || []).map((tr, i) => {
        if (i !== trackIdx) return tr;
        const versions = adminDefaultVersions(tr).map((v, j) => j === versionIdx ? { ...v, ...patch } : v);
        return { ...tr, versions };
      });
      return { ...prev, tracks };
    });
  };
  const saveDraft = () => {
    const normalized = adminNormalizeDraft(draft);
    const exists = fitclips.some(fc => Number(fc.fitclipNumber) === Number(normalized.fitclipNumber));
    const next = exists
      ? fitclips.map(fc => Number(fc.fitclipNumber) === Number(normalized.fitclipNumber) ? normalized : fc)
      : [...fitclips, normalized];
    saveAll(next);
    setSelectedNumber(normalized.fitclipNumber);
    setDraft(adminClone(normalized));
    f.showToast(a.saved);
  };
  const createFitclip = () => {
    const nextNumber = fitclips.reduce((max, fc) => Math.max(max, Number(fc.fitclipNumber) || 0), 0) + 1;
    const fc = adminNormalizeDraft({
      fitclipNumber: nextNumber,
      uploadMonth: '',
      albumCoverUrl: '',
      coverGradient: ADMIN_GRADIENTS[(nextNumber - 1) % ADMIN_GRADIENTS.length],
      title: `FITCLIP ${nextNumber}`,
      isPublished: false,
      tracks: [],
    });
    saveAll([...fitclips, fc]);
    setSelectedNumber(nextNumber);
  };
  const addTrack = () => {
    const next = adminEmptyTrack(Number(draft.fitclipNumber), (draft.tracks || []).length);
    setDraft(prev => ({ ...prev, tracks: [...(prev.tracks || []), next] }));
    setTrackIndex((draft.tracks || []).length);
  };
  const deleteTrack = (index) => {
    setDraft(prev => {
      const tracks = (prev.tracks || []).filter((_, i) => i !== index);
      return { ...prev, tracks };
    });
    setTrackIndex(i => Math.max(0, i - 1));
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
  const publishedLabel = draft.isPublished ? a.published : a.hidden;

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
              <div className="adm-note">{a.localOnly}</div>

              <div className="adm-actionbar">
                <div className="adm-user compact">
                  <div className="fh-avatar">{f.currentUser.name.slice(0, 1)}</div>
                  <div className="meta">
                    <span className="nm">{f.currentUser.name}</span>
                    <span className="em">{f.currentUser.email}</span>
                  </div>
                  <span className="adm-badge">{t.roleAdmin}</span>
                </div>
                <button className="fh-btn primary" onClick={createFitclip}><Icon.Plus size={16} />{a.newFitclip}</button>
                <button className="fh-btn solid" onClick={saveDraft}><Icon.Check size={16} />{a.save}</button>
              </div>

              <div className="adm-workspace">
                <section className="adm-list-pane">
                  <div className="adm-pane-head">
                    <span>{a.fitclipList}</span>
                    <span className="count">{fitclips.length}</span>
                  </div>
                  <div className="adm-fitclip-list">
                    {fitclips.slice().reverse().map(fc => (
                      <button key={fc.fitclipNumber} className="adm-fitclip-row"
                              data-on={Number(fc.fitclipNumber) === Number(draft.fitclipNumber)}
                              onClick={() => setSelectedNumber(fc.fitclipNumber)}>
                        <span className="cover" style={adminCoverStyle(fc)} />
                        <span className="meta">
                          <span className="no">FITCLIP {fc.fitclipNumber}</span>
                          <span className="ti">{fc.title || fc.fitclip}</span>
                          <span className="sub">{fc.uploadMonth || '-'} · {fc.trackCount || 0} {t.tracks}</span>
                        </span>
                        <span className="state" data-on={fc.isPublished !== false}>{fc.isPublished !== false ? a.published : a.hidden}</span>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="adm-editor">
                  <div className="adm-pane-head">
                    <span>{a.fitclipInfo}</span>
                    <button className="adm-toggle" data-on={draft.isPublished !== false}
                            onClick={() => updateDraft({ isPublished: !(draft.isPublished !== false) })}>
                      {publishedLabel}
                    </button>
                  </div>

                  <div className="adm-form-grid">
                    <Field label={a.fitclipNumber}>
                      <input className="adm-input" type="number" value={draft.fitclipNumber}
                             onChange={(e) => updateDraft({ fitclipNumber: e.target.value })} />
                    </Field>
                    <Field label={a.uploadMonth}>
                      <input className="adm-input" value={draft.uploadMonth || ''}
                             onChange={(e) => updateDraft({ uploadMonth: e.target.value })} placeholder="2026.05" />
                    </Field>
                    <Field label={a.title}>
                      <input className="adm-input" value={draft.title || ''}
                             onChange={(e) => updateDraft({ title: e.target.value })} />
                    </Field>
                    <Field label={a.albumCoverUrl}>
                      <input className="adm-input" value={draft.albumCoverUrl || ''}
                             onChange={(e) => updateDraft({ albumCoverUrl: e.target.value })} placeholder="https://..." />
                    </Field>
                  </div>

                  <div className="adm-gradient-block">
                    <span className="adm-label">{a.coverGradient}</span>
                    <div className="adm-gradient-list">
                      {ADMIN_GRADIENTS.map(g => (
                        <button key={g} className="adm-gradient" data-on={draft.coverGradient === g}
                                style={{ background: g }} onClick={() => updateDraft({ coverGradient: g })} />
                      ))}
                    </div>
                  </div>

                  <div className="adm-track-head">
                    <div className="adm-pane-head mini">
                      <span>{a.tracks}</span>
                      <span className="count">{(draft.tracks || []).length}</span>
                    </div>
                    <button className="fh-btn sm primary" onClick={addTrack}><Icon.Plus size={15} />{a.addTrack}</button>
                  </div>

                  <div className="adm-track-strip">
                    {(draft.tracks || []).length === 0 ? (
                      <div className="adm-empty">{a.emptyTracks}</div>
                    ) : (draft.tracks || []).map((tr, i) => (
                      <button key={tr.id} className="adm-track-pill" data-on={i === trackIndex} onClick={() => setTrackIndex(i)}>
                        <span>{tr.clipIndex || i + 1}</span>
                        <strong>{tr.artist || a.artist}</strong>
                        <em>{tr.songTitle || a.songTitle}</em>
                      </button>
                    ))}
                  </div>

                  {track ? (
                    <React.Fragment>
                      <div className="adm-pane-head mini">
                        <span>{a.trackInfo}</span>
                        <button className="fh-icon-btn sm danger" onClick={() => deleteTrack(trackIndex)} aria-label={a.deleteTrack}>
                          <Icon.Trash size={16} />
                        </button>
                      </div>
                      <div className="adm-form-grid">
                        <Field label={a.clipIndex}>
                          <input className="adm-input" type="number" value={track.clipIndex}
                                 onChange={(e) => updateTrack(trackIndex, { clipIndex: e.target.value })} />
                        </Field>
                        <Field label={a.artist}>
                          <input className="adm-input" value={track.artist || ''}
                                 onChange={(e) => updateTrack(trackIndex, { artist: e.target.value })} />
                        </Field>
                        <Field label={a.songTitle}>
                          <input className="adm-input" value={track.songTitle || ''}
                                 onChange={(e) => updateTrack(trackIndex, { songTitle: e.target.value })} />
                        </Field>
                        <Field label={a.choreo}>
                          <input className="adm-input" value={track.choreo || ''}
                                 onChange={(e) => updateTrack(trackIndex, { choreo: e.target.value })} />
                        </Field>
                        <Field label={a.bpm}>
                          <input className="adm-input" type="number" value={track.bpm}
                                 onChange={(e) => updateTrack(trackIndex, { bpm: e.target.value })} />
                        </Field>
                        <Field label={a.category}>
                          <select className="adm-input" value={track.category || ''}
                                  onChange={(e) => updateTrack(trackIndex, { category: e.target.value })}>
                            <option value=""></option>
                            <option value="SPECIAL CHOREO">SPECIAL CHOREO</option>
                            <option value="WARM UP">WARM UP</option>
                            <option value="COOL DOWN">COOL DOWN</option>
                            <option value="LOW TEMPO">LOW TEMPO</option>
                            <option value="MEDIUM TEMPO">MEDIUM TEMPO</option>
                            <option value="HIGH TEMPO">HIGH TEMPO</option>
                          </select>
                        </Field>
                        <Field label={a.duration}>
                          <input className="adm-input" value={track.duration || ''}
                                 onChange={(e) => updateTrack(trackIndex, { duration: e.target.value })} />
                        </Field>
                        <Field label={a.videoProvider}>
                          <select className="adm-input" value={track.videoProvider || 'placeholder'}
                                  onChange={(e) => updateTrack(trackIndex, { videoProvider: e.target.value })}>
                            <option value="placeholder">placeholder</option>
                            <option value="youtube">youtube</option>
                            <option value="vimeo">vimeo</option>
                            <option value="file">file</option>
                          </select>
                        </Field>
                        <Field label={a.videoEmbedUrl}>
                          <input className="adm-input" value={track.videoEmbedUrl || ''}
                                 onChange={(e) => updateTrack(trackIndex, { videoEmbedUrl: e.target.value })} placeholder="https://..." />
                        </Field>
                        <Field label={a.thumbnailUrl}>
                          <input className="adm-input" value={track.thumbnailUrl || ''}
                                 onChange={(e) => updateTrack(trackIndex, { thumbnailUrl: e.target.value })} placeholder="https://..." />
                        </Field>
                      </div>

                      <div className="adm-version-head">
                        <span>{a.versions}</span>
                        <button className="fh-btn xs ghost" onClick={() => updateTrack(trackIndex, { versions: adminDefaultVersions(track) })}>
                          {a.resetVersions}
                        </button>
                      </div>
                      <div className="adm-version-list">
                        {adminDefaultVersions(track).map((version, i) => (
                          <div key={version.id} className="adm-version-row">
                            <span className="label">{version.label}</span>
                            <input className="adm-input" value={version.provider}
                                   onChange={(e) => updateVersion(trackIndex, i, { provider: e.target.value })} placeholder={a.provider} />
                            <input className="adm-input" value={version.embedUrl}
                                   onChange={(e) => updateVersion(trackIndex, i, { embedUrl: e.target.value })} placeholder={a.embedUrl} />
                          </div>
                        ))}
                      </div>
                    </React.Fragment>
                  ) : (
                    <div className="adm-empty">{a.selectTrack}</div>
                  )}
                </section>

                <section className="adm-preview-pane">
                  <div className="adm-pane-head">
                    <span>{a.preview}</span>
                    <span className="state" data-on={draft.isPublished !== false}>{publishedLabel}</span>
                  </div>
                  <div className="adm-cover-preview" style={adminCoverStyle(draft)}>
                    <span>FITCLIP</span>
                    <strong>{draft.fitclipNumber}</strong>
                  </div>
                  <div className="adm-preview-meta">
                    <strong>{draft.title || `FITCLIP ${draft.fitclipNumber}`}</strong>
                    <span>{draft.uploadMonth || '-'} · {(draft.tracks || []).length} {t.tracks}</span>
                  </div>
                  <div className="adm-preview-tracks">
                    {(draft.tracks || []).slice().sort((x, y) => Number(x.clipIndex) - Number(y.clipIndex)).map(tr => (
                      <div key={tr.id} className="adm-preview-track">
                        <span className="idx">{tr.clipIndex}</span>
                        <span className="tx">
                          <strong>{[tr.artist, tr.songTitle].filter(Boolean).join(' — ') || tr.displayTitle || tr.title || '-'}</strong>
                          <em>{tr.choreo || '-'} · {tr.bpm || 0} BPM · {tr.category || '-'}</em>
                        </span>
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
