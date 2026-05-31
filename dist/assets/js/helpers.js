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

  function authStorageKey() {
    return (window.FITHOP_STORAGE_KEYS && window.FITHOP_STORAGE_KEYS.currentUser) || 'fithop-current-user';
  }

  function mockCurrentUser() {
    return (window.RILLIZ_DATA && window.RILLIZ_DATA.auth && window.RILLIZ_DATA.auth.currentUser) || null;
  }

  function normalizeUser(user) {
    if (!user) return null;
    return {
      id: user.id || '',
      cafe24MemberId: user.cafe24MemberId || '',
      email: user.email || '',
      name: user.name || '',
      loginProvider: user.loginProvider || 'cafe24',
      membershipProvider: user.membershipProvider || 'cafe24',
      subscriptionStatus: user.subscriptionStatus || 'none',
      isAdmin: user.isAdmin === true,
    };
  }

  function getCurrentUser() {
    const storage = window.localStorage;
    try {
      const saved = storage && storage.getItem(authStorageKey());
      if (saved) return normalizeUser(JSON.parse(saved));
    } catch (e) {}
    return normalizeUser(mockCurrentUser());
  }

  function setCurrentUser(user) {
    const normalized = normalizeUser(user);
    const storage = window.localStorage;
    try {
      if (storage && normalized) storage.setItem(authStorageKey(), JSON.stringify(normalized));
      else if (storage) storage.removeItem(authStorageKey());
    } catch (e) {}
    if (window.RILLIZ_DATA && window.RILLIZ_DATA.auth) window.RILLIZ_DATA.auth.currentUser = normalized;
    return normalized;
  }

  function clearCurrentUser() {
    const storage = window.localStorage;
    try { if (storage) storage.removeItem(authStorageKey()); } catch (e) {}
    if (window.RILLIZ_DATA && window.RILLIZ_DATA.auth) window.RILLIZ_DATA.auth.currentUser = null;
    return null;
  }

  function isLoggedIn() {
    return !!getCurrentUser();
  }

  function isAdminUser(user) {
    const raw = user || getCurrentUser();
    if (!raw) return false;
    if (Object.prototype.hasOwnProperty.call(raw, 'isAdmin')) return raw.isAdmin === true;
    const target = normalizeUser(raw);
    const emails = (window.RILLIZ_DATA && window.RILLIZ_DATA.auth && window.RILLIZ_DATA.auth.adminEmails) || [];
    return !!target && emails.includes(target.email);
  }

  function getMembershipProvider(user) {
    const target = normalizeUser(user || getCurrentUser());
    return target ? target.membershipProvider : '';
  }

  function getSubscriptionStatus(user) {
    const target = normalizeUser(user || getCurrentUser());
    return target ? target.subscriptionStatus : 'none';
  }

  function isSubscriptionActive(user) {
    return getSubscriptionStatus(user) === 'active';
  }

  function loginWithCafe24() {
    // Placeholder: replace this mock with the real Cafe24 OAuth/session flow later.
    const user = normalizeUser(mockCurrentUser()) || {
      id: 'user_001',
      cafe24MemberId: 'bbyeifa',
      email: 'daephal@gmail.com',
      name: 'FITHOP ADMIN',
      loginProvider: 'cafe24',
      membershipProvider: 'cafe24',
      subscriptionStatus: 'active',
      isAdmin: true,
    };
    return Promise.resolve(setCurrentUser(user));
  }

  function logoutCafe24() {
    // Placeholder: replace this mock with Cafe24 session invalidation later.
    clearCurrentUser();
    return Promise.resolve({ ok: true });
  }

  function fetchCafe24Member() {
    // Placeholder: replace this mock with Cafe24 member API lookup later.
    return Promise.resolve(getCurrentUser());
  }

  function fetchCafe24SubscriptionStatus() {
    // Placeholder: replace this mock with Cafe24 subscription/payment status lookup later.
    return Promise.resolve(getSubscriptionStatus(getCurrentUser()));
  }

  function getTrackAccessState(track) {
    if (!track) return ACCESS.MEMBERSHIP_REQUIRED;
    const purchased = track.purchased === true;
    const userStatus = getSubscriptionStatus(getCurrentUser());
    const trackStatus = track.subscriptionStatus || userStatus || 'none';
    const subscriptionStatus = userStatus !== 'active' && trackStatus === 'active' ? userStatus : trackStatus;

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
    getCurrentUser,
    setCurrentUser,
    clearCurrentUser,
    isLoggedIn,
    isAdminUser,
    getMembershipProvider,
    getSubscriptionStatus,
    isSubscriptionActive,
    loginWithCafe24,
    logoutCafe24,
    fetchCafe24Member,
    fetchCafe24SubscriptionStatus,
  };
  window.getTrackAccessState = getTrackAccessState;
  window.canWatchTrack = canWatchTrack;
  window.canPurchaseTrack = canPurchaseTrack;
  window.getPurchaseButtonLabel = getPurchaseButtonLabel;
  window.getTrackStatusLabel = getTrackStatusLabel;
  window.getCurrentUser = getCurrentUser;
  window.setCurrentUser = setCurrentUser;
  window.clearCurrentUser = clearCurrentUser;
  window.isLoggedIn = isLoggedIn;
  window.isAdminUser = isAdminUser;
  window.getMembershipProvider = getMembershipProvider;
  window.getSubscriptionStatus = getSubscriptionStatus;
  window.isSubscriptionActive = isSubscriptionActive;
  window.loginWithCafe24 = loginWithCafe24;
  window.logoutCafe24 = logoutCafe24;
  window.fetchCafe24Member = fetchCafe24Member;
  window.fetchCafe24SubscriptionStatus = fetchCafe24SubscriptionStatus;
})();
