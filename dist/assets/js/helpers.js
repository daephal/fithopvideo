// Shared helpers for track access, labels, and data normalization.
(function () {
  const ACCESS = Object.freeze({
    WATCHABLE: 'watchable',
    PURCHASE_AVAILABLE: 'purchase_available',
    PURCHASED_MEMBERSHIP_REQUIRED: 'purchased_membership_required',
    MEMBERSHIP_REQUIRED: 'membership_required',
  });

  const FALLBACK_COPY = {
    buy: '구매하기',
    buy_now: '구매하기',
    owned: '보유 중',
    available: '시청 가능',
    purchaseRequired: '구매 필요',
    membershipRequired: '멤버십 필요',
    purchasedMembershipRequired: '구매 완료 · 멤버십 필요',
  };

  function resolveCopy(copyOrLanguage) {
    if (typeof copyOrLanguage === 'string') {
      return (window.RILLIZ_COPY && window.RILLIZ_COPY[copyOrLanguage]) || null;
    }
    return copyOrLanguage;
  }

  function copyValue(copyOrLanguage, key) {
    const copy = resolveCopy(copyOrLanguage);
    return (copy && copy[key]) || FALLBACK_COPY[key] || key;
  }

  function getTrackAccessState(track) {
    if (!track) return ACCESS.MEMBERSHIP_REQUIRED;
    const purchased = track.purchased === true;
    const subscriptionStatus = track.subscriptionStatus || 'none';

    if (subscriptionStatus === 'none') return ACCESS.MEMBERSHIP_REQUIRED;
    if (purchased && subscriptionStatus === 'active') return ACCESS.WATCHABLE;
    if (purchased && subscriptionStatus === 'inactive') return ACCESS.PURCHASED_MEMBERSHIP_REQUIRED;
    if (!purchased && subscriptionStatus === 'active') return ACCESS.PURCHASE_AVAILABLE;
    return ACCESS.MEMBERSHIP_REQUIRED;
  }

  function canWatchTrack(track) {
    return getTrackAccessState(track) === ACCESS.WATCHABLE;
  }

  function canPurchaseTrack(track) {
    return getTrackAccessState(track) === ACCESS.PURCHASE_AVAILABLE;
  }

  function getPurchaseButtonLabel(track, copy) {
    const state = getTrackAccessState(track);
    if (state === ACCESS.WATCHABLE) return copyValue(copy, 'owned');
    if (state === ACCESS.PURCHASED_MEMBERSHIP_REQUIRED) return copyValue(copy, 'purchasedMembershipRequired');
    if (state === ACCESS.MEMBERSHIP_REQUIRED) return copyValue(copy, 'membershipRequired');
    return copyValue(copy, 'buy_now') || copyValue(copy, 'buy');
  }

  function getTrackStatusLabel(track, copy) {
    const state = getTrackAccessState(track);
    if (state === ACCESS.WATCHABLE) return copyValue(copy, 'available');
    if (state === ACCESS.PURCHASED_MEMBERSHIP_REQUIRED) return copyValue(copy, 'purchasedMembershipRequired');
    if (state === ACCESS.MEMBERSHIP_REQUIRED) return copyValue(copy, 'membershipRequired');
    return copyValue(copy, 'purchaseRequired');
  }

  function splitTrackTitle(displayTitle, fallbackArtist) {
    const parts = (displayTitle || '').split(' — ');
    if (fallbackArtist) return { artist: fallbackArtist, songTitle: displayTitle };
    if (parts.length > 1) return { artist: parts[0], songTitle: parts.slice(1).join(' — ') };
    return { artist: fallbackArtist || '', songTitle: displayTitle || '' };
  }

  function defaultTrackVersions(track) {
    const provider = track.videoProvider || 'placeholder';
    const embedUrl = track.videoEmbedUrl || '';
    return [
      { id: 'original', label: 'Original', provider, embedUrl },
      { id: 'mirror', label: 'Mirror', provider, embedUrl },
    ];
  }

  function normalizeTrack(raw, fitclip, index) {
    const displayTitle = raw.displayTitle || raw.title || [raw.artist, raw.songTitle].filter(Boolean).join(' — ');
    const parsed = splitTrackTitle(displayTitle, fitclip.fitclipNumber === 48 ? 'ILLIT' : '');
    const purchased = typeof raw.purchased === 'boolean'
      ? raw.purchased
      : raw.locked === undefined ? true : !raw.locked;
    const subscriptionStatus = raw.subscriptionStatus || 'active';
    const track = {
      ...raw,
      id: raw.id,
      fitclipNumber: fitclip.fitclipNumber,
      clipIndex: raw.clipIndex || raw.n || index + 1,
      n: raw.n || raw.clipIndex || index + 1,
      artist: raw.artist || parsed.artist,
      songTitle: raw.songTitle || parsed.songTitle,
      displayTitle,
      title: displayTitle,
      choreo: raw.choreo || raw.choreographer,
      choreographer: raw.choreographer || raw.choreo,
      videoProvider: raw.videoProvider || 'placeholder',
      videoEmbedUrl: raw.videoEmbedUrl || '',
      thumbnailUrl: raw.thumbnailUrl || '',
      purchased,
      subscriptionStatus,
      paymentProvider: raw.paymentProvider || 'cafe24',
    };

    track.versions = raw.versions || defaultTrackVersions(track);
    track.locked = !canWatchTrack(track);
    if (!track.price && canPurchaseTrack(track)) track.price = '₩2,500';
    return track;
  }

  function getTempoLabel(bpm) {
    return bpm < 100 ? 'LOW TEMPO' : (bpm <= 125 ? 'MEDIUM TEMPO' : 'HIGH TEMPO');
  }

  function computeIsAdmin(user, adminEmails) {
    return !!user && user.loggedIn && (adminEmails || []).includes(user.email);
  }

  window.FITHOP_TRACK_ACCESS = ACCESS;
  window.FITHOP_HELPERS = {
    getTrackAccessState,
    canWatchTrack,
    canPurchaseTrack,
    getPurchaseButtonLabel,
    getTrackStatusLabel,
    splitTrackTitle,
    defaultTrackVersions,
    normalizeTrack,
    getTempoLabel,
    computeIsAdmin,
  };
  window.FITHOP_DATA_HELPERS = {
    splitTrackTitle,
    defaultTrackVersions,
    normalizeTrack,
    getTempoLabel,
  };
  window.getTrackAccessState = getTrackAccessState;
  window.canWatchTrack = canWatchTrack;
  window.canPurchaseTrack = canPurchaseTrack;
  window.getPurchaseButtonLabel = getPurchaseButtonLabel;
  window.getTrackStatusLabel = getTrackStatusLabel;
  window.computeIsAdmin = computeIsAdmin;
})();
