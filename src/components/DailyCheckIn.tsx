import { useState, useRef, useEffect } from 'react';
import { getToday } from '../services/nycTime';
import SignaturePad from './SignaturePad';
import type { Group } from '../types';

interface DailyCheckInProps {
  group: Group;
  onSubmit: (groupId: string, date: string, notes: string, signature: string | null) => void;
  onClose: () => void;
}

const FOCUSABLE = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function DailyCheckIn({ group, onSubmit, onClose }: DailyCheckInProps) {
  const [notes, setNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [signature, setSignature] = useState<string | null>(null);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const focusable = overlay.querySelectorAll<HTMLElement>(FOCUSABLE);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();

    const trap = (e: Event) => {
      const ke = e as KeyboardEvent;
      if (ke.key === 'Escape') { onClose(); return; }
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
  }, [onClose]);

  if (showSignaturePad) {
    return (
      <SignaturePad
        onSave={(dataUrl) => {
          setSignature(dataUrl);
          setShowSignaturePad(false);
        }}
        onClose={() => setShowSignaturePad(false)}
      />
    );
  }

  return (
    <div ref={overlayRef} className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="checkin-title" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="checkin-title">Check In: {group.name}</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close">&times;</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="checkin-date">Date</label>
            <input
              id="checkin-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="checkin-notes">Notes (optional)</label>
            <textarea
              id="checkin-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How was your session? Notes..."
              rows={4}
            />
          </div>
          <div className="form-group">
            <label>Signature</label>
            {signature ? (
              <div className="signature-preview">
                <img src={signature} alt="Signed" className="signature-thumb" />
                <button className="btn-cancel" onClick={() => setSignature(null)} style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}>Remove</button>
              </div>
            ) : (
              <button
                className="btn-signature"
                onClick={() => setShowSignaturePad(true)}
                style={{ padding: '0.6rem 1.25rem', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', fontWeight: 600, fontSize: '0.85rem', fontFamily: 'var(--font-body)', width: '100%', transition: 'all 0.2s' }}
                onMouseOver={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                onMouseOut={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
              >
                + Get Signature
              </button>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button
            className="btn-submit"
            onClick={() => onSubmit(group.id, selectedDate, notes, signature)}
          >
            Complete Check In
          </button>
        </div>
      </div>
    </div>
  );
}
