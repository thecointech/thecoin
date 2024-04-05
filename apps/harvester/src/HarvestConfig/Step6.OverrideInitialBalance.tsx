import { useState } from 'react';
import { Container, Input, Button } from 'semantic-ui-react'
import { safeParseFloat } from './state/utils';
import { AccountMap } from '@thecointech/shared/containers/AccountMap/reducer';
import { useFxRates } from '@thecointech/shared/containers/FxRate';
import { getFxRate } from '@thecointech/fx-rates';
import { toHuman } from "@thecointech/utilities";

export const OverrideInitialBalance = () => {

  const active = AccountMap.useActive();

  const { rates } = useFxRates();
  const { buy, fxRate } = getFxRate(rates, 0);
  const balance = active?.balance ?? 0;
  const cadBalance = toHuman(buy * balance * fxRate, true);

  const [overrideBalance, setOverrideBalance] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [pendingDate, setPendingDate] = useState<Date|null>(null);

  const onApplyBalance = () => {
    window.scraper.setOverrides(overrideBalance, pendingAmount, pendingDate)
  }

  return (
    <Container>
      <h4>Override the initial balance</h4>
      <div>
        Initialize the harvester to a specific balance.
      </div>
      <div>
        You're account currently has a balance of ${cadBalance}.
        The harvester doesn't know what this balance is for, so by default it will ignore it.
        Here you can tell the harvester to include this balance in it's processing.
      </div>
      <div>
        This won't change how it behaves in future.
      </div>
      <div>
        <Input placeholder="Amount" value={overrideBalance} onChange={(_, {value}) =>
          setOverrideBalance(
            Math.min(safeParseFloat(value), cadBalance)
          )
        }/>
        <br />
        <Input placeholder="Pending Payment" value={pendingAmount} onChange={(_, {value}) =>
          setPendingAmount(
            Math.min(safeParseFloat(value), cadBalance)
          )
        }/>
        <input type="date" value={pendingDate?.toDateString()} onChange={value => setPendingDate(value.target.valueAsDate)} />
        <Button onClick={onApplyBalance}>
          Apply
        </Button>
      </div>
    </Container>
  )
}
