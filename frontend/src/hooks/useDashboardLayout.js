import { useState, useEffect } from 'react';
import { arrayMove } from '@dnd-kit/sortable';

const DEFAULT_LAYOUT = [
  { id: 'business-health', visible: true },
  { id: 'todays-tasks', visible: true },
  { id: 'kpi-grid', visible: true },
  { id: 'smart-insights', visible: true },
  { id: 'action-center', visible: true },
  { id: 'cash-flow', visible: true },
  { id: 'receivables', visible: true },
  { id: 'payables', visible: true },
  { id: 'inventory-alerts', visible: true },
  { id: 'recent-activity', visible: true },
  { id: 'recent-invoices', visible: true },
  { id: 'recent-purchases', visible: true },
  { id: 'top-performers', visible: true },
  { id: 'business-calendar', visible: true },
];

export const useDashboardLayout = (userId) => {
  const storageKey = `dashboard_layout_${userId || 'guest'}`;

  const [layout, setLayout] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with DEFAULT_LAYOUT to ensure new widgets are added
        const layoutMap = new Map(parsed.map(w => [w.id, w]));
        const merged = [
          ...parsed,
          ...DEFAULT_LAYOUT.filter(w => !layoutMap.has(w.id))
        ];
        return merged;
      }
    } catch (e) {
      console.error('Failed to load dashboard layout', e);
    }
    return DEFAULT_LAYOUT;
  });

  const [isEditMode, setIsEditMode] = useState(false);

  // Save to local storage whenever layout changes
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(layout));
  }, [layout, storageKey]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id && over) {
      setLayout((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const toggleWidgetVisibility = (id) => {
    setLayout(items => items.map(item => 
      item.id === id ? { ...item, visible: !item.visible } : item
    ));
  };

  const resetLayout = () => {
    setLayout(DEFAULT_LAYOUT);
    localStorage.removeItem(storageKey);
  };

  return {
    layout,
    visibleWidgets: layout.filter(w => w.visible),
    isEditMode,
    setIsEditMode,
    handleDragEnd,
    toggleWidgetVisibility,
    resetLayout
  };
};
