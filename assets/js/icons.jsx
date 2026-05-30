// Inline Lucide-style icons — 24px / 1.5 stroke / round caps/joins.
// Pull as JSX components rather than load Lucide so the kit is offline-clean.
const Svg = ({ size = 22, children, fill = 'none', ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
       strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...rest}>
    {children}
  </svg>
);

const Icon = {
  Play:      (p) => <Svg {...p} fill="currentColor" stroke="none"><path d="M6 4l14 8-14 8V4z"/></Svg>,
  PlayLine:  (p) => <Svg {...p}><path d="M6 4l14 8-14 8V4z"/></Svg>,
  Pause:     (p) => <Svg {...p} fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16" rx="0.5"/><rect x="14" y="4" width="4" height="16" rx="0.5"/></Svg>,
  Prev:      (p) => <Svg {...p}><path d="M19 20l-7-7 7-7M9 20l-7-7 7-7"/></Svg>,
  Next:      (p) => <Svg {...p}><path d="M5 4l7 7-7 7M15 4l7 7-7 7"/></Svg>,
  Heart:     (p) => <Svg {...p}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></Svg>,
  HeartFill: (p) => <Svg {...p} fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></Svg>,
  Plus:      (p) => <Svg {...p}><path d="M12 5v14M5 12h14"/></Svg>,
  Check:     (p) => <Svg {...p}><path d="M20 6L9 17l-5-5"/></Svg>,
  Search:    (p) => <Svg {...p}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></Svg>,
  More:      (p) => <Svg {...p}><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></Svg>,
  Volume:    (p) => <Svg {...p}><path d="M11 5L6 9H2v6h4l5 4V5zM15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14"/></Svg>,
  Mirror:    (p) => <Svg {...p}><path d="M12 3v18M4 7h6v10H4zM14 7h6v10h-6z"/></Svg>,
  Speed:     (p) => <Svg {...p}><path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="9"/></Svg>,
  Fullscreen:(p) => <Svg {...p}><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></Svg>,
  ChevronR:  (p) => <Svg {...p}><path d="M9 18l6-6-6-6"/></Svg>,
  ChevronDown:(p) => <Svg {...p}><path d="M6 9l6 6 6-6"/></Svg>,
  Home:      (p) => <Svg {...p}><path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></Svg>,
  Albums:    (p) => <Svg {...p}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></Svg>,
  Playlist:  (p) => <Svg {...p}><path d="M4 7h11M4 12h11M4 17h7M17 14v6M21 12l-4 2"/></Svg>,
  User:      (p) => <Svg {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></Svg>,
  Close:     (p) => <Svg {...p}><path d="M18 6 6 18M6 6l12 12"/></Svg>,
  Back:      (p) => <Svg {...p}><path d="M15 18l-6-6 6-6"/></Svg>,
  Info:      (p) => <Svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/></Svg>,
  Trash:     (p) => <Svg {...p}><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></Svg>,
  Edit:      (p) => <Svg {...p}><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></Svg>,
  Globe:     (p) => <Svg {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z"/></Svg>,
  Card:      (p) => <Svg {...p}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></Svg>,
  Link:      (p) => <Svg {...p}><path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"/></Svg>,
  Lock:      (p) => <Svg {...p}><rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></Svg>,
  Queue:     (p) => <Svg {...p}><path d="M3 6h11M3 12h11M3 18h7M16 13l5 3-5 3z"/></Svg>,
  Grip:      (p) => <Svg {...p} fill="currentColor" stroke="none"><circle cx="9" cy="6" r="1.3"/><circle cx="9" cy="12" r="1.3"/><circle cx="9" cy="18" r="1.3"/><circle cx="15" cy="6" r="1.3"/><circle cx="15" cy="12" r="1.3"/><circle cx="15" cy="18" r="1.3"/></Svg>,
};

window.Icon = Icon;
