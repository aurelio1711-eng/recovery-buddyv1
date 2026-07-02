import { motion } from 'motion/react';
import CategoryTabs from './CategoryTabs';
import GroupCard from './GroupCard';
import { CATEGORIES } from '../data/categories';
import './GroupsPage.css';

const spring = { type: 'spring', stiffness: 150, damping: 18, mass: 0.8 };

export default function GroupsPage({ groups, activeCategory, onCategoryChange, onGroupCheckIn, onGroupCheckOut, canGroupCheckIn }) {
  const filteredGroups = groups.filter(g => g.category === activeCategory);
  const currentCat = CATEGORIES.find(c => c.id === activeCategory);

  return (
    <motion.div
      className="groups-page"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
    >
      <h1 className="groups-page-title">{currentCat?.label || 'Groups'}</h1>

      <CategoryTabs
        categories={CATEGORIES}
        activeCategory={activeCategory}
        onChange={onCategoryChange}
        groups={groups}
      />

      <motion.section className="groups-page-grid">
        {filteredGroups.map((group, i) => (
          <GroupCard
            key={group.id}
            group={group}
            index={i}
            onCheckIn={() => onGroupCheckIn(group)}
            onCheckOut={() => onGroupCheckOut(group.id)}
            canCheckIn={canGroupCheckIn(group)}
          />
        ))}
      </motion.section>
    </motion.div>
  );
}
