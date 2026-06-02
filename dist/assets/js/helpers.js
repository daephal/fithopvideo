// Shared helpers for mock auth, subscriptions, purchases, track access, and labels.
(function () {
  const ACCESS = Object.freeze({
    WATCHABLE: 'watchable',
    PURCHASE_AVAILABLE: 'purchase_available',
    PURCHASED_MEMBERSHIP_REQUIRED: 'purchased_membership_required',
    MEMBERSHIP_REQUIRED: 'membership_required',
  });
  const PROVIDERS = ['cafe24', 'paypal'];
  const SUBSCRIPTION_STATUSES = ['active', 'inactive', 'none'];
  const DEFAULT_USER = Object.freeze({
    id: 'user_001',
    cafe24MemberId: 'bbyeifa',
    email: 'daephal@gmail.com',
    name: '대팔',
    loggedIn: true,
    loginProvider: 'cafe24',
    membershipProvider: 'cafe24',
    subscriptionStatus: 'active',
    isAdmin: true,
  });
  const LOGGED_OUT_USER = Object.freeze({
    ...DEFAULT_USER,
    email: '',
    name: 'Guest',
    loggedIn: false,
    subscriptionStatus: 'none',
    isAdmin: false,
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

  function getStorage() {
    try {
      return window.localStorage || null;
    } catch (e) {
      return null;
    }
  }

  function storageKey(name, fallback) {
    return (window.FITHOP_STORAGE_KEYS && window.FITHOP_STORAGE_KEYS[name]) || fallback;
  }

  function readJson(key, fallback) {
    const storage = getStorage();
    if (!storage) return fallback;
    try {
      const raw = storage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.warn(`[FITHOP] Failed to read localStorage key "${key}".`, e);
      return fallback;
    }
  }

  function writeJson(key, value) {
    const storage = getStorage();
    if (!storage) return;
    try {
      storage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`[FITHOP] Failed to write localStorage key "${key}".`, e);
    }
  }

  function removeJson(key) {
    const storage = getStorage();
    if (!storage) return;
    try {
      storage.removeItem(key);
    } catch (e) {
      console.warn(`[FITHOP] Failed to remove localStorage key "${key}".`, e);
    }
  }

  function currentUserStorageKey() {
    return storageKey('currentUser', 'fithop-current-user');
  }

  function purchaseStorageKey() {
    return storageKey('purchases', 'fithop-purchases');
  }

  function subscriptionStorageKey() {
    return storageKey('subscription', 'fithop-subscription');
  }

  function normalizeProvider(provider, fallback = 'cafe24') {
    return PROVIDERS.includes(provider) ? provider : fallback;
  }

  function normalizeSubscriptionStatus(status, fallback = 'none') {
    return SUBSCRIPTION_STATUSES.includes(status) ? status : fallback;
  }

  function normalizeUser(user) {
    const base = user && user.loggedIn === false ? LOGGED_OUT_USER : DEFAULT_USER;
    const merged = { ...base, ...(user || {}) };
    return {
      ...merged,
      id: merged.id || DEFAULT_USER.id,
      cafe24MemberId: merged.cafe24MemberId || DEFAULT_USER.cafe24MemberId,
      loginProvider: normalizeProvider(merged.loginProvider, DEFAULT_USER.loginProvider),
      membershipProvider: normalizeProvider(merged.membershipProvider, DEFAULT_USER.membershipProvider),
      subscriptionStatus: normalizeSubscriptionStatus(merged.subscriptionStatus, DEFAULT_USER.subscriptionStatus),
      isAdmin: merged.loggedIn ? merged.isAdmin === true : false,
    };
  }

  function getDefaultMockUser() {
    return normalizeUser(DEFAULT_USER);
  }

  function getCurrentUser() {
    const stored = readJson(currentUserStorageKey(), null);
    if (stored) return normalizeUser(stored);
    const dataUser = window.RILLIZ_DATA && window.RILLIZ_DATA.auth && window.RILLIZ_DATA.auth.currentUser;
    return normalizeUser(dataUser || DEFAULT_USER);
  }

  function setCurrentUser(user) {
    const normalized = normalizeUser(user);
    writeJson(currentUserStorageKey(), normalized);
    if (window.RILLIZ_DATA && window.RILLIZ_DATA.auth) {
      window.RILLIZ_DATA.auth.currentUser = normalized;
    }
    return normalized;
  }

  function clearCurrentUser() {
    const normalized = normalizeUser(LOGGED_OUT_USER);
    writeJson(currentUserStorageKey(), normalized);
    if (window.RILLIZ_DATA && window.RILLIZ_DATA.auth) {
      window.RILLIZ_DATA.auth.currentUser = normalized;
    }
    return normalized;
  }

  function resetCurrentUser() {
    removeJson(currentUserStorageKey());
    const normalized = getDefaultMockUser();
    if (window.RILLIZ_DATA && window.RILLIZ_DATA.auth) {
      window.RILLIZ_DATA.auth.currentUser = normalized;
    }
    return normalized;
  }

  function isLoggedIn(user) {
    const current = user || getCurrentUser();
    return current.loggedIn === true;
  }

  function isAdminUser(user) {
    const current = user || getCurrentUser();
    if (!current || current.loggedIn !== true) return false;
    if (current.isAdmin === true) return true;
    const emails = (window.RILLIZ_DATA && window.RILLIZ_DATA.auth && window.RILLIZ_DATA.auth.adminEmails) || [];
    return emails.includes(current.email);
  }

  function userIdFor(userOrId) {
    if (typeof userOrId === 'string') return userOrId;
    const user = userOrId || getCurrentUser();
    return user.id || user.cafe24MemberId || user.email || DEFAULT_USER.id;
  }

  function defaultSubscription(userId) {
    const user = getCurrentUser();
    const status = user.loggedIn === false ? 'none' : normalizeSubscriptionStatus(user.subscriptionStatus, 'active');
    const provider = normalizeProvider(user.membershipProvider, 'cafe24');
    return {
      userId: userId || userIdFor(user),
      provider,
      status,
      startedAt: '2026-05-01T00:00:00.000Z',
      nextBillingDate: status === 'active' ? '2026-06-01T00:00:00.000Z' : null,
      endedAt: status === 'active' ? null : new Date().toISOString(),
    };
  }

  function normalizeSubscription(userId, subscription) {
    const current = defaultSubscription(userId);
    const merged = { ...current, ...(subscription || {}), userId };
    const status = normalizeSubscriptionStatus(merged.status, current.status);
    const provider = normalizeProvider(merged.provider, current.provider);
    return {
      userId,
      provider,
      status,
      startedAt: merged.startedAt || current.startedAt,
      nextBillingDate: status === 'active' ? (merged.nextBillingDate || current.nextBillingDate) : null,
      endedAt: status === 'active' ? null : (merged.endedAt || new Date().toISOString()),
    };
  }

  function readSubscriptionMap() {
    const data = readJson(subscriptionStorageKey(), {});
    if (!data || typeof data !== 'object') return {};

    if (!Array.isArray(data) && data.userId && data.status) {
      const id = userIdFor(data.userId);
      return { [id]: normalizeSubscription(id, data) };
    }

    if (Array.isArray(data)) {
      return data.reduce((map, item) => {
        if (!item || !item.userId) return map;
        const id = userIdFor(item.userId);
        map[id] = normalizeSubscription(id, item);
        return map;
      }, {});
    }

    return Object.keys(data).reduce((map, id) => {
      if (!data[id]) return map;
      map[id] = normalizeSubscription(id, data[id]);
      return map;
    }, {});
  }

  function writeSubscriptionMap(map) {
    writeJson(subscriptionStorageKey(), map);
  }

  function getStoredSubscription(userId) {
    const id = userIdFor(userId);
    const map = readSubscriptionMap();
    return map[id] || null;
  }

  function getSubscription(userId) {
    const id = userIdFor(userId);
    return getStoredSubscription(id) || defaultSubscription(id);
  }

  function mirrorCurrentUserSubscription(userId, subscription) {
    const user = getCurrentUser();
    if (userIdFor(user) !== userId) return;
    setCurrentUser({
      ...user,
      membershipProvider: subscription.provider,
      subscriptionStatus: subscription.status,
    });
  }

  function setMockSubscription(userId, subscription) {
    let id = userIdFor(userId);
    let next = subscription;
    if (typeof userId === 'object' && subscription === undefined) {
      next = userId;
      id = userIdFor();
    }
    const map = readSubscriptionMap();
    const saved = normalizeSubscription(id, { ...getSubscription(id), ...(next || {}) });
    map[id] = saved;
    writeSubscriptionMap(map);
    mirrorCurrentUserSubscription(id, saved);
    return saved;
  }

  function clearMockSubscription(userId) {
    const id = userIdFor(userId);
    const map = readSubscriptionMap();
    delete map[id];
    writeSubscriptionMap(map);
    const fallback = defaultSubscription(id);
    mirrorCurrentUserSubscription(id, fallback);
    return fallback;
  }

  function isSubscriptionActive(userOrId) {
    return getSubscriptionStatus(userOrId) === 'active';
  }

  function getMembershipProvider(user) {
    return normalizeUser(user || getCurrentUser()).membershipProvider;
  }

  function getSubscriptionProvider(userOrId) {
    return getSubscription(userIdFor(userOrId)).provider;
  }

  function getSubscriptionStatus(userOrId) {
    if (typeof userOrId === 'object' && userOrId !== null && 'subscriptionStatus' in userOrId) {
      return normalizeSubscriptionStatus(userOrId.subscriptionStatus, 'none');
    }
    return getSubscription(userIdFor(userOrId)).status;
  }

  function readPurchases() {
    const data = readJson(purchaseStorageKey(), []);
    const list = Array.isArray(data) ? data : (data && Array.isArray(data.purchases) ? data.purchases : []);
    return list.filter(p => p && p.userId && p.trackId);
  }

  function writePurchases(purchases) {
    writeJson(purchaseStorageKey(), purchases);
  }

  function getPurchases(userId) {
    const id = userIdFor(userId);
    return readPurchases().filter(p => p.userId === id && p.status === 'paid');
  }

  function hasPurchasedTrack(userId, trackId) {
    if (!trackId) return false;
    return getPurchases(userId).some(p => p.trackId === trackId);
  }

  function getPurchaseProviderForUser(user) {
    return getSubscriptionProvider(userIdFor(user));
  }

  function createMockPurchase(user, track) {
    if (!track || !track.id) return null;
    const currentUser = user || getCurrentUser();
    if (!isLoggedIn(currentUser)) return null;
    const userId = userIdFor(currentUser);
    const purchases = readPurchases().filter(p => !(p.userId === userId && p.trackId === track.id));
    const record = {
      userId,
      trackId: track.id,
      fitclipNumber: track.fitclipNumber,
      purchasedAt: new Date().toISOString(),
      paymentProvider: getPurchaseProviderForUser(currentUser),
      priceKrw: 5000,
      priceUsd: 3.9,
      status: 'paid',
    };
    writePurchases([...purchases, record]);
    return record;
  }

  function removeMockPurchase(userId, trackId) {
    const id = userIdFor(userId);
    const purchases = readPurchases().filter(p => !(p.userId === id && p.trackId === trackId));
    writePurchases(purchases);
  }

  function loginWithCafe24() {
    // Placeholder: replace this mock with the real Cafe24 OAuth/session flow later.
    return Promise.resolve(setCurrentUser(getDefaultMockUser()));
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

  function getEffectiveSubscriptionStatus(track, user) {
    const currentUser = user || getCurrentUser();
    if (currentUser.loggedIn === false) return 'none';
    const id = userIdFor(currentUser);
    const stored = getStoredSubscription(id);
    if (stored) return stored.status;
    if (track && typeof track.subscriptionStatus === 'string') {
      return normalizeSubscriptionStatus(track.subscriptionStatus, 'none');
    }
    return getSubscriptionStatus(id);
  }

  function isTrackPurchased(track, user) {
    if (!track) return false;
    const currentUser = user || getCurrentUser();
    if (currentUser.loggedIn === false) return false;
    return track.purchased === true || hasPurchasedTrack(userIdFor(currentUser), track.id);
  }

  function getTrackAccessState(track, user) {
    if (!track) return ACCESS.MEMBERSHIP_REQUIRED;
    const purchased = isTrackPurchased(track, user);
    const subscriptionStatus = getEffectiveSubscriptionStatus(track, user);

    if (purchased && subscriptionStatus === 'active') return ACCESS.WATCHABLE;
    if (purchased && (subscriptionStatus === 'inactive' || subscriptionStatus === 'none')) {
      return ACCESS.PURCHASED_MEMBERSHIP_REQUIRED;
    }
    if (!purchased && subscriptionStatus === 'active') return ACCESS.PURCHASE_AVAILABLE;
    return ACCESS.MEMBERSHIP_REQUIRED;
  }

  function canWatchTrack(track, user) {
    return getTrackAccessState(track, user) === ACCESS.WATCHABLE;
  }

  function canPurchaseTrack(track, user) {
    return getTrackAccessState(track, user) === ACCESS.PURCHASE_AVAILABLE;
  }

  function getPurchaseButtonLabel(track, copy, user) {
    const state = getTrackAccessState(track, user);
    if (state === ACCESS.WATCHABLE) return copyValue(copy, 'owned');
    if (state === ACCESS.PURCHASED_MEMBERSHIP_REQUIRED) return copyValue(copy, 'purchasedMembershipRequired');
    if (state === ACCESS.MEMBERSHIP_REQUIRED) return copyValue(copy, 'membershipRequired');
    return copyValue(copy, 'buy_now') || copyValue(copy, 'buy');
  }

  function getTrackStatusLabel(track, copy, user) {
    const state = getTrackAccessState(track, user);
    if (state === ACCESS.WATCHABLE) return copyValue(copy, 'available');
    if (state === ACCESS.PURCHASED_MEMBERSHIP_REQUIRED) return copyValue(copy, 'purchasedMembershipRequired');
    if (state === ACCESS.MEMBERSHIP_REQUIRED) return copyValue(copy, 'membershipRequired');
    return copyValue(copy, 'purchaseRequired');
  }

  window.FITHOP_TRACK_ACCESS = ACCESS;
  window.FITHOP_HELPERS = {
    getCurrentUser,
    setCurrentUser,
    clearCurrentUser,
    resetCurrentUser,
    getDefaultMockUser,
    isLoggedIn,
    isAdminUser,
    getMembershipProvider,
    getSubscription,
    setMockSubscription,
    clearMockSubscription,
    isSubscriptionActive,
    getSubscriptionProvider,
    getSubscriptionStatus,
    getPurchases,
    hasPurchasedTrack,
    createMockPurchase,
    removeMockPurchase,
    getPurchaseProviderForUser,
    loginWithCafe24,
    logoutCafe24,
    fetchCafe24Member,
    fetchCafe24SubscriptionStatus,
    getTrackAccessState,
    canWatchTrack,
    canPurchaseTrack,
    getPurchaseButtonLabel,
    getTrackStatusLabel,
  };
  window.getCurrentUser = getCurrentUser;
  window.setCurrentUser = setCurrentUser;
  window.clearCurrentUser = clearCurrentUser;
  window.resetCurrentUser = resetCurrentUser;
  window.getDefaultMockUser = getDefaultMockUser;
  window.isLoggedIn = isLoggedIn;
  window.isAdminUser = isAdminUser;
  window.getMembershipProvider = getMembershipProvider;
  window.getSubscription = getSubscription;
  window.setMockSubscription = setMockSubscription;
  window.clearMockSubscription = clearMockSubscription;
  window.isSubscriptionActive = isSubscriptionActive;
  window.getSubscriptionProvider = getSubscriptionProvider;
  window.getSubscriptionStatus = getSubscriptionStatus;
  window.getPurchases = getPurchases;
  window.hasPurchasedTrack = hasPurchasedTrack;
  window.createMockPurchase = createMockPurchase;
  window.removeMockPurchase = removeMockPurchase;
  window.getPurchaseProviderForUser = getPurchaseProviderForUser;
  window.loginWithCafe24 = loginWithCafe24;
  window.logoutCafe24 = logoutCafe24;
  window.fetchCafe24Member = fetchCafe24Member;
  window.fetchCafe24SubscriptionStatus = fetchCafe24SubscriptionStatus;
  window.getTrackAccessState = getTrackAccessState;
  window.canWatchTrack = canWatchTrack;
  window.canPurchaseTrack = canPurchaseTrack;
  window.getPurchaseButtonLabel = getPurchaseButtonLabel;
  window.getTrackStatusLabel = getTrackStatusLabel;
})();
