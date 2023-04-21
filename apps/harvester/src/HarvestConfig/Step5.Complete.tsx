import { Button, Container } from 'semantic-ui-react'
import { ConfigReducer } from './state/reducer'

export const Complete = () => {

  const data = ConfigReducer.useData();
  const setConfig = () => {
    window.scraper.setHarvestConfig(data);
  }
  return (
    <Container>
      <h4>Start the Harvester</h4>
      <div>
        Thats it!  Your harvester is ready to go!
      </div>
      <div>
        If you're happy with your setup, hit the great big green button.
      </div>
      <div>
        Then simply forget about it. The harvester will run for you, slowly
        scalping a few dollars and cents here and there as you go about your regular life.
      </div>
      <div>
        You can come back in and check it's progress whenever you want, but there won't be
        much to see for a while.  You'll be getting richer slowly though, and in a few years
        you'll be amazed by the results.
      </div>
      <div>
        <Button onClick={setConfig}>Start Harvesting</Button>
      </div>
    </Container>
  )
}
