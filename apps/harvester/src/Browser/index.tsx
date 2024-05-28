import styles from './browser.module.less'
import { Button, Message, Progress } from 'semantic-ui-react'
import { BrowserReducer } from './reducer';

export const Browser = () => {

  const browserApi = BrowserReducer.useApi();
  const startDownload = async () => {
    browserApi.installBrowser();
  }

  return (
    <div className={styles.container} >
      <h2>
        Ensure we have a compatible browser
      </h2>
      <h4>
        Your harvester requires a specific version of Chrome to be installed
        on your computer.
      </h4>
      <div>If none is found, you can click "download" below and the
        harvester will download one it can use.
      </div>
      <DownloadBrowserMessage />
      <DownloadProgress />
      <div>
        <Button onClick={startDownload}>Download</Button>
      </div>
    </div>
  )
}

const DownloadBrowserMessage = () => {
  const browserData = BrowserReducer.useData();

  if (browserData.hasInstalledBrowser) {
    // If we have downloaded a browser, nothing more needs to be done
    return (
      <Message positive>
          Harvester-specific browser installed
      </Message>
    )
  }
  else {
    if (browserData.hasCompatibleBrowser) {
      return (
        <>
          <Message>
            No harvester-specific browser found, falling back to system browser
          </Message>
          <Message positive>
              Your system browser is compatible with this harvester.  Most of the time
              this is all you need, but if your harvester throws errors during harvesting,
              it may help to install the exact version we've tested against.
          </Message>
        </>
      )
    }
    else {
      return (
        <Message warning>
          Your system browser is not compatible with this harvester, click "Download" below to install a compatible version
        </Message>
      )
    }
  }
}

const DownloadProgress = () => {
  const browserData = BrowserReducer.useData();
  if (browserData.downloadPercent === undefined) {
    return null;
  }
  const message = browserData.downloadError ??
    browserData.isInstalling ? 'Downloading...' : 'Complete';
  return (
    <Progress color="green" percent={browserData.downloadPercent} active={browserData.isInstalling}>
      {message}
    </Progress>
  )
}
