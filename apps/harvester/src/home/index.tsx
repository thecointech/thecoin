import { Link } from 'react-router-dom'
import { ContentSection } from '@/ContentSection'
import { Button } from 'semantic-ui-react'
import styles from './index.module.less'

export const Home = () => {
  return (
    <ContentSection className={styles.container}>
      <h2>
        Introducing The Harvester
      </h2>
      <h4>
        This app creates a custom AI agent that automatically optimizes
        your personal finances to earn you money.
      </h4>
      <div>
        It'll take about 10 minutes to set it up.  After that you can sit back,
        relax, and let it work day in, day out to harvest money for you.
      </div>
      <h4>
        It won't make you a millionaire overnight...
      </h4>
      <h4>
        You just need to give it more time.
      </h4>
      <Button as={Link} to="/browser" primary>Get Started</Button>
    </ContentSection>
  )
}
