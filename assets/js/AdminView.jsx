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

const ADMIN_VALID_CATEGORIES = [
  'SPECIAL CHOREO',
  'WARM UP',
  'COOL DOWN',
  'LOW TEMPO',
  'MEDIUM TEMPO',
  'HIGH TEMPO',
];

const ADMIN_VALID_PROVIDERS = ['youtube', 'vimeo'];
const ADMIN_LAST_SAVED_KEY = 'fithop-admin-fitclips-last-saved';

function adminClone(value) {
  return JSON.parse(JSON.stringify(value || null));
}

function adminText(value) {
  return String(value === undefined || value === null ? '' : value).trim();
}

function adminNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
}

function adminIsPositiveNumber(value) {
  const n = adminNumber(value);
  return Number.isFinite(n) && n >= 1;
}

function adminCurrentMonth() {
  const d = new Date();
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function adminTrackDisplayTitle(fitclipNumber, track) {
  const clip = String(Number(track.clipIndex || track.n || 1)).padStart(2, '0');
  return `FIT${Number(fitclipNumber)}-${clip} ${adminText(track.artist)} - ${adminText(track.songTitle)}`;
}

function adminCoverStyle(fc) {
  if (fc && fc.albumCoverUrl) {
    return { backgroundImage: `url(${fc.albumCoverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' };
  }
  return { background: (fc && (fc.coverGradient || fc.cover)) || ADMIN_COVER_GRADIENTS[0] };
}

function adminPrepareVersion(version, index, track) {
  const label = adminText(version && version.label) || ADMIN_VERSION_PRESETS[index] || 'CUSTOM VERSION';
  return {
    id: (version && version.id) || label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || `version_${index + 1}`,
    label,
    provider: (version && version.provider) || track.videoProvider || 'youtube',
    embedUrl: (version && version.embedUrl) || '',
  };
}

function adminPrepareTrack(track, fitclipNumber, index) {
  const clipIndex = Number(track.clipIndex || track.n || index + 1);
  const bpmText = adminText(track.bpm);
  const prepared = {
    ...track,
    id: track.id || `admin_${fitclipNumber}_${Date.now().toString(36)}_${index + 1}`,
    fitclipNumber: Number(fitclipNumber),
    clipIndex,
    n: clipIndex,
    artist: adminText(track.artist),
    songTitle: adminText(track.songTitle),
    choreo: adminText(track.choreo || track.choreographer),
    choreographer: adminText(track.choreo || track.choreographer),
    bpm: bpmText ? Number(bpmText) : '',
    category: adminText(track.category),
    duration: track.duration || '0:00',
    videoProvider: track.videoProvider || 'youtube',
    videoEmbedUrl: adminText(track.videoEmbedUrl),
    thumbnailUrl: adminText(track.thumbnailUrl),
    purchased: track.purchased !== false,
    subscriptionStatus: track.subscriptionStatus || 'active',
    paymentProvider: track.paymentProvider || 'cafe24',
  };
  prepared.displayTitle = adminTrackDisplayTitle(fitclipNumber, prepared);
  prepared.title = prepared.displayTitle;
  prepared.versions = Array.isArray(track.versions)
    ? track.versions.map((version, i) => adminPrepareVersion(version, i, prepared))
    : [];
  return prepared;
}

function adminPrepareFitclip(fc) {
  const fitclipNumber = Number(fc.fitclipNumber) || 1;
  const tracks = Array.isArray(fc.tracks)
    ? fc.tracks.map((tr, i) => adminPrepareTrack(tr, fitclipNumber, i))
    : [];
  const cover = fc.coverGradient || fc.cover || ADMIN_COVER_GRADIENTS[(fitclipNumber - 1) % ADMIN_COVER_GRADIENTS.length];
  const title = adminText(fc.title || fc.fitclip) || `FITCLIP ${fitclipNumber}`;
  const covers = { ...(fc.covers || {}) };
  tracks.forEach(tr => {
    covers[tr.id] = covers[tr.id] || (tr.thumbnailUrl ? `url(${tr.thumbnailUrl})` : cover);
  });
  return {
    ...fc,
    fitclipNumber,
    uploadMonth: adminText(fc.uploadMonth),
    albumCoverUrl: adminText(fc.albumCoverUrl),
    coverGradient: cover,
    cover,
    title,
    fitclip: adminText(fc.fitclip) || title,
    trackCount: tracks.length,
    ownedCount: tracks.filter(canWatchTrack).length,
    availableCount: tracks.filter(canWatchTrack).length,
    isPublished: fc.isPublished !== false,
    tracks,
    covers,
  };
}

function adminNewTrack(fitclipNumber, index) {
  return {
    id: `admin_${fitclipNumber}_${Date.now().toString(36)}_${index + 1}`,
    fitclipNumber: Number(fitclipNumber),
    clipIndex: index + 1,
    n: index + 1,
    artist: '',
    songTitle: '',
    displayTitle: '',
    title: '',
    choreo: '',
    choreographer: '',
    bpm: '',
    category: '',
    duration: '0:00',
    videoProvider: 'youtube',
    videoEmbedUrl: '',
    thumbnailUrl: '',
    purchased: true,
    subscriptionStatus: 'active',
    paymentProvider: 'cafe24',
    versions: [],
  };
}

function adminNewVersion(track) {
  const versions = Array.isArray(track.versions) ? track.versions : [];
  const label = ADMIN_VERSION_PRESETS[versions.length] || 'CUSTOM VERSION';
  return {
    id: `${label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')}_${Date.now().toString(36)}`,
    label,
    provider: ADMIN_VALID_PROVIDERS.includes(track.videoProvider) ? track.videoProvider : 'youtube',
    embedUrl: '',
  };
}

function adminLoadFitclips() {
  const store = window.FITHOP_DATA_STORE;
  const stored = store && store.readAdminFitclips ? store.readAdminFitclips() : null;
  const source = stored || window.RILLIZ_DATA.adminFitclips || window.RILLIZ_DATA.fitclips || [];
  return source.map(adminPrepareFitclip).sort((a, b) => a.fitclipNumber - b.fitclipNumber);
}

function adminAddError(errors, key, message) {
  if (!errors[key]) errors[key] = [];
  errors[key].push(message);
}

function adminFlattenErrors(errors) {
  return Object.keys(errors).reduce((list, key) => list.concat(errors[key]), []);
}

function adminFirstError(errors, key) {
  return errors[key] && errors[key][0] ? errors[key][0] : '';
}

function adminValidateFitclip(fc, allFitclips, originalNumber) {
  const errors = {};
  const rawNumber = adminText(fc.fitclipNumber);
  const fitclipNumber = adminNumber(fc.fitclipNumber);

  if (!rawNumber) adminAddError(errors, 'fitclipNumber', 'fitclipNumber는 필수입니다.');
  else if (!adminIsPositiveNumber(fc.fitclipNumber)) adminAddError(errors, 'fitclipNumber', 'fitclipNumber는 1 이상의 숫자여야 합니다.');
  else {
    const duplicate = allFitclips.some(item =>
      Number(item.fitclipNumber) === fitclipNumber && Number(item.fitclipNumber) !== Number(originalNumber)
    );
    if (duplicate) adminAddError(errors, 'fitclipNumber', '동일한 fitclipNumber가 이미 있습니다.');
  }

  if (!adminText(fc.uploadMonth)) adminAddError(errors, 'uploadMonth', 'uploadMonth는 필수입니다.');

  const tracks = Array.isArray(fc.tracks) ? fc.tracks : [];
  const clipIndexes = new Set();
  tracks.forEach((track, index) => {
    const prefix = `tracks.${index}`;
    const rawClipIndex = adminText(track.clipIndex);
    const clipIndex = adminNumber(track.clipIndex);
    if (!rawClipIndex) adminAddError(errors, `${prefix}.clipIndex`, 'clipIndex는 필수입니다.');
    else if (!adminIsPositiveNumber(track.clipIndex)) adminAddError(errors, `${prefix}.clipIndex`, 'clipIndex는 1 이상의 숫자여야 합니다.');
    else if (clipIndexes.has(clipIndex)) adminAddError(errors, `${prefix}.clipIndex`, '같은 FITCLIP 안에서 clipIndex가 중복되었습니다.');
    else clipIndexes.add(clipIndex);

    if (!adminText(track.artist)) adminAddError(errors, `${prefix}.artist`, 'artist는 필수입니다.');
    if (!adminText(track.songTitle)) adminAddError(errors, `${prefix}.songTitle`, 'songTitle은 필수입니다.');
    if (!adminText(track.choreo)) adminAddError(errors, `${prefix}.choreo`, 'choreo는 필수입니다.');
    if (!adminText(track.bpm)) adminAddError(errors, `${prefix}.bpm`, 'bpm은 필수입니다.');
    else if (!Number.isFinite(Number(track.bpm))) adminAddError(errors, `${prefix}.bpm`, 'bpm은 숫자여야 합니다.');
    if (!adminText(track.category)) adminAddError(errors, `${prefix}.category`, 'category는 필수입니다.');
    else if (!ADMIN_VALID_CATEGORIES.includes(track.category)) adminAddError(errors, `${prefix}.category`, 'category 값이 허용 목록에 없습니다.');
    if (!ADMIN_VALID_PROVIDERS.includes(track.videoProvider)) adminAddError(errors, `${prefix}.videoProvider`, 'videoProvider는 youtube 또는 vimeo만 가능합니다.');
    if (!adminText(track.videoEmbedUrl)) adminAddError(errors, `${prefix}.videoEmbedUrl`, 'videoEmbedUrl은 필수입니다.');

    const versions = Array.isArray(track.versions) ? track.versions : [];
    versions.forEach((version, versionIndex) => {
      const vPrefix = `${prefix}.versions.${versionIndex}`;
      if (!adminText(version.label)) adminAddError(errors, `${vPrefix}.label`, '버전 label은 필수입니다.');
      if (!ADMIN_VALID_PROVIDERS.includes(version.provider)) adminAddError(errors, `${vPrefix}.provider`, '버전 provider는 youtube 또는 vimeo만 가능합니다.');
      if (!adminText(version.embedUrl)) adminAddError(errors, `${vPrefix}.embedUrl`, '버전 embedUrl은 필수입니다.');
    });
  });

  return { valid: Object.keys(errors).length === 0, errors };
}

function adminValidateImport(rawFitclips) {
  const errors = {};
  if (!Array.isArray(rawFitclips) || rawFitclips.length === 0) {
    adminAddError(errors, 'import', '가져올 JSON에는 fitclips 배열이 필요합니다.');
    return { valid: false, errors, fitclips: [] };
  }

  const fitclipNumbers = new Set();
  rawFitclips.forEach((fc, index) => {
    const n = fc && adminNumber(fc.fitclipNumber);
    if (Number.isFinite(n) && fitclipNumbers.has(n)) {
      adminAddError(errors, `FITCLIP ${n}`, '동일한 fitclipNumber가 중복되었습니다.');
    } else if (Number.isFinite(n)) {
      fitclipNumbers.add(n);
    }
    const result = adminValidateFitclip(fc || {}, rawFitclips, fc && fc.fitclipNumber);
    Object.keys(result.errors).forEach(key => {
      result.errors[key].forEach(message => adminAddError(errors, `FITCLIP ${fc && fc.fitclipNumber ? fc.fitclipNumber : index + 1}`, message));
    });
  });

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    fitclips: rawFitclips.map(adminPrepareFitclip).sort((a, b) => a.fitclipNumber - b.fitclipNumber),
  };
}

function adminStoredDataStatus(fitclips) {
  const totalTracks = fitclips.reduce((sum, fc) => sum + ((fc.tracks || []).length), 0);
  const publicCount = fitclips.filter(fc => fc.isPublished !== false).length;
  let hasStoredData = false;
  let storageReadable = true;

  try {
    const raw = window.localStorage.getItem(window.FITHOP_ADMIN_STORAGE_KEY);
    hasStoredData = !!raw;
    if (raw) {
      const parsed = JSON.parse(raw);
      storageReadable = Array.isArray(parsed);
    }
  } catch (e) {
    storageReadable = false;
  }

  const shapeOk = fitclips.every(fc =>
    adminIsPositiveNumber(fc.fitclipNumber) &&
    Array.isArray(fc.tracks) &&
    (fc.tracks || []).every(tr => adminIsPositiveNumber(tr.clipIndex || tr.n))
  );

  return {
    totalFitclips: fitclips.length,
    totalTracks,
    publicCount,
    hasStoredData,
    validationOk: storageReadable && shapeOk,
  };
}

function adminFormatSavedAt(value) {
  if (!value) return '저장 기록 없음';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('ko-KR');
}

function adminDemoEmbed(provider, seed) {
  if (provider === 'vimeo') return `https://player.vimeo.com/video/${800000000 + seed}`;
  return `https://www.youtube.com/embed/fithop-demo-${seed}`;
}

function adminBuildTestFitclip(fitclips) {
  const maxNumber = fitclips.reduce((max, fc) => Math.max(max, Number(fc.fitclipNumber) || 0), 0);
  const fitclipNumber = maxNumber + 1;
  const trackCount = 3 + (fitclipNumber % 4);
  const gradient = ADMIN_COVER_GRADIENTS[(fitclipNumber - 1) % ADMIN_COVER_GRADIENTS.length];
  const permissionStates = [
    { purchased: true, subscriptionStatus: 'active' },
    { purchased: false, subscriptionStatus: 'active' },
    { purchased: false, subscriptionStatus: 'none' },
    { purchased: true, subscriptionStatus: 'inactive' },
  ];
  const artists = ['Jadakiss', 'Nas', 'Mobb Deep', 'GZA', 'Big L', 'Black Star'];
  const titles = ['Preview Drill', 'Storage Check', 'Access Test', 'Cover Flow Pass', 'Mini Player Cue', 'Version Stack'];
  const choreos = ['HYO JIN KIM', 'BADA LEE', 'JUNHO LEE', 'MINJEE PARK', 'KIEL TUTIN', 'REIA SATO'];

  const tracks = Array.from({ length: trackCount }).map((_, index) => {
    const clipIndex = index + 1;
    const provider = index % 2 === 0 ? 'youtube' : 'vimeo';
    const videoEmbedUrl = adminDemoEmbed(provider, fitclipNumber * 10 + clipIndex);
    const access = permissionStates[index % permissionStates.length];
    return {
      id: `test_${fitclipNumber}_${clipIndex}`,
      fitclipNumber,
      clipIndex,
      n: clipIndex,
      artist: artists[index % artists.length],
      songTitle: titles[index % titles.length],
      choreo: choreos[index % choreos.length],
      choreographer: choreos[index % choreos.length],
      bpm: 92 + index * 8,
      category: ADMIN_VALID_CATEGORIES[index % ADMIN_VALID_CATEGORIES.length],
      duration: `0:${String(42 + index * 6).padStart(2, '0')}`,
      videoProvider: provider,
      videoEmbedUrl,
      thumbnailUrl: '',
      purchased: access.purchased,
      subscriptionStatus: access.subscriptionStatus,
      paymentProvider: 'cafe24',
      versions: ADMIN_VERSION_PRESETS.map((label, versionIndex) => ({
        id: label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''),
        label,
        provider,
        embedUrl: `${videoEmbedUrl}?version=${versionIndex + 1}`,
      })),
    };
  });

  return adminPrepareFitclip({
    fitclipNumber,
    uploadMonth: adminCurrentMonth(),
    albumCoverUrl: '',
    coverGradient: gradient,
    cover: gradient,
    title: `TEST FITCLIP ${fitclipNumber}`,
    fitclip: `TEST FITCLIP ${fitclipNumber}`,
    isPublished: true,
    tracks,
  });
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
  const [draft, setDraft] = React.useState(() => adminClone(selected || adminPrepareFitclip(window.getFitclip(48) || {})));
  const [trackIndex, setTrackIndex] = React.useState(0);
  const [notice, setNotice] = React.useState('');
  const [formErrors, setFormErrors] = React.useState({});
  const [loadWarning, setLoadWarning] = React.useState(() => {
    const store = window.FITHOP_DATA_STORE;
    return store && store.getLoadError ? store.getLoadError() : (window.FITHOP_ADMIN_STORAGE_LOAD_ERROR || '');
  });
  const [lastSavedAt, setLastSavedAt] = React.useState(() => {
    try { return window.localStorage.getItem(ADMIN_LAST_SAVED_KEY) || ''; } catch (e) { return ''; }
  });
  const [mainPreview, setMainPreview] = React.useState({ fitclipNumber: null, trackId: '', appliedAt: '' });
  const fileInputRef = React.useRef(null);

  React.useEffect(() => {
    if (!selected) return;
    setDraft(adminClone(selected));
    setTrackIndex(0);
    setFormErrors({});
  }, [selectedNumber]);

  if (!f.adminOpen) return null;
  const close = () => f.setAdminOpen(false);
  const stop = (e) => e.stopPropagation();

  const flash = (message) => {
    setNotice(message);
    f.showToast(message);
  };

  const showErrors = (errors, message) => {
    setFormErrors(errors);
    setNotice(message || '입력값을 확인해 주세요.');
  };

  const persistFitclips = (next, message) => {
    const prepared = next.map(adminPrepareFitclip).sort((a, b) => a.fitclipNumber - b.fitclipNumber);
    try {
      window.localStorage.setItem(window.FITHOP_ADMIN_STORAGE_KEY, JSON.stringify(prepared));
      const savedAt = new Date().toISOString();
      window.localStorage.setItem(ADMIN_LAST_SAVED_KEY, savedAt);
      setLastSavedAt(savedAt);
    } catch (e) {
      showErrors({ storage: ['localStorage 저장에 실패했습니다. 브라우저 저장소 상태를 확인해 주세요.'] }, '저장에 실패했습니다.');
      return null;
    }
    setFitclips(prepared);
    setLoadWarning('');
    if (window.FITHOP_DATA_STORE) window.FITHOP_DATA_STORE.installFitclips(prepared);
    if (f.refreshCatalog) f.refreshCatalog();
    if (message) flash(message);
    return prepared;
  };

  const applyMainPreview = (sourceDraft = draft, sourceFitclips = fitclips, originalNumber = selectedNumber) => {
    const validation = adminValidateFitclip(sourceDraft, sourceFitclips, originalNumber);
    if (!validation.valid) {
      showErrors(validation.errors, '메인 미리보기를 적용하지 못했습니다. 입력값을 확인해 주세요.');
      return null;
    }

    const prepared = adminPrepareFitclip(sourceDraft);
    const exists = sourceFitclips.some(fc => Number(fc.fitclipNumber) === Number(originalNumber));
    const next = exists
      ? sourceFitclips.map(fc => Number(fc.fitclipNumber) === Number(originalNumber) ? prepared : fc)
      : [...sourceFitclips, prepared];
    const saved = persistFitclips(next, '메인 화면 미리보기를 적용했습니다.');
    if (!saved) return null;

    setFormErrors({});
    setSelectedNumber(prepared.fitclipNumber);
    setDraft(adminClone(prepared));

    if (prepared.isPublished === false) {
      setMainPreview({ fitclipNumber: prepared.fitclipNumber, trackId: '', appliedAt: new Date().toISOString() });
      flash('비공개 FITCLIP은 메인 공개 목록에 표시되지 않습니다.');
      return prepared;
    }

    f.setSelectedFitclip(prepared.fitclipNumber);
    const previewTrack = (prepared.tracks || []).find(canWatchTrack) || (prepared.tracks || [])[0] || null;
    if (previewTrack) f.requestPlay(previewTrack.id);
    setMainPreview({
      fitclipNumber: prepared.fitclipNumber,
      trackId: previewTrack ? previewTrack.id : '',
      appliedAt: new Date().toISOString(),
    });
    return prepared;
  };

  const saveDraft = () => {
    const validation = adminValidateFitclip(draft, fitclips, selectedNumber);
    if (!validation.valid) {
      showErrors(validation.errors, '저장하지 못했습니다. 입력값을 확인해 주세요.');
      return;
    }

    const prepared = adminPrepareFitclip(draft);
    const exists = fitclips.some(fc => fc.fitclipNumber === selectedNumber);
    const next = exists
      ? fitclips.map(fc => fc.fitclipNumber === selectedNumber ? prepared : fc)
      : [...fitclips, prepared];
    const saved = persistFitclips(next, '저장되었습니다.');
    if (!saved) return;
    setFormErrors({});
    setSelectedNumber(prepared.fitclipNumber);
    setDraft(adminClone(prepared));
    if (prepared.isPublished) f.setSelectedFitclip(prepared.fitclipNumber);
  };

  const createFitclip = () => {
    const maxNumber = fitclips.reduce((max, fc) => Math.max(max, Number(fc.fitclipNumber) || 0), 0);
    const nextNumber = maxNumber + 1;
    const created = adminPrepareFitclip({
      fitclipNumber: nextNumber,
      uploadMonth: adminCurrentMonth(),
      albumCoverUrl: '',
      coverGradient: ADMIN_COVER_GRADIENTS[(nextNumber - 1) % ADMIN_COVER_GRADIENTS.length],
      title: `FITCLIP ${nextNumber}`,
      isPublished: true,
      tracks: [],
    });
    const saved = persistFitclips([...fitclips, created], '새 FITCLIP이 저장되었습니다.');
    if (!saved) return;
    setFormErrors({});
    setSelectedNumber(nextNumber);
    setDraft(adminClone(created));
  };

  const createTestFitclip = () => {
    const created = adminBuildTestFitclip(fitclips);
    const saved = persistFitclips([...fitclips, created], '테스트 FITCLIP이 생성되었습니다.');
    if (!saved) return;
    setFormErrors({});
    setSelectedNumber(created.fitclipNumber);
    setDraft(adminClone(created));
    f.setSelectedFitclip(created.fitclipNumber);
    const previewTrack = (created.tracks || []).find(canWatchTrack) || (created.tracks || [])[0] || null;
    if (previewTrack) f.requestPlay(previewTrack.id);
    setMainPreview({
      fitclipNumber: created.fitclipNumber,
      trackId: previewTrack ? previewTrack.id : '',
      appliedAt: new Date().toISOString(),
    });
  };

  const deleteFitclip = () => {
    if (!draft) return;
    const next = fitclips.filter(fc => fc.fitclipNumber !== selectedNumber);
    const saved = persistFitclips(next, 'FITCLIP이 삭제되었습니다.');
    if (!saved) return;
    const fallback = saved[saved.length - 1];
    if (fallback) {
      setSelectedNumber(fallback.fitclipNumber);
      setDraft(adminClone(fallback));
    }
    setFormErrors({});
  };

  const resetData = () => {
    const defaults = window.FITHOP_DATA_STORE ? window.FITHOP_DATA_STORE.getDefaultFitclips().map(adminPrepareFitclip) : [];
    try {
      window.localStorage.removeItem(window.FITHOP_ADMIN_STORAGE_KEY);
      window.localStorage.removeItem(ADMIN_LAST_SAVED_KEY);
    } catch (e) {}
    if (window.FITHOP_DATA_STORE) window.FITHOP_DATA_STORE.resetAdminFitclips();
    setFitclips(defaults);
    const fallback = defaults[defaults.length - 1];
    if (fallback) {
      setSelectedNumber(fallback.fitclipNumber);
      setDraft(adminClone(fallback));
      f.setSelectedFitclip(fallback.fitclipNumber);
    }
    setLoadWarning('');
    setLastSavedAt('');
    setMainPreview({ fitclipNumber: null, trackId: '', appliedAt: '' });
    setFormErrors({});
    if (f.refreshCatalog) f.refreshCatalog();
    flash('관리자 데이터가 초기화되었습니다.');
  };

  const exportData = () => {
    const payload = JSON.stringify(fitclips.map(adminPrepareFitclip), null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fithop-fitclips-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    flash('데이터를 내보냈습니다.');
  };

  const requestImport = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const importData = (event) => {
    const file = event.target.files && event.target.files[0];
    event.target.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        const rawFitclips = Array.isArray(parsed) ? parsed : parsed.fitclips;
        const validation = adminValidateImport(rawFitclips);
        if (!validation.valid) {
          showErrors(validation.errors, '가져오기에 실패했습니다. JSON 데이터를 확인해 주세요.');
          return;
        }
        const saved = persistFitclips(validation.fitclips, '데이터를 가져왔습니다.');
        if (!saved) return;
        const fallback = saved[saved.length - 1];
        if (fallback) {
          setSelectedNumber(fallback.fitclipNumber);
          setDraft(adminClone(fallback));
          if (fallback.isPublished) f.setSelectedFitclip(fallback.fitclipNumber);
        }
        setFormErrors({});
      } catch (e) {
        showErrors({ import: ['JSON 파일을 읽을 수 없습니다. 파일 형식을 확인해 주세요.'] }, '가져오기에 실패했습니다.');
      }
    };
    reader.readAsText(file);
  };

  const updateDraft = (patch) => setDraft(prev => ({ ...prev, ...patch }));
  const updateTrack = (index, patch) => setDraft(prev => ({
    ...prev,
    tracks: (prev.tracks || []).map((tr, i) => i === index ? { ...tr, ...patch } : tr),
  }));
  const addTrack = () => {
    const next = adminNewTrack(Number(draft.fitclipNumber) || 1, (draft.tracks || []).length);
    setDraft(prev => ({ ...prev, tracks: [...(prev.tracks || []), next] }));
    setTrackIndex((draft.tracks || []).length);
  };
  const deleteTrack = (index) => {
    setDraft(prev => ({ ...prev, tracks: (prev.tracks || []).filter((_, i) => i !== index) }));
    setTrackIndex(i => Math.max(0, i - 1));
  };
  const updateVersion = (index, patch) => {
    const tr = (draft.tracks || [])[trackIndex];
    if (!tr) return;
    updateTrack(trackIndex, {
      versions: (tr.versions || []).map((v, i) => i === index ? { ...v, ...patch } : v),
    });
  };
  const addVersion = () => {
    const tr = (draft.tracks || [])[trackIndex];
    if (!tr) return;
    const versions = Array.isArray(tr.versions) ? tr.versions : [];
    updateTrack(trackIndex, { versions: [...versions, adminNewVersion(tr)] });
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

  const Field = ({ label, errorKey, children }) => {
    const error = errorKey ? adminFirstError(formErrors, errorKey) : '';
    return (
      <label className="adm-field" data-error={!!error}>
        <span>{label}</span>
        {children}
        {error ? <em className="adm-error">{error}</em> : null}
      </label>
    );
  };

  const track = (draft.tracks || [])[trackIndex] || null;
  const trackPrefix = `tracks.${trackIndex}`;
  const errorList = adminFlattenErrors(formErrors);
  const dataStatus = adminStoredDataStatus(fitclips);
  const reflectedFitclip = window.RILLIZ_DATA.fitclips.find(fc => Number(fc.fitclipNumber) === Number(draft.fitclipNumber));
  const reflectedTracks = reflectedFitclip && Array.isArray(reflectedFitclip.tracks) ? reflectedFitclip.tracks : [];
  const hasLockedTrack = reflectedTracks.some(tr => !canWatchTrack(tr));
  const previewApplied = Number(mainPreview.fitclipNumber) === Number(draft.fitclipNumber) && Number(f.selectedFitclip) === Number(draft.fitclipNumber);
  const checklist = [
    { label: 'FITCLIP이 Cover Flow에 표시됨', ok: !!reflectedFitclip },
    { label: '트랙리스트에 트랙이 표시됨', ok: reflectedTracks.length > 0 },
    { label: '권한 없는 트랙에 구매하기 버튼 표시됨', ok: hasLockedTrack },
    { label: '선택한 FITCLIP이 미니 플레이어에 반영됨', ok: previewApplied && !!mainPreview.trackId },
  ];

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
              {loadWarning ? <div className="adm-warn">{loadWarning}</div> : null}
              {notice ? <div className="adm-save-note">{notice}</div> : null}
              {errorList.length > 0 ? (
                <div className="adm-error-list">
                  <strong>수정이 필요한 항목</strong>
                  {errorList.slice(0, 8).map((message, i) => <span key={`${message}_${i}`}>{message}</span>)}
                  {errorList.length > 8 ? <span>외 {errorList.length - 8}개 오류가 더 있습니다.</span> : null}
                </div>
              ) : null}

              <div className="adm-actions">
                <button className="fh-btn primary" onClick={createFitclip}><Icon.Plus size={16} />새 FITCLIP</button>
                <button className="fh-btn primary" onClick={createTestFitclip}><Icon.Plus size={16} />테스트 FITCLIP 생성</button>
                <button className="fh-btn solid" onClick={saveDraft}><Icon.Check size={16} />저장</button>
                <button className="fh-btn ghost" onClick={() => applyMainPreview()}>메인 화면에서 미리보기</button>
                <button className="fh-btn ghost" onClick={deleteFitclip}><Icon.Trash size={16} />삭제</button>
                <button className="fh-btn ghost" onClick={exportData}>데이터 내보내기</button>
                <button className="fh-btn ghost" onClick={requestImport}>데이터 가져오기</button>
                <button className="fh-btn warn" onClick={resetData}>데이터 초기화</button>
                <input ref={fileInputRef} className="adm-file-input" type="file" accept="application/json" onChange={importData} />
              </div>

              <div className="adm-workspace">
                <section className="adm-list">
                  <div className="adm-head"><span>FITCLIP 회차 목록</span><b>{fitclips.length}</b></div>
                  <div className="adm-list-scroll">
                    {fitclips.slice().reverse().map(fc => (
                      <button key={fc.fitclipNumber} className="adm-row" data-on={fc.fitclipNumber === selectedNumber}
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
                    <Field label="fitclipNumber" errorKey="fitclipNumber">
                      <input className="adm-input" type="number" value={draft.fitclipNumber || ''} onChange={(e) => updateDraft({ fitclipNumber: e.target.value })} />
                    </Field>
                    <Field label="uploadMonth" errorKey="uploadMonth">
                      <input className="adm-input" value={draft.uploadMonth || ''} onChange={(e) => updateDraft({ uploadMonth: e.target.value })} placeholder="2026.05" />
                    </Field>
                    <Field label="title">
                      <input className="adm-input" value={draft.title || ''} onChange={(e) => updateDraft({ title: e.target.value })} />
                    </Field>
                    <Field label="albumCoverUrl">
                      <input className="adm-input" value={draft.albumCoverUrl || ''} onChange={(e) => updateDraft({ albumCoverUrl: e.target.value })} placeholder="https://..." />
                    </Field>
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
                      <button key={tr.id || i} className="adm-track-tab" data-on={i === trackIndex}
                              data-error={Object.keys(formErrors).some(key => key.startsWith(`tracks.${i}.`))}
                              onClick={() => setTrackIndex(i)}>
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
                        <Field label="clipIndex" errorKey={`${trackPrefix}.clipIndex`}>
                          <input className="adm-input" type="number" value={track.clipIndex || ''} onChange={(e) => updateTrack(trackIndex, { clipIndex: e.target.value })} />
                        </Field>
                        <Field label="artist" errorKey={`${trackPrefix}.artist`}>
                          <input className="adm-input" value={track.artist || ''} onChange={(e) => updateTrack(trackIndex, { artist: e.target.value })} />
                        </Field>
                        <Field label="songTitle" errorKey={`${trackPrefix}.songTitle`}>
                          <input className="adm-input" value={track.songTitle || ''} onChange={(e) => updateTrack(trackIndex, { songTitle: e.target.value })} />
                        </Field>
                        <Field label="choreo" errorKey={`${trackPrefix}.choreo`}>
                          <input className="adm-input" value={track.choreo || ''} onChange={(e) => updateTrack(trackIndex, { choreo: e.target.value })} />
                        </Field>
                        <Field label="bpm" errorKey={`${trackPrefix}.bpm`}>
                          <input className="adm-input" type="number" value={track.bpm || ''} onChange={(e) => updateTrack(trackIndex, { bpm: e.target.value })} />
                        </Field>
                        <Field label="category" errorKey={`${trackPrefix}.category`}>
                          <select className="adm-input" value={track.category || ''} onChange={(e) => updateTrack(trackIndex, { category: e.target.value })}>
                            <option value=""></option>
                            {ADMIN_VALID_CATEGORIES.map(category => <option key={category} value={category}>{category}</option>)}
                          </select>
                        </Field>
                        <Field label="videoProvider" errorKey={`${trackPrefix}.videoProvider`}>
                          <select className="adm-input" value={track.videoProvider || 'youtube'} onChange={(e) => updateTrack(trackIndex, { videoProvider: e.target.value })}>
                            {ADMIN_VALID_PROVIDERS.map(provider => <option key={provider} value={provider}>{provider}</option>)}
                          </select>
                        </Field>
                        <Field label="videoEmbedUrl" errorKey={`${trackPrefix}.videoEmbedUrl`}>
                          <input className="adm-input" value={track.videoEmbedUrl || ''} onChange={(e) => updateTrack(trackIndex, { videoEmbedUrl: e.target.value })} placeholder="https://..." />
                        </Field>
                        <Field label="thumbnailUrl">
                          <input className="adm-input" value={track.thumbnailUrl || ''} onChange={(e) => updateTrack(trackIndex, { thumbnailUrl: e.target.value })} placeholder="https://..." />
                        </Field>
                      </div>

                      <div className="adm-display-title">
                        <span>저장 시 displayTitle</span>
                        <strong>{adminTrackDisplayTitle(draft.fitclipNumber || 0, track)}</strong>
                      </div>

                      <div className="adm-version-head">
                        <span>버전 영상</span>
                        <button className="fh-btn xs ghost" onClick={addVersion}>버전 추가</button>
                      </div>
                      <div className="adm-version-list">
                        {(track.versions || []).length === 0 ? <span className="adm-empty">버전 영상이 없습니다.</span> : null}
                        {(track.versions || []).map((version, i) => {
                          const vPrefix = `${trackPrefix}.versions.${i}`;
                          const versionErrors = [
                            adminFirstError(formErrors, `${vPrefix}.label`),
                            adminFirstError(formErrors, `${vPrefix}.provider`),
                            adminFirstError(formErrors, `${vPrefix}.embedUrl`),
                          ].filter(Boolean);
                          return (
                            <div className="adm-version-row" key={version.id || i} data-error={versionErrors.length > 0}>
                              <input className="adm-input" value={version.label || ''} onChange={(e) => updateVersion(i, { label: e.target.value })} />
                              <select className="adm-input" value={version.provider || 'youtube'} onChange={(e) => updateVersion(i, { provider: e.target.value })}>
                                {ADMIN_VALID_PROVIDERS.map(provider => <option key={provider} value={provider}>{provider}</option>)}
                              </select>
                              <input className="adm-input" value={version.embedUrl || ''} onChange={(e) => updateVersion(i, { embedUrl: e.target.value })} placeholder="embedUrl" />
                              <button className="fh-icon-btn sm danger" onClick={() => deleteVersion(i)} aria-label="버전 삭제"><Icon.Close size={15} /></button>
                              {versionErrors.length > 0 ? (
                                <div className="adm-version-errors">
                                  {versionErrors.map((message, idx) => <span key={`${message}_${idx}`}>{message}</span>)}
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </React.Fragment>
                  ) : null}
                </section>

                <section className="adm-main-preview">
                  <div className="adm-head"><span>미리보기</span><b>{draft.isPublished !== false ? '공개' : '비공개'}</b></div>
                  <div className="adm-status-panel">
                    <div className="adm-head mini"><span>데이터 상태</span><b>{dataStatus.validationOk ? '정상' : '확인 필요'}</b></div>
                    <div className="adm-status-grid">
                      <span>총 FITCLIP 수</span><strong>{dataStatus.totalFitclips}</strong>
                      <span>총 트랙 수</span><strong>{dataStatus.totalTracks}</strong>
                      <span>공개 FITCLIP 수</span><strong>{dataStatus.publicCount}</strong>
                      <span>localStorage</span><strong>{dataStatus.hasStoredData ? '사용 중' : '기본 데이터'}</strong>
                      <span>마지막 저장</span><strong>{adminFormatSavedAt(lastSavedAt)}</strong>
                      <span>데이터 검증</span><strong>{dataStatus.validationOk ? '통과' : '확인 필요'}</strong>
                    </div>
                  </div>
                  <div className="adm-check-panel">
                    <div className="adm-head mini"><span>메인 반영 검증</span><b>{checklist.every(item => item.ok) ? '통과' : '대기'}</b></div>
                    <div className="adm-check-list">
                      {checklist.map(item => (
                        <span key={item.label} data-ok={item.ok}>
                          <Icon.Check size={13} />{item.label}
                        </span>
                      ))}
                    </div>
                  </div>
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
                          <strong>{[tr.artist, tr.songTitle].filter(Boolean).join(' - ') || '-'}</strong>
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
