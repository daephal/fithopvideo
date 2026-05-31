// FITHOP — My Account panel. Full-screen on mobile, right side panel on tablet/PC.
// Sections: language · membership card · subscription notice · purchased videos.
const { useState: useAccState, useEffect: useAccEffect } = React;

const ACC_LANGS = [
  { id: 'KR', flag: '🇰🇷' },
  { id: 'JP', flag: '🇯🇵' },
  { id: 'EN', flag: '🇺🇸' },
];

function subscriptionStatusLabel(status, t) {
  if (status === 'active') return t.status_active;
  if (status === 'inactive') return t.status_inactive;
  return t.membershipRequired || t.membership_required;
}

function StatusBadge({ status, t }) {
  const active = status === 'active';
  return <span className="fh-badge" data-active={active}>{subscriptionStatusLabel(status, t)}</span>;
}

function AccountView() {
  const f = useFithop();
  const t = f.t;
  const acc = window.RILLIZ_DATA.account;

  const [mockProvider, setMockProvider] = useAccState(f.subscription.provider);
  const [mockStatus, setMockStatus] = useAccState(f.subscription.status);

  useAccEffect(() => {
    setMockProvider(f.subscription.provider);
    setMockStatus(f.subscription.status);
  }, [f.subscriptionVersion]);

  if (!f.accountOpen) return null;
  const close = () => f.setAccountOpen(false);
  const stop = (e) => e.stopPropagation();
  const active = f.subscription.status === 'active';
  const method = (f.subscription.provider || 'cafe24').toUpperCase();
  const nextBilling = f.subscription.nextBillingDate ? f.subscription.nextBillingDate.slice(0, 10) : '-';
  const saveMockSubscription = () => {
    f.saveMockSubscription({ provider: mockProvider, status: mockStatus });
    f.showToast('정기결제 mock 상태가 저장되었습니다.');
  };

  return (
    <div className="fh-acc-scrim" onClick={close}>
      <aside className="fh-acc" onClick={stop} role="dialog" aria-modal="true" aria-label={t.nav_account}>
        <header className="fh-acc-top">
          <div className="fh-acc-heading">
            <span className="lbl">{acc && t.acc_member_label}</span>
            <h2>{t.nav_account}</h2>
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

          {/* admin menu (UI placeholder — gated by f.isAdmin inside AdminView) */}
          <button className="fh-admin-entry" onClick={() => { f.setAccountOpen(false); f.setAdminOpen(true); }}>
            <span className="ic"><Icon.Lock size={18} /></span>
            <span className="lb">{t.adminMenu}</span>
            <Icon.ChevronR size={16} />
          </button>

          {/* B — membership card */}
          <section className="fh-card">
            <div className="fh-mem-id">
              <div className="fh-avatar">{acc.name.slice(0, 1)}</div>
              <div className="fh-mem-meta">
                <span className="nm">{acc.name}</span>
                <span className="em">{acc.email}</span>
              </div>
              <StatusBadge status={f.subscription.status} t={t} />
            </div>
            <div className="fh-mem-grid">
              <div className="fh-mem-field">
                <span className="k">{t.membership}</span>
                <span className="v">{subscriptionStatusLabel(f.subscription.status, t)}</span>
              </div>
              <div className="fh-mem-field">
                <span className="k">{t.payment_method}</span>
                <span className="v">{method}</span>
              </div>
              <div className="fh-mem-field">
                <span className="k">{t.next_billing}</span>
                <span className="v">{nextBilling}</span>
              </div>
            </div>
            <div className="fh-mem-actions">
              <button className="fh-btn solid" onClick={() => {
                const nextStatus = f.subscription.status === 'active' ? 'inactive' : 'active';
                f.saveMockSubscription({ provider: f.subscription.provider, status: nextStatus });
              }}>
                <Icon.Card size={16} />{t.manage_membership}
              </button>
              <button className="fh-btn ghost" onClick={() => {
                f.saveMockSubscription({ provider: 'paypal', status: f.subscription.status });
                f.showToast(t.link_paypal);
              }}>
                <Icon.Link size={16} />{t.link_paypal}
              </button>
            </div>
          </section>

          <section className="fh-card">
            <div className="fh-sec-head">
              <h3>정기결제 mock</h3>
              <span className="fh-count">localStorage</span>
            </div>
            <div className="fh-mem-grid">
              <label className="fh-mem-field">
                <span className="k">provider</span>
                <select className="fh-input" value={mockProvider} onChange={(e) => setMockProvider(e.target.value)}>
                  <option value="cafe24">cafe24</option>
                  <option value="paypal">paypal</option>
                </select>
              </label>
              <label className="fh-mem-field">
                <span className="k">status</span>
                <select className="fh-input" value={mockStatus} onChange={(e) => setMockStatus(e.target.value)}>
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                  <option value="none">none</option>
                </select>
              </label>
              <div className="fh-mem-field">
                <span className="k">single purchase</span>
                <span className="v">{mockProvider}</span>
              </div>
            </div>
            <div className="fh-mem-actions">
              <button className="fh-btn primary" onClick={saveMockSubscription}><Icon.Card size={16} />{t.save}</button>
              <button className="fh-btn ghost" onClick={() => {
                f.resetMockSubscription();
                f.showToast('정기결제 mock 상태를 초기화했습니다.');
              }}>{t.delete}</button>
            </div>
            <p style={{ margin: 0, font: '500 12px/1.5 var(--font-sans)', color: 'var(--fg-3)' }}>
              테스트용 mock 상태입니다. 실제 결제 상태는 변경되지 않습니다.
            </p>
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
                  <span className="st" data-ok={active}>{active ? t.watch_available : t.membership_required}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}

window.AccountView = AccountView;
