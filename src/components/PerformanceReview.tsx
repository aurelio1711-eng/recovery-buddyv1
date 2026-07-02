import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { parseISO, addDays, startOfWeek, endOfWeek, format } from 'date-fns';
import { loadCheckIns, loadSettings, getDaysSinceProgramStart, isEligibleForPass, getDaysUntilNextPass } from '../services/storage';
import { CATEGORIES } from '../data/categories';
import { getToday } from '../services/nycTime';
import type { Group, CheckIn, CategoryAnalytics, Settings } from '../types';
import './PerformanceReview.css';

function ReviewIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

interface PerformanceReviewProps {
  groups: Group[];
}

export default function PerformanceReview({ groups }: PerformanceReviewProps) {
  const spring = { type: 'spring' as const, stiffness: 150, damping: 18, mass: 0.8 };

  const groupMap: Record<string, string> = useMemo(() => {
    const map: Record<string, string> = {};
    groups.forEach(g => { map[g.id] = g.name; });
    return map;
  }, [groups]);

  const [weekOffset, setWeekOffset] = useState<number>(0);

  const weekStart: Date = useMemo(() => {
    const today = parseISO(getToday());
    const weekDate = addDays(today, weekOffset * 7);
    return startOfWeek(weekDate, { weekStartsOn: 1 });
  }, [weekOffset]);

  const weekEnd: Date = useMemo(() => {
    return endOfWeek(weekStart, { weekStartsOn: 1 });
  }, [weekStart]);

  const weekLabel: string = `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;

  const checkIns: CheckIn[] = useMemo(() => {
    const data = loadCheckIns();
    return Object.values(data).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [groups]);

  const weekCheckIns: CheckIn[] = useMemo(() => {
    const start = format(weekStart, 'yyyy-MM-dd');
    const end = format(weekEnd, 'yyyy-MM-dd');
    return checkIns
      .filter(c => c.date >= start && c.date <= end)
      .sort((a, b) => a.date.localeCompare(b.date) || (a.timestamp || 0) - (b.timestamp || 0));
  }, [checkIns, weekStart, weekEnd]);

  const settings: Settings = useMemo(() => loadSettings(), [groups]);

  const daysSinceStart: number = useMemo(() => getDaysSinceProgramStart(), [groups]);

  const eligibleForPass: boolean = useMemo(() => isEligibleForPass(), [groups]);

  const daysUntilPass: number = useMemo(() => getDaysUntilNextPass(), [groups]);

  const totalCheckIns: number = checkIns.length;
  const earliestDate: string | null = checkIns.length > 0 ? checkIns[checkIns.length - 1].date : null;
  const activeDays: number = new Set(checkIns.map(c => c.date)).size;

  const categoryAnalytics: CategoryAnalytics[] = useMemo(() => {
    return CATEGORIES.map(cat => {
      const catGroups: Group[] = groups.filter(g => g.category === cat.id);
      const required: number = catGroups.reduce((sum, g) => sum + (g.required || 0), 0);
      const completed: number = catGroups.reduce((sum, g) => sum + (g.completed || 0), 0);
      const isRecurring: boolean = catGroups.every(g => g.recurring || g.required === 999);
      const pct: number = required > 0 ? Math.round((completed / required) * 100) : 0;
      return { ...cat, required, completed, pct, isRecurring, groups: catGroups };
    });
  }, [groups]);

  const completedGroups: Group[] = useMemo(() => {
    return groups.filter(g => !g.recurring && g.required !== 999 && g.completed >= g.required);
  }, [groups]);

  const nearCompletionGroups: Group[] = useMemo(() => {
    return groups.filter(g => !g.recurring && g.required !== 999 && g.completed > 0 && g.completed < g.required && (g.completed / g.required) >= 0.75);
  }, [groups]);

  const notStartedGroups: Group[] = useMemo(() => {
    return groups.filter(g => !g.recurring && g.required !== 999 && g.completed === 0);
  }, [groups]);

  const recentCheckIns: CheckIn[] = checkIns.slice(0, 10);

  return (
    <motion.div
      className="performance-review"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
    >
      <div className="pr-header">
        <div className="pr-header-left">
          <span className="pr-header-icon"><ReviewIcon /></span>
          <h1 className="pr-title">Performance Review</h1>
        </div>
        <span className="pr-day-badge">{daysSinceStart} days in program</span>
      </div>

      <div className="pr-summary-grid">
        <motion.div className="pr-summary-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, ...spring }}>
          <span className="pr-summary-value">{totalCheckIns}</span>
          <span className="pr-summary-label">Total Check-Ins</span>
        </motion.div>
        <motion.div className="pr-summary-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, ...spring }}>
          <span className="pr-summary-value">{activeDays}</span>
          <span className="pr-summary-label">Active Days</span>
        </motion.div>
        <motion.div className="pr-summary-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, ...spring }}>
          <span className="pr-summary-value">{completedGroups.length}</span>
          <span className="pr-summary-label">Groups Completed</span>
        </motion.div>
        <motion.div className="pr-summary-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, ...spring }}>
          <span className="pr-summary-value" style={{ color: eligibleForPass ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
            {eligibleForPass ? daysUntilPass === 0 ? 'Eligible' : `${daysUntilPass}d` : `${30 - daysSinceStart}d`}
          </span>
          <span className="pr-summary-label">{eligibleForPass ? 'Weekend Pass' : 'Until Pass Eligible'}</span>
        </motion.div>
      </div>

      <section className="pr-section">
        <h2 className="pr-section-title">Category Breakdown</h2>
        <div className="pr-category-grid">
          {categoryAnalytics.map((cat, i) => (
            <motion.div
              key={cat.id}
              className="pr-category-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, ...spring }}
            >
              <div className="pr-category-header">
                <span className="pr-category-name">{cat.label}</span>
                {cat.isRecurring ? (
                  <span className="pr-category-stat">{cat.completed} sessions</span>
                ) : (
                  <span className={`pr-category-stat ${cat.pct === 100 ? 'done' : ''}`}>{cat.pct}%</span>
                )}
              </div>
              {!cat.isRecurring && (
                <div className="pr-bar-bg">
                  <motion.div
                    className="pr-bar-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.pct}%` }}
                    transition={{ delay: 0.2 + 0.05 * i, duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
              )}
              <span className="pr-category-detail">{cat.completed} / {cat.isRecurring ? '∞' : cat.required}</span>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="pr-columns">
        <section className="pr-section">
          <h2 className="pr-section-title">Groups Completed</h2>
          {completedGroups.length === 0 ? (
            <p className="pr-empty">No groups completed yet</p>
          ) : (
            <ul className="pr-group-list">
              {completedGroups.map(g => (
                <li key={g.id} className="pr-group-item completed">
                  <span className="pr-group-name">{g.name}</span>
                  <span className="pr-group-check">&#10003;</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="pr-section">
          <h2 className="pr-section-title">Near Completion ({nearCompletionGroups.length})</h2>
          {nearCompletionGroups.length === 0 ? (
            <p className="pr-empty">No groups near completion</p>
          ) : (
            <ul className="pr-group-list">
              {nearCompletionGroups.map(g => (
                <li key={g.id} className="pr-group-item">
                  <span className="pr-group-name">{g.name}</span>
                  <span className="pr-group-progress">{g.completed}/{g.required}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="pr-columns">
        <section className="pr-section">
          <h2 className="pr-section-title">Not Yet Started</h2>
          {notStartedGroups.length === 0 ? (
            <p className="pr-empty">All groups have been started</p>
          ) : (
            <ul className="pr-group-list">
              {notStartedGroups.map(g => (
                <li key={g.id} className="pr-group-item not-started">
                  <span className="pr-group-name">{g.name}</span>
                  <span className="pr-group-required">Need {g.required}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="pr-section">
          <h2 className="pr-section-title">Pass History</h2>
          {(!settings.passHistory || settings.passHistory.length === 0) ? (
            <p className="pr-empty">No weekend passes claimed yet</p>
          ) : (
            <ul className="pr-group-list">
              {settings.passHistory.slice().reverse().map((date, i) => (
                <li key={i} className="pr-group-item pass-item">
                  <span className="pr-group-name">Weekend Pass</span>
                  <span className="pr-pass-date">{date}</span>
                </li>
              ))}
            </ul>
          )}
          {settings.lastPassDate && (
            <p className="pr-pass-last">Last pass: {settings.lastPassDate}</p>
          )}
        </section>
      </div>

      <section className="pr-section">
        <h2 className="pr-section-title">Weekly Attendance</h2>
        <div className="pr-week-nav">
          <button className="pr-week-btn" onClick={() => setWeekOffset(o => o - 1)} aria-label="Previous week">&larr; Prev</button>
          <span className="pr-week-label">{weekLabel}</span>
          <button className="pr-week-btn" onClick={() => setWeekOffset(o => o + 1)} aria-label="Next week">Next &rarr;</button>
        </div>
        {weekCheckIns.length === 0 ? (
          <p className="pr-empty">No check-ins this week</p>
        ) : (
          <div className="pr-week-table">
            <div className="pr-table-header">
              <span className="pr-th">Date</span>
              <span className="pr-th">Group</span>
              <span className="pr-th" style={{ textAlign: 'center' }}>Signature</span>
            </div>
            {weekCheckIns.map((ci, i) => (
              <motion.div
                key={`${ci.groupId}-${ci.date}`}
                className="pr-table-row pr-week-row"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.02 * i, ...spring }}
              >
                <span className="pr-td pr-td-date">{ci.date}</span>
                <span className="pr-td pr-td-group">{groupMap[ci.groupId] || ci.groupId.replace(/-/g, ' ')}</span>
                <span className="pr-td" style={{ textAlign: 'center' }}>
                  {ci.signature ? (
                    <img src={ci.signature} alt="Signature" className="pr-sig-thumb" />
                  ) : (
                    <span className="pr-no-sig">--</span>
                  )}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {recentCheckIns.length > 0 && (
        <section className="pr-section">
          <h2 className="pr-section-title">Recent Check-Ins</h2>
          <div className="pr-recent-table">
            <div className="pr-table-header">
              <span className="pr-th">Group</span>
              <span className="pr-th">Date</span>
              <span className="pr-th">Time</span>
            </div>
            {recentCheckIns.map((ci, i) => (
              <motion.div
                key={`${ci.groupId}-${ci.date}-${i}`}
                className="pr-table-row"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.02 * i, ...spring }}
              >
                <span className="pr-td pr-td-group">{ci.groupId.replace(/-/g, ' ')}</span>
                <span className="pr-td pr-td-date">{ci.date}</span>
                <span className="pr-td pr-td-time">{ci.timestamp ? new Date(ci.timestamp).toLocaleTimeString() : '-'}</span>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}
