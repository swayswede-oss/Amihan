export const TOGGLEABLE_MENU_ITEMS = [
  'dashboard',
  'vehicles',
  'vehicle-history',
  'analytics',
  'alerts',
] as const;

export type ToggleableMenuItemId = (typeof TOGGLEABLE_MENU_ITEMS)[number];

export type MenuVisibility = Record<ToggleableMenuItemId, boolean>;

const MENU_VISIBILITY_KEY = 'sidebarMenuVisibility';

export function defaultMenuVisibility(): MenuVisibility {
  return {
    dashboard: true,
    vehicles: true,
    'vehicle-history': true,
    analytics: true,
    alerts: true,
  };
}

export function loadMenuVisibility(): MenuVisibility {
  const visibility = defaultMenuVisibility();
  try {
    const saved = localStorage.getItem(MENU_VISIBILITY_KEY);
    if (!saved) {
      return visibility;
    }
    const parsed = JSON.parse(saved) as Partial<MenuVisibility>;
    for (const id of TOGGLEABLE_MENU_ITEMS) {
      if (typeof parsed[id] === 'boolean') {
        visibility[id] = parsed[id];
      }
    }
  } catch {
    // ignore invalid saved visibility
  }
  return visibility;
}

export function saveMenuVisibility(visibility: MenuVisibility) {
  localStorage.setItem(MENU_VISIBILITY_KEY, JSON.stringify(visibility));
}

export function isMenuItemVisible(id: string, visibility: MenuVisibility) {
  if (id === 'map' || id === 'settings') {
    return true;
  }
  if (id in visibility) {
    return visibility[id as ToggleableMenuItemId];
  }
  return true;
}
