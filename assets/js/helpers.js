// Shared helpers for track access and labels.
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

  function copyValue(copy, key) {
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

  window.FITHOP_TRACK_ACCESS = ACCESS;
  window.FITHOP_HELPERS = {
    getTrackAccessState,
    canWatchTrack,
    canPurchaseTrack,
    getPurchaseButtonLabel,
    getTrackStatusLabel,
  };
  window.getTrackAccessState = getTrackAccessState;
  window.canWatchTrack = canWatchTrack;
  window.canPurchaseTrack = canPurchaseTrack;
  window.getPurchaseButtonLabel = getPurchaseButtonLabel;
  window.getTrackStatusLabel = getTrackStatusLabel;
})();
