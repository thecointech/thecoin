import { Step } from "semantic-ui-react"
import { DefaultPathProps, usePathIndex } from "./types"
import { Link } from "react-router-dom"
import styles from "./Steps.module.less"
import { useEffect, useRef } from "react"
import React from "react"

type PathStepsProps<T = never> = DefaultPathProps<T> & {
  data: T
}
export const PathSteps = <T = never>({path, data}: PathStepsProps<T>) => {
  const idx = usePathIndex();
  const containerRef = useRef<HTMLDivElement>(null);
  const activeStepRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeStepRef.current && containerRef.current) {
      activeStepRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [idx]);

  return (
    <div className={styles.stepsContainer} ref={containerRef}>
      <Step.Group ordered unstackable>
        {
          path.routes.map((r, i) => (
            <PathStep
              key={i}
              title={r.title}
              description={r.description}
              isCompleted={r.isComplete}
              to={`/${path.groupKey}/${i}`}
              active={idx === i}
              stepRef={idx === i ? activeStepRef : null}
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
  stepRef?: React.RefObject<HTMLDivElement>|null
  data: T
}

const PathStep = <T = never>({ title, description, isCompleted, to, active, stepRef, data }: PathStepProps<T>) => (
    <Step as={Link} to={to} completed={isCompleted?.(data)} active={active}>
      <Step.Content>
        <div ref={stepRef}>
          <Step.Title>{title}</Step.Title>
          <Step.Description>{description}</Step.Description>
        </div>
      </Step.Content>
    </Step>
)
