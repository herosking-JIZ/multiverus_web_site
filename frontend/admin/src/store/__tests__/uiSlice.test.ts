import { describe, it, expect, beforeEach } from 'vitest';
import uiReducer, { toggleSidebar, setSidebarCollapsed } from '../uiSlice';

describe('Redux Slice: uiSlice', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should_toggle_sidebar_collapsed_state_when_toggleSidebar_action_dispatched', () => {
    const initialState = { sidebarCollapsed: false };

    const state1 = uiReducer(initialState, toggleSidebar());
    expect(state1.sidebarCollapsed).toBe(true);
    expect(localStorage.getItem('bwt-admin-ui-collapsed')).toBe('true');

    const state2 = uiReducer(state1, toggleSidebar());
    expect(state2.sidebarCollapsed).toBe(false);
    expect(localStorage.getItem('bwt-admin-ui-collapsed')).toBe('false');
  });

  it('should_set_sidebar_collapsed_explicitly_when_setSidebarCollapsed_dispatched', () => {
    const state = uiReducer(undefined, setSidebarCollapsed(true));

    expect(state.sidebarCollapsed).toBe(true);
    expect(localStorage.getItem('bwt-admin-ui-collapsed')).toBe('true');
  });
});
