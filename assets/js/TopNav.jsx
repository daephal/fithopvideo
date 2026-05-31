// FITHOP top navigation. Brand · centered VIDEO album-selector · actions.
function TopNav({ copy, onOpenAccount, onOpenPlaylists, onOpenSearch }) {
  return (
    <header className="fh-nav">
      {/* Left: brand */}
      <div className="fh-nav-side left">
        <div className="fh-brand"><span>FITHOP RILLIZ</span><span className="dot">.</span></div>
      </div>

      {/* Right: playlist · search · account */}
      <div className="fh-nav-side right">
        <button className="fh-nav-icon" aria-label={copy.my_playlists} onClick={onOpenPlaylists}><Icon.Playlist size={20} /></button>
        <button className="fh-nav-icon" aria-label={copy.searchSongs} onClick={onOpenSearch}><Icon.Search size={20} /></button>
        <button className="fh-nav-account" aria-label={copy.nav_account} onClick={onOpenAccount}><Icon.User size={19} /></button>
      </div>
    </header>);

}

window.TopNav = TopNav;