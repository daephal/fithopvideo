// FITHOP toast — small confirmation message, auto-dismisses (store-driven).
function Toast() {
  const { toast } = useFithop();
  return (
    <div className="fh-toast-wrap" aria-live="polite">
      {toast ? <div className="fh-toast" key={toast}>{toast}</div> : null}
    </div>
  );
}
window.Toast = Toast;
