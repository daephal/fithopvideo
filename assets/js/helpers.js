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

  function purchaseStorageKey() {
    return (window.FITHOP_STORAGE_KEYS && window.FITHOP_STORAGE_KEYS.purchases) || 'fithop-purchases';
  }

  function getMockUser() {
    const user = window.RILLIZ_DATA && window.RILLIZ_DATA.auth && window.RILLIZ_DATA.auth.currentUser;
    return user || {
      id: 'user_001',
      email: 'daephal@gmail.com',
      name: 'FITHOP ADMIN',
      membershipProvider: 'cafe24',
      subscriptionStatus: 'active',
    };
  }

  function getUserId(user) {
    const target = user || getMockUser();
    return (target && (target.id || target.cafe24MemberId || target.email)) || 'guest';
  }

  function readPurchaseList() {
    const storage = window.localStorage;
    try {
      const raw = storage && storage.getItem(purchaseStorageKey());
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function writePurchaseList(purchases) {
    const storage = window.localStorage;
    try { if (storage) storage.setItem(purchaseStorageKey(), JSON.stringify(purchases)); } catch (e) {}
    return purchases;
  }

  function getPurchases(userId) {
    const uid = userId || getUserId(getMockUser());
    return readPurchaseList().filter(p => p && p.userId === uid && p.status === 'paid');
  }

  function hasPurchasedTrack(userId, trackId) {
    if (!trackId) return false;
    return getPurchases(userId).some(p => p.trackId === trackId);
  }

  function getPurchaseProviderForUser(user) {
    const provider = ((user && user.membershipProvider) || '').toLowerCase();
    return provider === 'paypal' ? 'paypal' : 'cafe24';
  }

  function createMockPurchase(user, track) {
    const targetUser = user || getMockUser();
    const provider = getPurchaseProviderForUser(targetUser);
    const purchase = {
      userId: getUserId(targetUser),
      trackId: track.id,
      fitclipNumber: Number(track.fitclipNumber) || 0,
      purchasedAt: new Date().toISOString(),
      paymentProvider: provider,
      priceKrw: 5000,
      priceUsd: 3.9,
      status: 'paid',
    };
    const next = readPurchaseList().filter(p => !(p.userId === purchase.userId && p.trackId === purchase.trackId));
    next.push(purchase);
    writePurchaseList(next);
    return purchase;
  }

  function removeMockPurchase(userId, trackId) {
    const next = readPurchaseList().filter(p => !(p.userId === userId && p.trackId === trackId));
    writePurchaseList(next);
    return next;
  }

  function getUserSubscriptionStatus(user) {
    const target = user || getMockUser();
    if (target && target.subscriptionStatus) return target.subscriptionStatus;
    const account = window.RILLIZ_DATA && window.RILLIZ_DATA.account;
    return account && account.membershipActive ? 'active' : 'inactive';
  }

  function getTrackAccessState(track) {
    if (!track) return ACCESS.MEMBERSHIP_REQUIRED;
    const user = getMockUser();
    const uid = getUserId(user);
    const hasMockPurchase = hasPurchasedTrack(uid, track.id);
    const purchased = track.purchased === true || hasMockPurchase;
    const subscriptionStatus = hasMockPurchase
      ? getUserSubscriptionStatus(user)
      : (track.subscriptionStatus || 'none');

    if (purchased && subscriptionStatus === 'none') return ACCESS.PURCHASED_MEMBERSHIP_REQUIRED;
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
    getPurchases,
    hasPurchasedTrack,
    createMockPurchase,
    removeMockPurchase,
    getPurchaseProviderForUser,
  };
  window.getTrackAccessState = getTrackAccessState;
  window.canWatchTrack = canWatchTrack;
  window.canPurchaseTrack = canPurchaseTrack;
  window.getPurchaseButtonLabel = getPurchaseButtonLabel;
  window.getTrackStatusLabel = getTrackStatusLabel;
  window.getPurchases = getPurchases;
  window.hasPurchasedTrack = hasPurchasedTrack;
  window.createMockPurchase = createMockPurchase;
  window.removeMockPurchase = removeMockPurchase;
  window.getPurchaseProviderForUser = getPurchaseProviderForUser;
})();
