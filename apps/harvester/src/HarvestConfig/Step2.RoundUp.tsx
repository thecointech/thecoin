import { useEffect, useState } from 'react';
import { Checkbox, Container, Input } from 'semantic-ui-react'
import { HarvestStepType } from '@thecointech/store-harvester';
import { ConfigReducer } from './state/reducer';
import { safeParseFloat } from './state/utils';

export const RoundUp = () => {
  const data = ConfigReducer.useData();
  const api = ConfigReducer.useApi();
  const roundUp = data.steps.find(step => step.type === HarvestStepType.RoundUp);

  const [enabled, setEnabled] = useState(!!roundUp ?? false);
  const [roundPoint, setRoundPoint] = useState(roundUp?.args?.['roundPoint'] ?? 100);

  useEffect(() => {
    if (enabled) {
      api.setStep(HarvestStepType.RoundUp, {
        roundPoint
      });
    }
    else {
      api.clearStep(HarvestStepType.RoundUp);
    }
  }, [enabled, roundPoint]);

  return (
    <Container>
      <h4>How much should the Harvester transfer?</h4>
      <div>
        Rounding up is a great way to boost earnings, especially if the harvester doesn't run frequently.
        Visa does not post transactions immediately, and without rounding up, your earning balance will always
        be less than the amount spent.  Rounding up solves this rounding up every transaction to a specified point.
      </div>
      <div>
        For example, if you spend $50 on your visa, and round up is set to $100, the harvester will
        transfer $100 to TheCoin for you.  The harvester will then wait until you have spent more
        than $100 total before making any further transfers.
      </div>
      <div>
        Enabling RoundUp for an average person will not cost you anything more, it simply makes the transfers
        in slightly earlier.  However, this will likely increase your earnings by $10 in a single year,
        or $10000 over a lifetime due to it's higher growth potential.
      </div>
      <div>
        <Checkbox toggle label="Enable RoundUp to nearest " checked={enabled} onChange={(_, {checked}) => setEnabled(!!checked)}/>
        &nbsp;&nbsp;
        <Input placeholder="Amount" value={roundPoint} onChange={(_, {value}) => setRoundPoint(safeParseFloat(value))}/>
      </div>
      {/* <div>
        Alternatively, if you're extremely agressive, you can just transfer as much as possible.
        This is only for those with nerves of steel, but you'll earn $100s more every year.
        <Checkbox toggle label="RoundUp" />
        <Input placeholder="Amount" />
      </div> */}
    </Container>
  )
}
