import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getAllGroups } from '../data/programData';
import { loadProgram, saveProgram, addCheckIn, hasCheckIn, removeCheckIn, getCheckInsForDate, exportData, importData, validateImportData } from '../services/storage';
import { initNycTime, getNycTimestamp, getLocalTimestamp, getToday } from '../services/nycTime';
import useMediaQuery from '../hooks/useMediaQuery';
import type { Group, CheckIn, Toast, Page } from '../types';
import DailyCheckIn from './DailyCheckIn';
import ProgressOverview from './ProgressOverview';
import ToastContainer from './ToastContainer';
import PassCountdown from './PassCountdown';
import NavMenu from './NavMenu';
import GroupsPage from './GroupsPage';
import SettingsPage from './SettingsPage';
import PerformanceReview from './PerformanceReview';
import MobileLayout from './MobileLayout';
import './Dashboard.css';

interface DashboardProps {
  darkMode: boolean;
  onToggleDark: () => void;
}

export default function Dashboard({ darkMode, onToggleDark }: DashboardProps) {
  const [page, setPage] = useState<Page>('dashboard');
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeCategory, setActiveCategory] = useState('clinical');
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [nycTimeReady, setNycTimeReady] = useState(false);
  const [localTime, setLocalTime] = useState('');
  const [nycTime, setNycTime] = useState('');
  const [todayCheckIns, setTodayCheckIns] = useState<CheckIn[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showWelcome, setShowWelcome] = useState(() => !loadProgram());

  const addToast = useCallback((message: string, undoHandler?: () => void) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, undoHandler }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const loadTodayCheckIns = () => setTodayCheckIns(getCheckInsForDate());

  useEffect(() => {
    initNycTime().then(ready => setNycTimeReady(ready));
    loadTodayCheckIns();
    const saved = loadProgram();
    if (saved) {
      setGroups(saved);
    } else {
      const initial = getAllGroups();
      setGroups(initial);
      saveProgram(initial);
    }
  }, []);

  useEffect(() => {
    let rafId: number;
    let lastTick = 0;
    const tick = (now: number) => {
      if (now - lastTick >= 1000) {
        setLocalTime(getLocalTimestamp());
        setNycTime(getNycTimestamp());
        lastTick = now;
      }
      rafId = requestAnimationFrame(tick);
    };
    tick(performance.now());
    const onVisibility = () => { if (!document.hidden) tick(performance.now()); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => { cancelAnimationFrame(rafId); document.removeEventListener('visibilitychange', onVisibility); };
  }, []);

  const handleCheckIn = (groupId: string, date: string, notes: string, signature: string | null) => {
    const alreadyCheckedIn = hasCheckIn(groupId, date);
    addCheckIn(groupId, date, notes, signature);
    if (!alreadyCheckedIn) {
      setGroups(prev => {
        const updated = prev.map(g =>
          g.id === groupId ? { ...g, completed: g.completed + 1 } : g
        );
        saveProgram(updated);
        return updated;
      });
      const group = groups.find(g => g.id === groupId);
      addToast(`Checked in: ${group ? group.name : groupId}`, () => {
        handleCheckOut(groupId);
      });
    } else {
      addToast('Already checked in for this date');
    }
    setShowCheckInModal(false);
    setSelectedGroup(null);
    loadTodayCheckIns();
    setRefreshKey(k => k + 1);
  };

  const handleCheckOut = (groupId: string) => {
    removeCheckIn(groupId);
    setGroups(prev => {
      const updated = prev.map(g =>
        g.id === groupId && g.completed > 0 ? { ...g, completed: g.completed - 1 } : g
      );
      saveProgram(updated);
      return updated;
    });
    loadTodayCheckIns();
    setRefreshKey(k => k + 1);
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recovery-tracker-export-${getToday()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Data exported successfully');
  };

  const MAX_IMPORT_SIZE = 5 * 1024 * 1024;

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;
      if (file.size > MAX_IMPORT_SIZE) {
        addToast('Import failed: File is too large (max 5MB)');
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target!.result as string);
          const validation = validateImportData(data);
          if (!validation.valid) {
            addToast('Import failed: Invalid data format');
            return;
          }
          importData(data);
          const saved = loadProgram();
          if (saved) {
            setGroups(saved);
            setRefreshKey(k => k + 1);
            loadTodayCheckIns();
          }
          addToast('Data imported successfully');
        } catch {
          addToast('Import failed: Unable to parse file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleUndoTodayCheckIn = (groupId: string, date: string) => {
    removeCheckIn(groupId, date);
    setGroups(prev => {
      const group = prev.find(g => g.id === groupId);
      if (group && group.completed > 0) {
        const updated = prev.map(g =>
          g.id === groupId ? { ...g, completed: g.completed - 1 } : g
        );
        saveProgram(updated);
        return updated;
      }
      return prev;
    });
    loadTodayCheckIns();
    setRefreshKey(k => k + 1);
  };

  const handleReset = () => {
    const freshGroups = getAllGroups();
    setGroups(freshGroups);
    setActiveCategory('clinical');
    setTodayCheckIns([]);
    setRefreshKey(k => k + 1);
  };

  const handleSettingsChange = () => {
    setRefreshKey(k => k + 1);
  };

  const totalRequired = useMemo(() => groups
    .filter(g => g.required !== 999)
    .reduce((sum, g) => sum + (g.required || 0), 0), [groups]);
  const totalCompleted = useMemo(() => groups.reduce((sum, g) => sum + (g.completed || 0), 0), [groups]);
  const overallProgress = totalRequired > 0 ? Math.round((totalCompleted / totalRequired) * 100) : 0;

  const isMobile = useMediaQuery('(max-width: 768px)');

  const sharedProps = {
    groups,
    activeCategory,
    onCategoryChange: setActiveCategory,
    onGroupCheckIn: (group: Group) => { setSelectedGroup(group); setShowCheckInModal(true); },
    onGroupCheckOut: handleCheckOut,
    canGroupCheckIn: (group: Group) => group.recurring || group.completed < group.required,
    refreshKey,
    nycTimeReady,
    nycTime,
    localTime,
    overallProgress,
    totalCompleted,
    totalRequired,
    todayCheckIns,
    onReset: handleReset,
    onSettingsChange: handleSettingsChange,
    filteredGroups: groups.filter(g => g.category === activeCategory),
    onExport: handleExport,
    onImport: handleImport,
    onUndoCheckIn: handleUndoTodayCheckIn,
  };

  if (isMobile) {
    const isOnDashboard = page === 'dashboard';

    return (
      <motion.div className="mobile-layout" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
        <NavMenu groups={groups} activeCategory={activeCategory} onCategoryChange={setActiveCategory} onNavigate={setPage} currentPage={page} darkMode={darkMode} onToggleDark={onToggleDark} />
        {isOnDashboard ? (
          <MobileLayout {...sharedProps} />
        ) : (
          <>
            <header className="mobile-header">
              <div className="mobile-header-top">
                <h1 className="mobile-title">Recovery Buddy</h1>
                <div className="mobile-header-right">
                  <button className="checkin-undo-btn" onClick={() => setPage('dashboard')}>Back</button>
                </div>
              </div>
            </header>
            <main className="mobile-content">
              <AnimatePresence mode="wait">
                {page.startsWith('groups-') && (
                  <GroupsPage
                    key={page}
                    groups={groups}
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                    onGroupCheckIn={(group) => { setSelectedGroup(group); setShowCheckInModal(true); }}
                    onGroupCheckOut={handleCheckOut}
                    canGroupCheckIn={(group: Group) => group.recurring || group.completed < group.required}
                  />
                )}
                {page === 'review' && (
                  <PerformanceReview
                    key="review"
                    groups={groups}
                  />
                )}
                {page === 'settings' && (
                  <SettingsPage
                    key="settings"
                    onExport={handleExport}
                    onImport={handleImport}
                    onReset={handleReset}
                    onSettingsChange={handleSettingsChange}
                  />
                )}
              </AnimatePresence>
            </main>
          </>
        )}
        {showCheckInModal && selectedGroup && (
          <DailyCheckIn
            group={selectedGroup}
            onSubmit={handleCheckIn}
            onClose={() => { setShowCheckInModal(false); setSelectedGroup(null); }}
          />
        )}
        <ToastContainer toasts={toasts} onUndo={(t) => { t.undoHandler?.(); setToasts(prev => prev.filter(x => x.id !== t.id)); }} />
      </motion.div>
    );
  }

  const spring = { type: 'spring' as const, stiffness: 150, damping: 18, mass: 0.8 };
  const springSnap = { type: 'spring' as const, stiffness: 300, damping: 22 };

  return (
    <motion.main className="dashboard" id="main-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <NavMenu groups={groups} activeCategory={activeCategory} onCategoryChange={setActiveCategory} onNavigate={setPage} currentPage={page} darkMode={darkMode} onToggleDark={onToggleDark} />

      {showWelcome && (
        <motion.div
          className="welcome-card"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
        >
          <h2>Welcome to Recovery Buddy</h2>
          <p>Track your clinical and non-clinical group attendance. Check in to groups each session, earn certificates upon completion, and track your 30-day weekend pass eligibility.</p>
          <button className="welcome-dismiss" onClick={() => setShowWelcome(false)} aria-label="Dismiss">&times;</button>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {page === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={spring}
          >
            <motion.header
              className="dashboard-header"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.05 }}
            >
              <div className="header-content">
                <h1>Recovery Buddy</h1>
                <motion.div
                  className="progress-ring"
                  key={overallProgress}
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={springSnap}
                  style={{ '--progress': `${overallProgress}%` } as React.CSSProperties}
                >
                  <motion.span
                    className="progress-text"
                    key={overallProgress}
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={spring}
                  >
                    {overallProgress}%
                  </motion.span>
                </motion.div>
              </div>
              <div className="header-meta">
                <span className={`time-badge ${nycTimeReady ? 'live' : 'fallback'}`}>
                  {nycTimeReady ? 'NYC' : 'Local'}
                </span>
                <span className="clock-display">
                  <span className="clock-local">{localTime}</span>
                  <span className="clock-nyc">{nycTime}</span>
                </span>
                <p className="progress-summary">{totalCompleted} of {totalRequired} required sessions completed</p>
              </div>
            </motion.header>

            <PassCountdown refreshKey={refreshKey} />

            <ProgressOverview groups={groups} />

            {todayCheckIns.length > 0 ? (
              <section className="today-checkins">
                <h2>Today's Check-Ins</h2>
                <ul className="checkin-list">
                  {todayCheckIns.map(ci => (
                    <motion.li
                      key={`${ci.groupId}-${ci.date}`}
                      className="checkin-item"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={spring}
                    >
                      <span className="checkin-group">{ci.groupId.replace(/-/g, ' ')}</span>
                      <span className="checkin-time">{new Date(ci.timestamp).toLocaleTimeString()}</span>
                      {ci.notes && <span className="checkin-notes">— {ci.notes}</span>}
                      <button className="checkin-undo-btn" onClick={() => handleUndoTodayCheckIn(ci.groupId, ci.date)}>Undo</button>
                    </motion.li>
                  ))}
                </ul>
              </section>
            ) : (
              <div className="today-empty">
                No check-ins recorded for today
              </div>
            )}
          </motion.div>
        )}

        {page.startsWith('groups-') && (
          <GroupsPage
            key={page}
            groups={groups}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            onGroupCheckIn={(group) => { setSelectedGroup(group); setShowCheckInModal(true); }}
            onGroupCheckOut={handleCheckOut}
            canGroupCheckIn={(group: Group) => group.recurring || group.completed < group.required}
          />
        )}

        {page === 'review' && (
          <PerformanceReview
            key="review"
            groups={groups}
          />
        )}

        {page === 'settings' && (
          <SettingsPage
            key="settings"
            onExport={handleExport}
            onImport={handleImport}
            onReset={handleReset}
            onSettingsChange={handleSettingsChange}
          />
        )}
      </AnimatePresence>

      {showCheckInModal && selectedGroup && (
        <DailyCheckIn
          group={selectedGroup}
          onSubmit={handleCheckIn}
          onClose={() => { setShowCheckInModal(false); setSelectedGroup(null); }}
        />
      )}

      <ToastContainer toasts={toasts} onUndo={(t) => { t.undoHandler?.(); setToasts(prev => prev.filter(x => x.id !== t.id)); }} />
    </motion.main>
  );
}
