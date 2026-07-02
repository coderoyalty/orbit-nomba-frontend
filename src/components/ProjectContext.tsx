import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Project } from "../lib/api";

interface ProjectCtx {
  projects: Project[];
  current: Project | null;
  setCurrent: (p: Project) => void;
  setProjects: (p: Project[]) => void;
}

const Ctx = createContext<ProjectCtx | null>(null);

const LAST_KEY = "orbit_last_project";

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjectsState] = useState<Project[]>([]);
  const [current, setCurrentState] = useState<Project | null>(null);

  const setCurrent = useCallback((p: Project) => {
    setCurrentState(p);
    try {
      localStorage.setItem(LAST_KEY, p.id);
    } catch {
      // storage may be unavailable; selection still works in-session
    }
  }, []);

  const setProjects = useCallback((list: Project[]) => {
    setProjectsState(list);
    setCurrentState((cur) => {
      const found = cur ? list.find((p) => p.id === cur.id) : null;
      if (found) return found;
      let lastId: string | null = null;
      try {
        lastId = localStorage.getItem(LAST_KEY);
      } catch {
        lastId = null;
      }
      return list.find((p) => p.id === lastId) ?? list[0] ?? null;
    });
  }, []);

  return (
    <Ctx.Provider value={{ projects, current, setCurrent, setProjects }}>
      {children}
    </Ctx.Provider>
  );
}

export function useProjects() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useProjects must be used within ProjectProvider");
  return ctx;
}
