import { memo } from 'react';
import { motion } from 'motion/react';
import { CheckIcon } from './Icons';
import type { Group, Category } from '../types';

interface Props {
  categories: Category[];
  activeCategory: string;
  onChange: (id: string) => void;
  groups: Group[];
}

const CategoryTabs = memo(function CategoryTabs({ categories, activeCategory, onChange, groups }: Props) {
  return (
    <div className="category-tabs">
      {categories.map(cat => {
        const count = groups.filter(g => g.category === cat.id).length;
        const completed = groups.filter(g => g.category === cat.id && g.completed > 0).length;
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            className={`category-tab ${isActive ? 'active' : ''}`}
            onClick={() => onChange(cat.id)}
            style={{ position: 'relative' }}
          >
            {isActive && (
              <motion.div
                layoutId="tab-indicator"
                className="tab-indicator"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="tab-icon" aria-hidden="true">{typeof cat.icon === 'function' ? <cat.icon /> : cat.icon}</span>
            <span className="tab-label">{cat.label}</span>
            <span className="tab-count">({count})</span>
            {completed > 0 && <span className="tab-completed"><CheckIcon /> {completed}</span>}
          </button>
        );
      })}
    </div>
  );
});

export default CategoryTabs;
