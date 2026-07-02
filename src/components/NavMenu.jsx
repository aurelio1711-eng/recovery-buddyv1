import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CATEGORIES } from '../data/categories';
import logo from '../RB.webp';
import './NavMenu.css';

export default function NavMenu({ groups, activeCategory, onCategoryChange, onNavigate, currentPage }) {
  const [open, setOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);

  const grouped = CATEGORIES.map(cat => ({
    ...cat,
    groups: groups.filter(g => g.category === cat.id),
  }));

  const navigateTo = (page) => {
    onNavigate(page);
    setOpen(false);
    setExpandedCategory(null);
  };

  return (
    <>
      <motion.button
        className="nav-menu-bar"
        onClick={() => setOpen(true)}
        whileTap={{ scale: 0.95 }}
        aria-label="Open menu"
      >
        <img src={logo} alt="Recovery Buddy" className="nav-menu-logo" />
        <span className="nav-menu-hamburger">
          <span /><span /><span />
        </span>
      </motion.button>

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

                <div className="nav-menu-divider" />

                {grouped.map(cat => (
                  <div key={cat.id} className="nav-menu-category">
                    <button
                      className={`nav-menu-category-btn ${currentPage === `groups-${cat.id}` ? 'active' : ''}`}
                      onClick={() => {
                        onCategoryChange(cat.id);
                        navigateTo(`groups-${cat.id}`);
                      }}
                    >
                      <cat.icon />
                      <span>{cat.label}</span>
                      <motion.span
                        className="nav-menu-chevron"
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
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
