import { useLocation } from "react-router"

export type Routes<T = never> = {
  title: string
  description: string
  component: React.ComponentType<T>
  isComplete?: (data: T) => boolean
}

export type Path<T = never> = {
  groupKey: string
  routes: Routes<T>[]
}

export type DefaultPathProps<T = never> = {
  path: Path<T>
  data?: T
}

export function usePathIndex() {
  const location = useLocation();
  const curr = location.pathname;
  const m = curr.match(/\/(\d+)\/?$/)
  // Disable "next" button if we're on the last step
  return parseInt(m?.[1] || "0");
}
