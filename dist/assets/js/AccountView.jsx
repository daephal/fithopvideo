// FITHOP — My Account panel. Full-screen on mobile, right side panel on tablet/PC.
// Sections: language · account status · purchased videos · playlists · favorites.
const { useState: useAccState, useEffect: useAccEffect } = React;

const ACC_LANGS = [
  { id: 'KR', flag: '🇰🇷' },
  { id: 'JP', flag: '🇯🇵' },
  { id: 'EN', flag: '🇺🇸' },
];

function providerLabel(provider, t) {
  if (provider === 'paypal') return t.providerPayPal;
  if (provider === 'cafe24') return t.providerCafe24;
  return '-';
}

function subscriptionStatusLabel(status, t) {
  if (status === 'active') return t.subscriptionStatusActive;
  if (status === 'inactive') return t.subscriptionStatusInactive;
  return t.subscriptionStatusNone;
}

function loginStatusLabel(user, t) {
  return user && user.loggedIn ? t.loggedIn : t.loggedOut;
}

function formatDate(value, t) {
  if (!value) return t.noData;
  return String(value).slice(0, 10);
}

function trackTitle(track, fallback) {
  if (!track) return fallback || '';
  return [track.artist, track.songTitle].filter(Boolean).join(' - ') || track.displayTitle || track.title;
}

function StatusBadge({ status, t }) {
  return <span className="fh-badge" data-active={status === 'active'}>{subscriptionStatusLabel(status, t)}</span>;
}

function AccountField({ label, value }) {
  return (
    <div className="fh-mem-field">
      <span className="k">{label}</span>
      <span className="v">{value || '-'}</span>
    </div>
  );
}

function AccountSection({ title, count, children }) {
  return (
    <section className="fh-sec">
      <div className="fh-sec-head">
        <h3>{title}</h3>
        <span className="fh-count">{count}</span>
      </div>
      {children}
    </section>
  );
}

function AccountView() {
  const f = useFithop();
  const t = f.t;
  const user = f.currentUser;
  const subscription = user.loggedIn ? f.subscription : { ...f.subscription, status: 'none', nextBillingDate: null };
  const memberName = user.loggedIn ? user.name : t.guestUser;
  const memberEmail = user.loggedIn ? user.email : t.notLoggedIn;
  const [mockProvider, setMockProvider] = useAccState(f.subscription.provider);
  const [mockStatus, setMockStatus] = useAccState(f.subscription.status);

  useAccEffect(() => {
    setMockProvider(f.subscription.provider);
    setMockStatus(f.subscription.status);
  }, [f.subscriptionVersion, user.loggedIn]);

  if (!f.accountOpen) return null;
  const close = () => f.setAccountOpen(false);
  const stop = (e) => e.stopPropagation();

  const purchasedVideos = f.purchases.map(purchase => {
    const track = f.trackById(purchase.trackId);
    return {
      ...purchase,
      track,
      title: trackTitle(track, purchase.trackId),
      fitclipNumber: purchase.fitclipNumber || (track && track.fitclipNumber),
      canWatch: subscription.status === 'active',
      cover: track ? f.coverById(track.id) : '',
    };
  });
  const playlistRows = f.playlists.map(pl => {
    const latestId = (pl.trackIds || [])[Math.max(0, (pl.trackIds || []).length - 1)];
    const latestTrack = latestId ? f.trackById(latestId) : null;
    return { ...pl, latestTrack };
  });
  const favoriteTracks = f.favorites.map(id => f.trackById(id)).filter(Boolean);

  const saveMockSubscription = () => {
    f.saveMockSubscription({ provider: mockProvider, status: mockStatus });
    f.showToast(t.mockSubscriptionSaved);
  };

  return (
    <div className="fh-acc-scrim" onClick={close}>
      <aside className="fh-acc" onClick={stop} role="dialog" aria-modal="true" aria-label={t.nav_account}>
        <header className="fh-acc-top">
          <div className="fh-acc-heading">
            <span className="lbl">{t.acc_member_label}</span>
            <h2>{t.nav_account}</h2>
          </div>
          <button className="fh-icon-btn" onClick={close} aria-label={t.close}><Icon.Close size={20} /></button>
        </header>

        <div className="fh-acc-body">
          <div className="fh-acc-lang" role="tablist" aria-label={t.language_settings}>
            {ACC_LANGS.map(l => (
              <button key={l.id} className="fh-acc-lang-pill" data-active={f.lang === l.id}
                      role="tab" aria-selected={f.lang === l.id} onClick={() => f.setLang(l.id)}>
                <span className="flag">{l.flag}</span><span className="code">{l.id}</span>
              </button>
            ))}
          </div>

          {f.isAdmin ? (
            <button className="fh-admin-entry" onClick={() => { f.setAccountOpen(false); f.setAdminOpen(true); }}>
              <span className="ic"><Icon.Lock size={18} /></span>
              <span className="lb">{t.adminMenu}</span>
              <Icon.ChevronR size={16} />
            </button>
          ) : null}

          <section className="fh-card">
            <div className="fh-mem-id">
              <div className="fh-avatar">{memberName.slice(0, 1)}</div>
              <div className="fh-mem-meta">
                <span className="nm">{memberName}</span>
                <span className="em">{memberEmail}</span>
              </div>
              <StatusBadge status={subscription.status} t={t} />
            </div>
            <div className="fh-mem-grid">
              <AccountField label={t.loginStatus} value={loginStatusLabel(user, t)} />
              <AccountField label={t.loginProvider} value={user.loggedIn ? providerLabel(user.loginProvider, t) : '-'} />
              <AccountField label={t.subscriptionProvider} value={user.loggedIn ? providerLabel(subscription.provider, t) : '-'} />
              <AccountField label={t.subscriptionStatus} value={subscriptionStatusLabel(subscription.status, t)} />
              <AccountField label={t.next_billing} value={formatDate(subscription.nextBillingDate, t)} />
              <AccountField label={t.adminRole} value={f.isAdmin ? t.yes : t.no} />
            </div>
          </section>

          <section className="fh-notice">
            <span className="ttl">{t.sub_notice_title}</span>
            <p>{t.sub_notice_1}</p>
            <p>{t.sub_notice_2}</p>
          </section>

          <AccountSection title={t.purchased_videos} count={purchasedVideos.length}>
            <div className="fh-vid-list">
              {purchasedVideos.length ? purchasedVideos.map(video => (
                <button key={video.trackId} className="fh-vid" onClick={() => { f.showToast(video.title); close(); }}>
                  <span className="th" style={{ background: video.cover || 'var(--bg-elev-3)' }} />
                  <span className="meta">
                    <span className="t">FITCLIP {video.fitclipNumber} · {video.title}</span>
                    <span className="s">{formatDate(video.purchasedAt, t)} · {providerLabel(video.paymentProvider, t)}</span>
                  </span>
                  <span className="st" data-ok={video.canWatch}>{video.canWatch ? t.watch_available : t.membership_required}</span>
                </button>
              )) : (
                <div className="fh-empty">{t.noPurchasedVideos}</div>
              )}
            </div>
          </AccountSection>

          <AccountSection title={t.playlists_title} count={playlistRows.length}>
            <div className="fh-vid-list">
              {playlistRows.length ? playlistRows.map(pl => (
                <button key={pl.id} className="fh-vid" onClick={() => { f.setAccountOpen(false); f.setPlaylistOpen(true); }}>
                  <span className="th no-art"><Icon.Playlist size={22} /></span>
                  <span className="meta">
                    <span className="t">{pl.name}</span>
                    <span className="s">{(pl.trackIds || []).length} {t.tracks_suffix} · {t.recently_added}: {pl.latestTrack ? trackTitle(pl.latestTrack) : t.no_tracks}</span>
                  </span>
                </button>
              )) : (
                <div className="fh-empty">{t.no_playlists}</div>
              )}
            </div>
          </AccountSection>

          <AccountSection title={t.favorites} count={favoriteTracks.length}>
            <div className="fh-vid-list">
              {favoriteTracks.length ? favoriteTracks.map(track => (
                <button key={track.id} className="fh-vid" onClick={() => { f.setSelectedFitclip(track.fitclipNumber); f.requestPlay(track.id); close(); }}>
                  <span className="th" style={{ background: f.coverById(track.id) }} />
                  <span className="meta">
                    <span className="t">FITCLIP {track.fitclipNumber} · {trackTitle(track)}</span>
                    <span className="s">{track.category || t.noData} · {track.bpm} {t.bpm}</span>
                  </span>
                </button>
              )) : (
                <div className="fh-empty">{t.no_favorites}</div>
              )}
            </div>
          </AccountSection>

          <section className="fh-card fh-dev-card">
            <div className="fh-sec-head">
              <h3>{t.devMockControls}</h3>
              <span className="fh-count">localStorage</span>
            </div>
            <div className="fh-mem-actions">
              <button className="fh-btn solid" onClick={() => { f.mockLogin(); f.showToast(t.mockLoginDone); }}>
                <Icon.User size={16} />{t.mockLogin}
              </button>
              <button className="fh-btn ghost" onClick={() => { f.mockLogout(); f.showToast(t.mockLogoutDone); }}>
                <Icon.Lock size={16} />{t.mockLogout}
              </button>
            </div>
            <div className="fh-mem-grid">
              <label className="fh-mem-field">
                <span className="k">{t.subscriptionProvider}</span>
                <select className="fh-input" value={mockProvider} onChange={(e) => setMockProvider(e.target.value)}>
                  <option value="cafe24">{t.providerCafe24}</option>
                  <option value="paypal">{t.providerPayPal}</option>
                </select>
              </label>
              <label className="fh-mem-field">
                <span className="k">{t.subscriptionStatus}</span>
                <select className="fh-input" value={mockStatus} onChange={(e) => setMockStatus(e.target.value)}>
                  <option value="active">{t.subscriptionStatusActive}</option>
                  <option value="inactive">{t.subscriptionStatusInactive}</option>
                  <option value="none">{t.subscriptionStatusNone}</option>
                </select>
              </label>
              <div className="fh-mem-field">
                <span className="k">{t.payment_method}</span>
                <span className="v">{providerLabel(mockProvider, t)}</span>
              </div>
            </div>
            <div className="fh-mem-actions">
              <button className="fh-btn primary" onClick={saveMockSubscription}>
                <Icon.Card size={16} />{t.save}
              </button>
              <button className="fh-btn ghost" onClick={() => { f.resetMockSubscription(); f.showToast(t.mockSubscriptionReset); }}>
                {t.delete}
              </button>
            </div>
            <p className="fh-dev-note">{t.devMockNote}</p>
          </section>
        </div>
      </aside>
    </div>
  );
}

window.AccountView = AccountView;
