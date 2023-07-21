import { Button, Container } from 'semantic-ui-react'
import { ConfigReducer } from './state/reducer'
import { useHistory } from 'react-router';

export const Complete = () => {
  const navigate = useHistory();
  const data = ConfigReducer.useData();
  const setConfig = async () => {
    await window.scraper.setHarvestConfig(data);
    navigate.push("/results");
  }
  return (
    <Container>
      <h4>Start the Harvester</h4>
      <div>
        Thats it!  Your harvester is ready to go!
      </div>
      <div>
        If you're happy with your setup, hit the great big green button.  This saves your results and schedules the harvester to run for you.
      </div>
      <div>
        Now... simply forget about it. The harvester will run for you, slowly
        scalping a few dollars and cents here and there as you go about your regular life.
      </div>
      <div>
        You can come back in and check it's progress whenever you want, but there won't be
        much to see for a while.  You'll be getting richer slowly though, and in a few years
        you'll be amazed by the results.
      </div>
      <div>
        <Button onClick={setConfig} style={{backgroundColor: 'green', color: 'white'}}>Save Config</Button>
      </div>
    </Container>
  )
}
