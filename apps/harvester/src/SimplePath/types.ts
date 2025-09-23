export type Routes<T = never> = {
  title: string
  description: string
  component: React.ComponentType
  isComplete: (data: T) => boolean
}

export type Path<T = never> = {
  groupKey: string
  routes: Routes<T>[]
}

export type DefaultPathProps<T = never> = {
  path: Path<T>
}
