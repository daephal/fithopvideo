// FITHOP — My Account panel. Full-screen on mobile, right side panel on tablet/PC.
// Sections: language · membership card · subscription notice · purchased videos.
const { useState: useAccState } = React;

const ACC_LANGS = [
  { id: 'KR', flag: '🇰🇷' },
  { id: 'JP', flag: '🇯🇵' },
  { id: 'EN', flag: '🇺🇸' },
];

function StatusBadge({ active, t }) {
  return <span className="fh-badge" data-active={active}>{active ? t.status_active : t.status_inactive}</span>;
}

function AccountView() {
  const f = useFithop();
  const t = f.t;
  const acc = window.RILLIZ_DATA.account;
  const user = f.currentUser;
  const loggedIn = f.isLoggedIn;
  const subscriptionActive = f.subscriptionActive;
  const membershipProvider = f.getMembershipProvider(user) || acc.paymentMethod;

  const [method, setMethod] = useAccState(membershipProvider.toUpperCase());

  if (!f.accountOpen) return null;
  const close = () => f.setAccountOpen(false);
  const stop = (e) => e.stopPropagation();
  const toggleSubscription = () => {
    if (!user) return;
    const nextStatus = subscriptionActive ? 'inactive' : 'active';
    f.setCurrentUser({ ...user, subscriptionStatus: nextStatus });
    f.showToast(nextStatus === 'active' ? t.status_active : t.status_inactive);
  };
  const connectMockPaypal = () => {
    if (user) f.setCurrentUser({ ...user, membershipProvider: 'paypal' });
    setMethod('PAYPAL');
    f.showToast(t.link_paypal);
  };
  const doLogin = () => f.loginWithCafe24().then(() => f.showToast(t.login));
  const doLogout = () => f.logoutCafe24().then(() => f.showToast(t.logout || '로그아웃'));

  return (
    <div className="fh-acc-scrim" onClick={close}>
      <aside className="fh-acc" onClick={stop} role="dialog" aria-modal="true" aria-label={loggedIn ? t.nav_account : t.login}>
        <header className="fh-acc-top">
          <div className="fh-acc-heading">
            <span className="lbl">{loggedIn ? t.acc_member_label : 'FITHOP'}</span>
            <h2>{loggedIn ? t.nav_account : t.login}</h2>
          </div>
          <button className="fh-icon-btn" onClick={close} aria-label={t.close}><Icon.Close size={20} /></button>
        </header>

        <div className="fh-acc-body">
          {/* language — switch at the top of the account page */}
          <div className="fh-acc-lang" role="tablist" aria-label={t.language_settings}>
            {ACC_LANGS.map(l => (
              <button key={l.id} className="fh-acc-lang-pill" data-active={f.lang === l.id}
                      role="tab" aria-selected={f.lang === l.id} onClick={() => f.setLang(l.id)}>
                <span className="flag">{l.flag}</span><span className="code">{l.id}</span>
              </button>
            ))}
          </div>

          {loggedIn ? (
            <React.Fragment>
              {f.isAdmin ? (
                <button className="fh-admin-entry" onClick={() => { f.setAccountOpen(false); f.setAdminOpen(true); }}>
                  <span className="ic"><Icon.Lock size={18} /></span>
                  <span className="lb">{t.adminMenu}</span>
                  <Icon.ChevronR size={16} />
                </button>
              ) : null}

              {/* B — membership card */}
              <section className="fh-card">
                <div className="fh-mem-id">
                  <div className="fh-avatar">{(user.name || user.email || 'F').slice(0, 1)}</div>
                  <div className="fh-mem-meta">
                    <span className="nm">{user.name}</span>
                    <span className="em">{user.email}</span>
                  </div>
                  <StatusBadge active={subscriptionActive} t={t} />
                </div>
                <div className="fh-mem-grid">
                  <div className="fh-mem-field">
                    <span className="k">{t.membership}</span>
                    <span className="v">{subscriptionActive ? t.status_active : t.status_inactive}</span>
                  </div>
                  <div className="fh-mem-field">
                    <span className="k">{t.payment_method}</span>
                    <span className="v">{method}</span>
                  </div>
                  <div className="fh-mem-field">
                    <span className="k">Cafe24 ID</span>
                    <span className="v">{user.cafe24MemberId || '-'}</span>
                  </div>
                </div>
                <div className="fh-mem-actions">
                  <button className="fh-btn solid" onClick={toggleSubscription}>
                    <Icon.Card size={16} />{t.manage_membership}
                  </button>
                  <button className="fh-btn ghost" onClick={connectMockPaypal}>
                    <Icon.Link size={16} />{t.link_paypal}
                  </button>
                </div>
                <div className="fh-mem-actions">
                  <button className="fh-btn ghost" onClick={doLogout}>
                    <Icon.User size={16} />{t.logout || '로그아웃'}
                  </button>
                </div>
              </section>

              {/* C — subscription notice */}
              <section className="fh-notice">
                <span className="ttl">{t.sub_notice_title}</span>
                <p>{t.sub_notice_1}</p>
                <p>{t.sub_notice_2}</p>
              </section>

              {/* D — purchased videos */}
              <section className="fh-sec">
                <div className="fh-sec-head">
                  <h3>{t.purchased_videos}</h3>
                  <span className="fh-count">{acc.purchased.length}</span>
                </div>
                <div className="fh-vid-list">
                  {acc.purchased.map(v => (
                    <button key={v.id} className="fh-vid" onClick={() => { f.showToast(v.title); close(); }}>
                      <span className="th" style={{ background: v.cover }} />
                      <span className="meta">
                        <span className="t">{v.title}</span>
                        <span className="s">{v.meta}</span>
                      </span>
                      <span className="st" data-ok={subscriptionActive}>{subscriptionActive ? t.watch_available : t.membership_required}</span>
                    </button>
                  ))}
                </div>
              </section>
            </React.Fragment>
          ) : (
            <section className="fh-card">
              <div className="fh-mem-id">
                <div className="fh-avatar">F</div>
                <div className="fh-mem-meta">
                  <span className="nm">{t.login}</span>
                  <span className="em">Cafe24 mock session</span>
                </div>
              </div>
              <button className="fh-btn solid" onClick={doLogin}>
                <Icon.User size={16} />{t.login}
              </button>
            </section>
          )}
        </div>
      </aside>
    </div>
  );
}

window.AccountView = AccountView;
