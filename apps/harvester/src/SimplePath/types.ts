import { useLocation } from "react-router"

export type Routes<T = never> = {
  title: string
  path: string,
  description: string
  component: React.FC
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

export const usePathIndex = (path: Path) => {
  const location = useLocation();
  const index = path.routes.findIndex((r) => location.pathname.endsWith(r.path));
  return index < 0 ? 0 : index;
}
