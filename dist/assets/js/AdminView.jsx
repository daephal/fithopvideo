// FITHOP — Admin console (UI PREVIEW ONLY).
// No save / API / DB. The admin gate is f.isAdmin, derived in store.jsx from a
// dummy currentUser. Replace that with the real Cafe24 session later — this view
// does not need to change.
function AdminView() {
  const f = useFithop();
  const t = f.t;
  const adminUser = f.currentUser || { name: 'FITHOP', email: 'mock@local' };
  if (!f.adminOpen) return null;
  const close = () => f.setAdminOpen(false);
  const stop = (e) => e.stopPropagation();

  // dev-only preview toggle so both states can be reviewed without real auth
  const PreviewToggle = () => (
    <div className="adm-preview">
      <span className="lbl">{t.adminPreviewAs}</span>
      <div className="adm-seg" role="tablist">
        <button role="tab" data-on={f.isAdmin} onClick={() => f.setForcedAdmin(true)}>{t.roleAdmin}</button>
        <button role="tab" data-on={!f.isAdmin} onClick={() => f.setForcedAdmin(false)}>{t.roleUser}</button>
      </div>
    </div>
  );

  const sections = [
    { key: 'adminManageFitclips', icon: Icon.Albums },
    { key: 'adminManageTracks', icon: Icon.Playlist },
    { key: 'adminManageCovers', icon: Icon.Info },
    { key: 'adminManageMembers', icon: Icon.Card },
    { key: 'adminStats', icon: Icon.Speed },
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

        <div className="fh-acc-body">
          <PreviewToggle />

          {f.isAdmin ? (
            <React.Fragment>
              <div className="adm-note">{t.adminPreviewNote}</div>

              <div className="adm-user">
                <div className="fh-avatar">{adminUser.name.slice(0, 1)}</div>
                <div className="meta">
                  <span className="nm">{adminUser.name}</span>
                  <span className="em">{adminUser.email}</span>
                </div>
                <span className="adm-badge">{t.roleAdmin}</span>
              </div>

              <div className="adm-grid">
                {sections.map(s => {
                  const I = s.icon;
                  return (
                    <div key={s.key} className="adm-card" aria-disabled="true">
                      <span className="ic"><I size={20} /></span>
                      <span className="nm">{t[s.key]}</span>
                      <span className="soon">{t.comingSoon}</span>
                    </div>
                  );
                })}
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
