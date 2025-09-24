import { Step } from "semantic-ui-react"
import { DefaultPathProps, usePathIndex } from "./types"
import { Link } from "react-router-dom"

type PathStepsProps<T = never> = DefaultPathProps<T> & {
  data: T
}
export const PathSteps = <T = never>({path, data}: PathStepsProps<T>) => {
  const idx = usePathIndex();
  return (
    <div>
      <Step.Group ordered>
        {
          path.routes.map((r, i) => (
            <PathStep
              key={i}
              title={r.title}
              description={r.description}
              isCompleted={r.isComplete}
              to={`/${path.groupKey}/${i}`}
              active={idx === i}
              data={data} />
          ))
        }
      </Step.Group>
    </div>
  )
}

type PathStepProps<T = never> = {
  title: string
  description: string
  isCompleted?: (data: T) => boolean
  to: string
  active: boolean
  // disabled?: boolean
  data: T
}

const PathStep = <T = never>(p: PathStepProps<T>) => (
  <Step as={Link} to={p.to} completed={p.isCompleted?.(p.data)} active={p.active}>
    <Step.Content>
      <Step.Title>{p.title}</Step.Title>
      <Step.Description>{p.description}</Step.Description>
    </Step.Content>
  </Step>
)
