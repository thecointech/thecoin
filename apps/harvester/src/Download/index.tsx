import styles from './browser.module.less'
import { Button, Message } from 'semantic-ui-react'
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { BackgroundTaskReducer, getTaskGroup } from '@/BackgroundTask';
import { BackgroundTaskProgressBar } from '@/BackgroundTask/BackgroundTaskProgressBar';

export const Browser = () => {

  const [hasInstalled, setHasInstalled] = useState(false);
  const tasks = BackgroundTaskReducer.useData();
  const initializeTask = getTaskGroup(tasks, 'initialize');

  useEffect(() => {
    window.scraper.hasInstalledBrowser().then(r => setHasInstalled(r.value ?? false))
  }, []);

  // Update on complete
  useEffect(() => {
    if (initializeTask?.completed === true) {
      setHasInstalled(true);
    }
  }, [initializeTask])

  // const browserApi = BrowserReducer.useApi();
  const startDownload = () => {
    window.scraper.downloadLibraries();
  }

  return (
    <div className={styles.container} >
      <h2>
        Download necessary libraries
      </h2>
      <h4>
        Your harvester requires several libraries to function.  These can be downloaded below.
      </h4>
      <OnCompleteMessage complete={hasInstalled} />
      <BackgroundTaskProgressBar type="initialize" />
      <div>
        <Button onClick={startDownload}>Download</Button>
      </div>
      <div>
        <Link to="/account/login">Setup your Account</Link>
      </div>
    </div>
  )
}

const OnCompleteMessage = ({ complete }: { complete: boolean }) => {
  return complete ? (
    <Message positive>
      Initialization complete
    </Message>
  ) : null;
}

// const DownloadProgress = () => {
//   const store = BackgroundTaskReducer.useData();
//   const initTask = getTaskGroup(store, 'initialize');

//   if (!initTask) {
//     return null;
//   }
//   const running = getRunning(initTask.subTasks);
//   const message = !initTask.completed
//     ? `Downloading... ${running.length + 1} of ${initTask.subTasks.length}`
//     : 'Complete';

//   const percent = initTask.percent ?? initTask.completed ? 100 : 0;

//   return (
//     <Progress color="green" percent={percent} active={running.length > 0}>
//       {message}
//     </Progress>
//   )
// }
