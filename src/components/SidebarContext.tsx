'use client';
import { createContext, useContext, useEffect, useState } from 'react';

type Ctx = {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  toggle: () => void;
};

const SidebarContext = createContext<Ctx>({
  collapsed: false,
  setCollapsed: () => {},
  toggle: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem('sisgesc_sidebar_collapsed');
      if (v === '1') setCollapsed(true);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('sisgesc_sidebar_collapsed', collapsed ? '1' : '0');
    } catch {}
  }, [collapsed]);

  return (
    <SidebarContext.Provider
      value={{
        collapsed,
        setCollapsed,
        toggle: () => setCollapsed((c) => !c),
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
