import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Group, Category, Page } from '../types';
import { CATEGORIES } from '../data/categories';
import logo from '../RB.webp';
import './NavMenu.css';

interface NavMenuProps {
  groups: Group[];
  activeCategory: string;
  onCategoryChange: (id: string) => void;
  onNavigate: (page: Page) => void;
  currentPage: Page;
  darkMode: boolean;
  onToggleDark: () => void;
}

export default function NavMenu({ groups, activeCategory, onCategoryChange, onNavigate, currentPage, darkMode, onToggleDark }: NavMenuProps) {
  const [open, setOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const grouped: (Category & { groups: Group[] })[] = CATEGORIES.map(cat => ({
    ...cat,
    groups: groups.filter(g => g.category === cat.id),
  }));

  const navigateTo = (page: Page) => {
    onNavigate(page);
    setOpen(false);
    setExpandedCategory(null);
  };

  return (
    <>
      <div className="nav-menu-bar">
        <motion.button
          className="nav-menu-hamburger-btn"
          onClick={() => setOpen(true)}
          whileTap={{ scale: 0.92 }}
          aria-label="Open menu"
        >
          <span className="nav-menu-hamburger">
            <span /><span /><span />
          </span>
        </motion.button>
        <motion.button
          className="nav-menu-brand"
          onClick={() => setOpen(true)}
          whileTap={{ scale: 0.97 }}
        >
          <img src={logo} alt="Recovery Buddy" className="nav-menu-logo" />
          <span className="nav-menu-text">Recovery<span className="nav-menu-text-buddy"> Buddy</span></span>
        </motion.button>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="nav-menu-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            <motion.aside
              className="nav-menu-drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="nav-menu-header">
                <img src={logo} alt="Recovery Buddy" className="nav-menu-drawer-logo" />
                <span className="nav-menu-title">Recovery Buddy</span>
                <button className="nav-menu-close" onClick={() => setOpen(false)} aria-label="Close menu">&times;</button>
              </div>

              <nav className="nav-menu-items">
                <button
                  className={`nav-menu-page-btn ${currentPage === 'dashboard' ? 'active' : ''}`}
                  onClick={() => navigateTo('dashboard')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                  <span>Dashboard</span>
                </button>

                <button
                  className={`nav-menu-page-btn ${currentPage === 'review' ? 'active' : ''}`}
                  onClick={() => navigateTo('review')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                  <span>Performance Review</span>
                </button>

                <div className="nav-menu-divider" />

                {grouped.map(cat => (
                  <div key={cat.id} className="nav-menu-category">
                    <button
                      className={`nav-menu-category-btn ${currentPage === `groups-${cat.id}` ? 'active' : ''}`}
                      aria-expanded={expandedCategory === cat.id}
                      onClick={() => {
                        onCategoryChange(cat.id);
                        navigateTo(`groups-${cat.id}`);
                      }}
                    >
                      <cat.icon />
                      <span>{cat.label}</span>
                      <motion.span
                        className="nav-menu-chevron"
                        aria-hidden="true"
                        animate={{ rotate: expandedCategory === cat.id ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        ▾
                      </motion.span>
                    </button>

                    <AnimatePresence>
                      {expandedCategory === cat.id && (
                        <motion.div
                          className="nav-menu-group-list"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {cat.groups.map(group => (
                            <button
                              key={group.id}
                              className="nav-menu-group-item"
                              onClick={() => {
                                onCategoryChange(cat.id);
                                navigateTo(`groups-${cat.id}`);
                              }}
                            >
                              <span className="nav-menu-group-name">{group.name}</span>
                              <span className="nav-menu-group-progress">{group.completed}/{group.required === 999 ? '∞' : group.required}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}

                <div className="nav-menu-divider" />

                <button
                  className={`nav-menu-page-btn ${currentPage === 'settings' ? 'active' : ''}`}
                  onClick={() => navigateTo('settings')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                  <span>Settings</span>
                </button>

                <button className="nav-menu-dark-toggle" onClick={onToggleDark} aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}>
                  <span className="nav-menu-dark-toggle-icon" aria-hidden="true">
                    {darkMode ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                    )}
                  </span>
                  <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
