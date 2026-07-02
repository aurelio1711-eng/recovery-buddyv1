import { useRef, useEffect } from 'react';

interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: string;
}

const FOCUSABLE = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function ConfirmModal({ title, message, confirmLabel, cancelLabel, onConfirm, onCancel, variant }: Props) {
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const focusable = overlay.querySelectorAll<HTMLElement>(FOCUSABLE);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();

    const trap = (e: Event) => {
      const ke = e as KeyboardEvent;
      if (ke.key === 'Escape') { onCancel(); return; }
      if (ke.key !== 'Tab') return;
      if (ke.shiftKey && document.activeElement === first) {
        ke.preventDefault();
        last?.focus();
      } else if (!ke.shiftKey && document.activeElement === last) {
        ke.preventDefault();
        first?.focus();
      }
    };
    overlay.addEventListener('keydown', trap);
    return () => overlay.removeEventListener('keydown', trap);
  }, [onCancel]);

  return (
    <div ref={overlayRef} className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-title" onClick={onCancel}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="confirm-title">{title}</h2>
          <button className="close-btn" onClick={onCancel} aria-label="Close">&times;</button>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onCancel}>{cancelLabel || 'Cancel'}</button>
          <button className={`btn-submit ${variant === 'danger' ? 'btn-danger' : ''}`} onClick={onConfirm}>
            {confirmLabel || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
