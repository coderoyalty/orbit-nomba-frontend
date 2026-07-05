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
  setCurrent: (p: Project | null) => void;
  setProjects: (p: Project[]) => void;
  activeEnv: "live" | "test";
  setActiveEnv: (env: "live" | "test") => void;
}

const Ctx = createContext<ProjectCtx | null>(null);

const LAST_KEY = "orbit_last_project";
const ENV_KEY = "orbit_active_env";

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjectsState] = useState<Project[]>([]);
  const [current, setCurrentState] = useState<Project | null>(null);
  const [activeEnv, setActiveEnvState] = useState<"live" | "test">(() => {
    try {
      return (localStorage.getItem(ENV_KEY) ?? "test") as "live" | "test";
    } catch {
      return "test";
    }
  });

  const setCurrent = useCallback((p: Project | null) => {
    setCurrentState(p);
    try {
      if (p) {
        localStorage.setItem(LAST_KEY, p.id);
      } else {
        localStorage.removeItem(LAST_KEY);
      }
    } catch {
      // storage may be unavailable
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
      return list.find((p) => p.id === lastId) ?? null;
    });
  }, []);

  const setActiveEnv = useCallback((env: "live" | "test") => {
    setActiveEnvState(env);
    try {
      localStorage.setItem(ENV_KEY, env);
    } catch {
      // storage may be unavailable
    }
  }, []);

  return (
    <Ctx.Provider value={{ projects, current, setCurrent, setProjects, activeEnv, setActiveEnv }}>
      {children}
    </Ctx.Provider>
  );
}

export function useProjects() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useProjects must be used within ProjectProvider");
  return ctx;
}
