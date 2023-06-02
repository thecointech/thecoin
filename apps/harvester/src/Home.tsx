import { Link } from 'react-router-dom'
import styles from './home.module.less'

export const Home = () => {
  return (
    <div className={styles.container} >
      <h2>
        Introducing The Harvester
      </h2>
      <h4>
        This app will create an automated bot that automatically optimizes
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
      <div>
        <Link to="/account/login">Get Started</Link>
      </div>
    </div>
  )
}
