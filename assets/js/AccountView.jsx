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

  const [active, setActive] = useAccState(acc.membershipActive);
  const [method, setMethod] = useAccState(acc.paymentMethod);

  if (!f.accountOpen) return null;
  const close = () => f.setAccountOpen(false);
  const stop = (e) => e.stopPropagation();

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
              <StatusBadge active={active} t={t} />
            </div>
            <div className="fh-mem-grid">
              <div className="fh-mem-field">
                <span className="k">{t.membership}</span>
                <span className="v">{active ? t.status_active : t.status_inactive}</span>
              </div>
              <div className="fh-mem-field">
                <span className="k">{t.payment_method}</span>
                <span className="v">{method}</span>
              </div>
              <div className="fh-mem-field">
                <span className="k">{t.next_billing}</span>
                <span className="v">{acc.nextBilling}</span>
              </div>
            </div>
            <div className="fh-mem-actions">
              <button className="fh-btn solid" onClick={() => setActive(a => !a)}>
                <Icon.Card size={16} />{t.manage_membership}
              </button>
              <button className="fh-btn ghost" onClick={() => { setMethod('PAYPAL'); f.showToast(t.link_paypal); }}>
                <Icon.Link size={16} />{t.link_paypal}
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
