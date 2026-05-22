'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { FollowUpFlag } from '@/domain/models';

interface VisitFormProps {
  familyId: string;
  onSubmit: (data: { visitDate: string; notes: string; followUpFlags: FollowUpFlag[] }) => Promise<void>;
  onCancel?: () => void;
}

const FOLLOW_UP_OPTIONS: FollowUpFlag[] = [
  'blood_pressure_not_measured',
  'referral_needed',
  'medication_review_needed',
  'follow_up_scheduled',
];

export function VisitForm({ familyId: _familyId, onSubmit, onCancel }: VisitFormProps) {
  const t = useTranslations('visitForm');
  const tFlag = useTranslations('followUpFlag');
  const today = new Date().toISOString().slice(0, 10);

  const [visitDate, setVisitDate] = useState(today);
  const [notes, setNotes] = useState('');
  const [followUpFlags, setFollowUpFlags] = useState<FollowUpFlag[]>([]);
  const [dateError, setDateError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleFlagChange = (flag: FollowUpFlag, checked: boolean) => {
    setFollowUpFlags(prev =>
      checked ? [...prev, flag] : prev.filter(f => f !== flag),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDateError('');

    if (visitDate > today) {
      setDateError(t('futureDateError'));
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ visitDate, notes, followUpFlags });
      setNotes('');
      setFollowUpFlags([]);
      setVisitDate(today);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form data-testid="visit-form" onSubmit={handleSubmit} className="visit-form" noValidate>
      <h3>{t('title')}</h3>

      <div className="form-field">
        <label htmlFor="visit-date">{t('dateLabel')}</label>
        <input
          id="visit-date"
          data-testid="visit-date"
          type="date"
          value={visitDate}
          max={today}
          onChange={e => setVisitDate(e.target.value)}
          required
        />
        {dateError && (
          <span data-testid="date-error" className="field-error">
            {dateError}
          </span>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="visit-notes">{t('notesLabel')}</label>
        <textarea
          id="visit-notes"
          data-testid="visit-notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          placeholder="Observações da visita..."
        />
      </div>

      <div className="form-field">
        <label>{t('followUpLabel')}</label>
        {FOLLOW_UP_OPTIONS.map(flag => (
          <label key={flag} className="checkbox-label">
            <input
              type="checkbox"
              checked={followUpFlags.includes(flag)}
              onChange={e => handleFlagChange(flag, e.target.checked)}
            />
            {tFlag(flag as Parameters<typeof tFlag>[0])}
          </label>
        ))}
      </div>

      <div className="form-actions">
        <button
          type="submit"
          data-testid="submit-visit"
          disabled={submitting}
          className="btn-primary"
        >
          {t('submitButton')}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            {t('cancelButton')}
          </button>
        )}
      </div>
    </form>
  );
}
