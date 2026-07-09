import { useState, useMemo } from 'react';
import { m, AnimatePresence } from 'motion/react';
import { parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, format, isSameMonth, isSameDay, isBefore, isAfter, differenceInDays } from 'date-fns';
import { getToday } from '../services/nycTime';
import { saveProgram, saveSettings } from '../services/storage';
import { addCheckIn, loadSettings } from '../services/storage';
import { getAllGroups } from '../data/programData';
import type { Settings } from '../types';

const SPRING = { type: 'spring' as const, stiffness: 150, damping: 18, mass: 0.8 };
const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface OnboardingModalProps {
  onComplete: () => void;
}

type Step = 'start-date' | 'had-sessions' | 'select-days' | 'done';

export default function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState<Step>('start-date');
  const [startDate, setStartDate] = useState(() => getToday());
  const [hadSessions, setHadSessions] = useState<boolean | null>(null);
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());
  const [calendarMonth, setCalendarMonth] = useState(() => parseISO(getToday()));

  const today = parseISO(getToday());
  const start = parseISO(startDate);
  const daysSince = Math.max(0, differenceInDays(today, start));

  const selectableDays: Date[] = useMemo(() => {
    const monthStart = startOfMonth(calendarMonth);
    const monthEnd = endOfMonth(calendarMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const days: Date[] = [];
    let day = calStart;
    while (day <= calEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [calendarMonth]);

  const isInRange = (d: Date): boolean => {
    return !isBefore(d, start) && !isAfter(d, today);
  };

  const toggleDay = (dateStr: string) => {
    setSelectedDays(prev => {
      const next = new Set(prev);
      if (next.has(dateStr)) next.delete(dateStr);
      else next.add(dateStr);
      return next;
    });
  };

  const handleComplete = () => {
    const groups = getAllGroups();
    saveProgram(groups);

    const settings: Settings = {
      ...loadSettings(),
      startDate,
      programStartDate: startDate,
    };
    saveSettings(settings);

    selectedDays.forEach(dateStr => {
      addCheckIn('onboarding', dateStr, 'Previous attendance', null);
    });

    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col safe-area-inset-bottom">
      <div className="flex-1 overflow-y-auto px-6 py-8 max-sm:px-4">
        <div className="max-w-md mx-auto">
          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {(['start-date', 'had-sessions', 'select-days'] as Step[]).map(s => (
              <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${step === s ? 'w-8 bg-primary' : step === 'done' && s === 'select-days' ? 'w-2 bg-primary' : 'w-2 bg-border'}`} />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 'start-date' && (
              <m.div key="start-date" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={SPRING}>
                <h1 className="font-heading text-xl font-bold text-text mb-2">Welcome to Recovery Buddy</h1>
                <p className="text-sm text-text-muted mb-6">Let&apos;s get you set up. When did you start the program?</p>

                <div className="flex flex-col gap-1.5 mb-6">
                  <label htmlFor="onboarding-start-date" className="text-sm font-medium text-text">Program Start Date</label>
                  <input
                    id="onboarding-start-date"
                    type="date"
                    value={startDate}
                    max={getToday()}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setCalendarMonth(parseISO(e.target.value));
                    }}
                    className="text-sm px-3 py-2.5 rounded-[var(--radius-sm)] border border-border-input bg-background text-text font-body w-full focus-visible:outline-2 focus-visible:outline-primary"
                  />
                  {daysSince > 0 && (
                    <p className="text-xs text-text-muted mt-1">{daysSince} day{daysSince !== 1 ? 's' : ''} since start date</p>
                  )}
                </div>

                <button type="button"
                  className="w-full font-heading text-sm font-semibold py-2.5 px-6 rounded-[var(--radius-md)] bg-primary text-white cursor-pointer border-none hover:bg-primary-dark transition-colors duration-150"
                  onClick={() => setStep('had-sessions')}
                >
                  Continue
                </button>
              </m.div>
            )}

            {step === 'had-sessions' && (
              <m.div key="had-sessions" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={SPRING}>
                <h1 className="font-heading text-xl font-bold text-text mb-2">Previous Attendance</h1>
                <p className="text-sm text-text-muted mb-6">Have you attended any group sessions since {startDate}?</p>

                <div className="flex gap-3">
                  <button type="button"
                    className={`flex-1 font-heading text-sm font-semibold py-3 px-6 rounded-[var(--radius-md)] border-2 cursor-pointer transition-all duration-150 ${hadSessions === true ? 'bg-primary text-white border-primary' : 'bg-surface text-text-secondary border-border hover:border-primary'}`}
                    onClick={() => { setHadSessions(true); setStep('select-days'); }}
                  >
                    Yes
                  </button>
                  <button type="button"
                    className={`flex-1 font-heading text-sm font-semibold py-3 px-6 rounded-[var(--radius-md)] border-2 cursor-pointer transition-all duration-150 ${hadSessions === false ? 'bg-primary text-white border-primary' : 'bg-surface text-text-secondary border-border hover:border-primary'}`}
                    onClick={() => { setHadSessions(false); setStep('done'); }}
                  >
                    No
                  </button>
                </div>
              </m.div>
            )}

            {step === 'select-days' && (
              <m.div key="select-days" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={SPRING}>
                <h1 className="font-heading text-xl font-bold text-text mb-1">Select Attendance Days</h1>
                <p className="text-sm text-text-muted mb-1">Tap the days you attended sessions. Only dates from {startDate} to today are selectable.</p>
                <p className="text-sm font-semibold text-primary mb-4">{selectedDays.size} day{selectedDays.size !== 1 ? 's' : ''} selected</p>

                <div className="bg-surface rounded-[var(--radius-lg)] border border-border p-4">
                  <div className="flex items-center justify-between mb-4">
                    <button type="button"
                      className="text-xs font-semibold py-1.5 px-3 rounded-[var(--radius-sm)] bg-transparent border border-border text-text-secondary cursor-pointer hover:bg-hover-bg transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
                      onClick={() => setCalendarMonth(prev => subMonths(prev, 1))}
                      disabled={isSameMonth(start, calendarMonth) || isBefore(subMonths(calendarMonth, 1), start)}
                    >
                      &larr; Prev
                    </button>
                    <h2 className="font-heading text-sm font-semibold text-text">{format(calendarMonth, 'MMMM yyyy')}</h2>
                    <button type="button"
                      className="text-xs font-semibold py-1.5 px-3 rounded-[var(--radius-sm)] bg-transparent border border-border text-text-secondary cursor-pointer hover:bg-hover-bg transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
                      onClick={() => setCalendarMonth(prev => addMonths(prev, 1))}
                      disabled={isSameMonth(today, calendarMonth)}
                    >
                      Next &rarr;
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {WEEK_DAYS.map(d => (
                      <div key={d} className="text-center text-[0.65rem] font-semibold text-text-muted py-1">{d}</div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {selectableDays.map((d) => {
                      const dateStr = format(d, 'yyyy-MM-dd');
                      const inRange = isInRange(d);
                      const inMonth = isSameMonth(d, calendarMonth);
                      const isSelected = selectedDays.has(dateStr);
                      const isTodayDate = isSameDay(d, today);

                      if (!inRange || !inMonth) {
                        return (
                          <div key={dateStr} className="aspect-square flex items-center justify-center">
                            <span className="text-[0.65rem] text-text-lighter">{inMonth ? format(d, 'd') : ''}</span>
                          </div>
                        );
                      }

                      return (
                        <button type="button"
                          key={dateStr}
                          className={`aspect-square flex items-center justify-center rounded-[var(--radius-sm)] text-xs transition-all duration-150 cursor-pointer border-none
                            ${isSelected
                              ? 'bg-primary text-white font-bold shadow-sm'
                              : isTodayDate
                                ? 'bg-primary/10 text-text font-medium ring-1 ring-primary/40'
                                : 'text-text hover:bg-hover-bg'
                            }`}
                          onClick={() => toggleDay(dateStr)}
                          aria-label={`${format(d, 'EEEE, MMMM d, yyyy')}${isSelected ? ' — selected' : ''}`}
                        >
                          {format(d, 'd')}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button type="button"
                    className="flex-1 text-sm font-semibold py-2.5 px-4 rounded-[var(--radius-md)] border border-border bg-surface text-text-secondary cursor-pointer hover:bg-hover-bg transition-colors duration-150"
                    onClick={() => { setHadSessions(false); setStep('done'); }}
                  >
                    Skip
                  </button>
                  <button type="button"
                    className="flex-1 font-heading text-sm font-semibold py-2.5 px-4 rounded-[var(--radius-md)] bg-primary text-white cursor-pointer border-none hover:bg-primary-dark transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setStep('done')}
                    disabled={selectedDays.size === 0}
                  >
                    {selectedDays.size === 0 ? 'Select at least 1 day' : `Save ${selectedDays.size} day${selectedDays.size !== 1 ? 's' : ''}`}
                  </button>
                </div>
              </m.div>
            )}

            {step === 'done' && (
              <m.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={SPRING}>
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h1 className="font-heading text-xl font-bold text-text mb-2">You&apos;re all set!</h1>
                  <p className="text-sm text-text-muted mb-2">
                    {hadSessions
                      ? `You've recorded ${selectedDays.size} previous session${selectedDays.size !== 1 ? 's' : ''} starting from ${startDate}.`
                      : `Your program starts today (${startDate}).`}
                  </p>
                  <p className="text-xs text-text-muted">Start tracking your attendance by checking in to groups.</p>
                </div>

                <button type="button"
                  className="w-full font-heading text-sm font-semibold py-2.5 px-6 rounded-[var(--radius-md)] bg-primary text-white cursor-pointer border-none hover:bg-primary-dark transition-colors duration-150"
                  onClick={handleComplete}
                >
                  Start Using Recovery Buddy
                </button>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Powered by footer */}
      <div className="shrink-0 text-center py-3 text-[0.6rem] text-text-lighter border-t border-border">
        Recovery Buddy
      </div>
    </div>
  );
}
