import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { m, AnimatePresence } from 'motion/react';
import { getAllGroups } from '../data/programData';
import { loadProgram, saveProgram, addCheckIn, hasCheckIn, removeCheckIn, getCheckInsForDate, exportData, importData, validateImportData } from '../services/storageProvider';
import { flushSyncQueue, hasPendingSync, getQueueLength } from '../services/syncService';
import { getToday } from '../services/nycTime';
import { initializeNotifications } from '../services/notifications';
import { useAuth } from '../contexts/AuthContext';
import useNycClock from '../hooks/useNycClock';
import type { Group, CheckIn, Toast, Page } from '../types';
import DailyCheckIn from './DailyCheckIn';
import ProgressOverview from './ProgressOverview';
import ToastContainer from './ToastContainer';
import PassCountdown from './PassCountdown';
import NavMenu from './NavMenu';
import GroupsPage from './GroupsPage';
import SettingsPage from './SettingsPage';
import PerformanceReview from './PerformanceReview';
import CalendarView from './CalendarView';
import SearchModal from './SearchModal';
import BulkCheckIn from './BulkCheckIn';
import PrintableReport from './PrintableReport';
import AccountMenu from './AccountMenu';
import DataImportModal from './DataImportModal';
import OnboardingModal from './OnboardingModal';

const SPRING = { type: 'spring' as const, stiffness: 150, damping: 18, mass: 0.8 };
const SPRING_SNAP = { type: 'spring' as const, stiffness: 300, damping: 22 };

interface DashboardProps {
  darkMode: boolean;
  onToggleDark: () => void;
}

export default function Dashboard({ darkMode, onToggleDark }: DashboardProps) {
  const { user } = useAuth();
  const [page, setPage] = useState<Page>('dashboard');
  const [groups, setGroups] = useState<Group[]>(() => {
    const saved = loadProgram();
    return saved || getAllGroups();
  });
  const [activeCategory, setActiveCategory] = useState('clinical');
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const { ready: nycTimeReady, localTime, nycTime } = useNycClock();
  const [todayCheckIns, setTodayCheckIns] = useState<CheckIn[]>(() => getCheckInsForDate());
  const [refreshKey, setRefreshKey] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(() => !loadProgram());
  const [showSearch, setShowSearch] = useState(false);
  const [showBulkCheckIn, setShowBulkCheckIn] = useState(false);
  const [showPrintReport, setShowPrintReport] = useState(false);
  const [showDataImport, setShowDataImport] = useState(false);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [menuOpen, setMenuOpen] = useState(false);
  const toastTimeouts = useRef<Map<string, number>>(new Map<string, number>());

  useEffect(() => {
    return () => {
      toastTimeouts.current.forEach(tid => clearTimeout(tid));
      toastTimeouts.current.clear();
    };
  }, []);

  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); flushSyncQueue(); };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (user) {
      const localProg = localStorage.getItem('clinical-program-tracker');
      const localChecks = localStorage.getItem('clinical-program-checkins');
      const cloudImported = sessionStorage.getItem('cloud-import-shown');
      if ((localProg || localChecks) && !cloudImported) {
        setShowDataImport(true);
        sessionStorage.setItem('cloud-import-shown', 'true');
      }
    }
  }, [user]);

  const addToast = useCallback((message: string, undoHandler?: () => void) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, undoHandler }]);
    const tid = window.setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      toastTimeouts.current.delete(id);
    }, 4000);
    toastTimeouts.current.set(id, tid);
  }, []);

  const loadTodayCheckIns = () => setTodayCheckIns(getCheckInsForDate());

  useEffect(() => {
    const saved = loadProgram();
    if (!saved) {
      saveProgram(getAllGroups());
    }
    initializeNotifications();
  }, []);

  const handleCheckIn = (groupId: string, date: string, notes: string, signature: string | null) => {
    const alreadyCheckedIn = hasCheckIn(groupId, date);
    const group = groups.find(g => g.id === groupId) ?? null;
    addCheckIn(groupId, date, notes, signature);
    if (!alreadyCheckedIn) {
      setGroups(prev => {
        const updated = prev.map(g =>
          g.id === groupId ? { ...g, completed: g.completed + 1 } : g
        );
        saveProgram(updated);
        return updated;
      });
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
    setTimeout(() => URL.revokeObjectURL(url), 1000);
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
          try {
            importData(data);
          } catch {
            addToast('Import failed: Unable to process data');
            return;
          }
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

  const handleBulkCheckIn = (selections: { groupId: string; date: string; notes: string }[]) => {
    let newCount = 0;
    selections.forEach(({ groupId, date, notes }) => {
      const alreadyCheckedIn = hasCheckIn(groupId, date);
      addCheckIn(groupId, date, notes, null);
      if (!alreadyCheckedIn) newCount++;
    });
    if (newCount > 0) {
      setGroups(prev => {
        const updated = prev.map(g => {
          const sel = selections.find(s => s.groupId === g.id);
          if (sel && !hasCheckIn(g.id, sel.date)) {
            return { ...g, completed: g.completed + 1 };
          }
          return g;
        });
        saveProgram(updated);
        return updated;
      });
      addToast(`Checked in to ${newCount} group${newCount > 1 ? 's' : ''}`);
    } else {
      addToast('All selected groups already checked in for this date');
    }
    setShowBulkCheckIn(false);
    loadTodayCheckIns();
    setRefreshKey(k => k + 1);
  };

  const handleGroupAdd = (group: Group) => {
    setGroups(prev => {
      const updated = [...prev, group];
      saveProgram(updated);
      return updated;
    });
    setRefreshKey(k => k + 1);
    addToast(`Added custom group: ${group.name}`);
  };

  const totalRequired = useMemo(() => groups
    .filter(g => g.required !== 999)
    .reduce((sum, g) => sum + (g.required || 0), 0), [groups]);
  const totalCompleted = useMemo(() => groups
    .filter(g => g.required !== 999)
    .reduce((sum, g) => sum + (g.completed || 0), 0), [groups]);
  const overallProgress = totalRequired > 0 ? Math.round((totalCompleted / totalRequired) * 100) : 0;

  const syncIndicator = (
    <div className="flex items-center gap-1.5">
      {user && (
        <>
          {isOnline ? (
            <span className="text-[10px] text-primary" title="Connected">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1"/></svg>
            </span>
          ) : (
            <span className="text-[10px] text-warning" title="Offline">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.56 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1"/></svg>
            </span>
          )}
          {hasPendingSync() && (
            <span className="text-[10px] text-warning font-semibold" title={`${getQueueLength()} pending`}>
              {getQueueLength()}
            </span>
          )}
        </>
      )}
    </div>
  );

  const pageTitle = page === 'dashboard' ? 'Dashboard'
    : page === 'review' ? 'Performance Review'
    : page === 'calendar' ? 'Calendar'
    : page === 'settings' ? 'Settings'
    : page.startsWith('groups-') ? 'Groups'
    : 'Recovery Buddy';

  return (
    <div className="relative min-h-dvh">
      <NavMenu
        groups={groups}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        onNavigate={setPage}
        currentPage={page}
        darkMode={darkMode}
        onToggleDark={onToggleDark}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />

      <div className="lg:pl-16 max-lg:pb-[3.25rem]">
        {/* Mobile header */}
        <header className="flex lg:hidden items-center justify-between shrink-0 bg-surface border-b border-border px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <button type="button"
              className="flex items-center justify-center w-9 h-9 rounded-[var(--radius-sm)] text-text-secondary hover:bg-hover-bg transition-colors duration-150 cursor-pointer border-none shrink-0 touch-target"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <h1 className="font-heading text-base font-bold text-text truncate">Recovery Buddy</h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-[0.6rem] font-bold text-white px-1.5 py-0.5 rounded ${nycTimeReady ? 'bg-primary' : 'bg-warning'}`}>
              {nycTimeReady ? 'NYC' : 'Local'}
            </span>
            <span className="font-mono text-xs tabular-nums text-text-secondary">{localTime}</span>
            {syncIndicator}
            {user && <AccountMenu onImportComplete={() => { setShowDataImport(false); addToast('Data imported successfully'); }} />}
          </div>
        </header>

        <m.main
          className="max-lg:min-h-[calc(100dvh-3.25rem)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="max-w-5xl mx-auto px-6 py-8 max-lg:px-4 max-lg:py-4">
            {showOnboarding && (
              <OnboardingModal onComplete={() => {
                setShowOnboarding(false);
                const saved = loadProgram();
                if (saved) setGroups(saved);
                loadTodayCheckIns();
                setRefreshKey(k => k + 1);
              }} />
            )}

            <AnimatePresence mode="wait">
              {page === 'dashboard' && (
                <m.div key="dashboard" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={SPRING}>
                  {/* Dashboard header */}
                  <m.header className="flex flex-wrap items-center gap-3 mb-6 max-lg:gap-2" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.05 }}>
                    <div className="flex items-center gap-4 max-lg:gap-3">
                      <h1 className="font-heading text-2xl font-bold text-text max-lg:text-lg">Recovery Buddy</h1>
                      <m.div className="relative w-14 h-14 max-lg:w-11 max-lg:h-11" key={overallProgress} initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={SPRING_SNAP}>
                        <svg className="w-14 h-14 max-lg:w-11 max-lg:h-11 -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--color-border)" strokeWidth="3" />
                          <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--color-primary)" strokeWidth="3" strokeDasharray={`${overallProgress} ${100 - overallProgress}`} strokeLinecap="round" />
                        </svg>
                        <m.span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-text tabular-nums max-lg:text-[0.6rem]" key={overallProgress} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={SPRING}>
                          {overallProgress}%
                        </m.span>
                      </m.div>
                    </div>
                    <div className="flex items-center gap-3 ml-auto max-lg:flex-wrap max-lg:w-full max-lg:justify-between max-lg:gap-1.5">
                      <div className="flex items-center gap-1.5 max-lg:order-2 max-lg:w-full">
                        <button type="button" className="text-xs font-semibold py-1.5 px-3 rounded-[var(--radius-sm)] border border-border bg-background text-text-secondary cursor-pointer hover:bg-hover-bg transition-colors duration-150 flex items-center gap-1.5" onClick={() => setShowSearch(true)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                          <span className="max-lg:hidden">Search</span>
                        </button>
                        <button type="button" className="text-xs font-semibold py-1.5 px-3 rounded-[var(--radius-sm)] border border-border bg-background text-text-secondary cursor-pointer hover:bg-hover-bg transition-colors duration-150 flex items-center gap-1.5" onClick={() => setShowBulkCheckIn(true)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                          <span className="max-lg:hidden">Bulk Check-In</span>
                        </button>
                        <button type="button" className="text-xs font-semibold py-1.5 px-3 rounded-[var(--radius-sm)] border border-border bg-background text-text-secondary cursor-pointer hover:bg-hover-bg transition-colors duration-150 flex items-center gap-1.5" onClick={() => setShowPrintReport(true)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                          <span className="max-lg:hidden">Print Report</span>
                        </button>
                        {user && <span className="max-lg:hidden"><AccountMenu onImportComplete={() => { setShowDataImport(false); addToast('Data imported successfully'); }} /></span>}
                      </div>
                      <div className="flex items-center gap-1.5 max-lg:hidden">
                        <span className={`text-[0.6rem] font-bold text-white px-1.5 py-0.5 rounded ${nycTimeReady ? 'bg-primary' : 'bg-warning'}`}>{nycTimeReady ? 'NYC' : 'Local'}</span>
                        <span className="text-xs font-mono tabular-nums text-text-secondary">{localTime}</span>
                        <span className="text-xs font-mono tabular-nums text-text-muted">{nycTime}</span>
                        {syncIndicator}
                      </div>
                      <p className="text-xs text-text-muted tabular-nums max-lg:w-full max-lg:text-center">{totalCompleted} of {totalRequired} required sessions completed</p>
                    </div>
                  </m.header>

                  <div className="flex flex-col gap-6">
                    <PassCountdown refreshKey={refreshKey} />
                    <ProgressOverview groups={groups} />

                    {todayCheckIns.length > 0 ? (
                      <section>
                        <h2 className="font-heading text-base font-semibold text-text mb-3">Today&apos;s Check-Ins</h2>
                        <ul className="flex flex-col gap-2">
                          {todayCheckIns.map(ci => (
                            <m.li key={`${ci.groupId}-${ci.date}`} className="flex items-center gap-3 bg-surface rounded-[var(--radius-md)] border border-border p-3 max-lg:gap-2 max-lg:p-2.5" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={SPRING}>
                              <span className="flex-1 font-medium text-sm text-text capitalize max-lg:text-xs">{ci.groupId.replace(/-/g, ' ')}</span>
                              <span className="text-xs tabular-nums text-text-muted">{new Date(ci.timestamp).toLocaleTimeString()}</span>
                              {ci.notes && <span className="text-xs text-text-muted truncate max-w-[180px] max-lg:max-w-[100px]">— {ci.notes}</span>}
                              <button type="button" className="text-xs font-semibold text-primary bg-transparent border-none cursor-pointer hover:text-primary-dark" onClick={() => handleUndoTodayCheckIn(ci.groupId, ci.date)}>Undo</button>
                            </m.li>
                          ))}
                        </ul>
                      </section>
                    ) : (
                      <div className="text-sm text-text-muted text-center py-8">No check-ins recorded for today</div>
                    )}
                  </div>
                </m.div>
              )}

              {page.startsWith('groups-') && (
                <GroupsPage key={page} groups={groups} activeCategory={activeCategory} onCategoryChange={setActiveCategory} onGroupCheckIn={(group) => { setSelectedGroup(group); setShowCheckInModal(true); }} onGroupCheckOut={handleCheckOut} canGroupCheckIn={(group: Group) => group.recurring || group.completed < group.required} onGroupAdd={handleGroupAdd} />
              )}

              {page === 'review' && (
                <PerformanceReview key="review" groups={groups} refreshKey={refreshKey} />
              )}

              {page === 'calendar' && (
                <CalendarView key="calendar" refreshKey={refreshKey} />
              )}

              {page === 'settings' && (
                <SettingsPage key="settings" onExport={handleExport} onImport={handleImport} onReset={handleReset} onSettingsChange={handleSettingsChange} />
              )}
            </AnimatePresence>

            {showCheckInModal && selectedGroup && (
              <DailyCheckIn group={selectedGroup} onSubmit={handleCheckIn} onClose={() => { setShowCheckInModal(false); setSelectedGroup(null); }} />
            )}

            <ToastContainer toasts={toasts} onUndo={(t) => { t.undoHandler?.(); setToasts(prev => prev.filter(x => x.id !== t.id)); }} />

            {showSearch && (
              <SearchModal groups={groups} onClose={() => setShowSearch(false)} onGroupSelect={(group) => { setSelectedGroup(group); setShowCheckInModal(true); }} />
            )}
            {showBulkCheckIn && (
              <BulkCheckIn groups={groups} onSubmit={handleBulkCheckIn} onClose={() => setShowBulkCheckIn(false)} />
            )}
            {showPrintReport && (
              <PrintableReport groups={groups} refreshKey={refreshKey} onClose={() => setShowPrintReport(false)} />
            )}
            {showDataImport && user && (
              <DataImportModal
                onClose={() => setShowDataImport(false)}
                onComplete={() => { setShowDataImport(false); addToast('Data synced to cloud'); }}
              />
            )}
          </div>
        </m.main>
      </div>
    </div>
  );
}
