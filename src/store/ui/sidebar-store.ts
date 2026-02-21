"use client";

import { create } from "zustand";

export type GroupKey = "medicalRecord" | "sessions" | "settings";

type SidebarState = {
  collapsed: boolean;
  openGroups: Record<GroupKey, boolean>;

  toggleCollapsed: () => void;
  setCollapsed: (v: boolean) => void;

  isGroupOpen: (k: GroupKey) => boolean;
  toggleGroup: (k: GroupKey) => void;
  setGroup: (k: GroupKey, v: boolean) => void;

  reset: () => void;
};

const initialState: Pick<SidebarState, "collapsed" | "openGroups"> = {
  collapsed: false,
  openGroups: {
    medicalRecord: true,
    sessions: false,
    settings: false, // ✅ nuevo
  },
};

export const useSidebarStore = create<SidebarState>((set, get) => ({
  ...initialState,

  toggleCollapsed: () => set((s) => ({ collapsed: !s.collapsed })),
  setCollapsed: (v) => set({ collapsed: v }),

  isGroupOpen: (k) => !!get().openGroups[k],
  toggleGroup: (k) =>
    set((s) => ({ openGroups: { ...s.openGroups, [k]: !s.openGroups[k] } })),
  setGroup: (k, v) =>
    set((s) => ({ openGroups: { ...s.openGroups, [k]: v } })),

  reset: () => set(initialState),
}));
