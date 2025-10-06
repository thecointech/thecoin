import { useEffect, useState } from 'react';
import { Container, Input, Button } from 'semantic-ui-react'
import { AccountMap } from '@thecointech/shared/containers/AccountMap/reducer';
import { useFxRates } from '@thecointech/shared/containers/FxRate';
import { getFxRate } from '@thecointech/fx-rates';
import { toHuman } from "@thecointech/utilities";
import { DateTime } from 'luxon';
import { safeParseFloat } from '@/HarvestConfig/state/utils';
import { DimmerCallback } from './types';

export const OverrideHarvesterState = ({withDimmer}: {withDimmer: DimmerCallback}) => {

  const { rates } = useFxRates();
  const active = AccountMap.useActive();
  const [harvesterBalance, setHarvesterBalance] = useState<number>();
  const [accountBalance, setAccountBalance] = useState<number>();
  const [overrideBalance, setOverrideBalance] = useState<number>();
  const [pendingAmount, setPendingAmount] = useState<number|null>(null);
  const [pendingDate, setPendingDate] = useState<DateTime|null>(null);


  useEffect(() => {
    withDimmer("Loading...", async () => {
      const r = await window.scraper.getCurrentState();
      if (r.error) {
        alert("Error - please check logs:\n " + r.error);
        return;
      }
      const harvesterBalance = r.value?.state.harvesterBalance;
      if (harvesterBalance !== undefined) {
        setHarvesterBalance(Number(harvesterBalance));
      }
    });
  }, []);

  useEffect(() => {
    withDimmer("Loading...", async () => {
      const { buy, fxRate } = getFxRate(rates, 0);
      const balance = active?.balance ?? 0;
      const cadBalance = toHuman(buy * balance * fxRate, true);
      setAccountBalance(cadBalance);
    });
  }, [active?.balance, rates]);

  const onApplyBalance = () => {
    if (overrideBalance !== undefined) {
      withDimmer("Saving...", async () => {
        const r = await window.scraper.setOverrides(overrideBalance, pendingAmount, pendingDate?.toISO())
        if (r.error) {
          alert("Error - please check logs:\n " + r.error);
        }
      })
    }
    else {
      alert("Please enter an override balance");
    }
  }

  const dateFormatted = pendingDate?.toISO()?.slice(0, 16);

  return (
    <Container>
      <div>
        Available Balance: ${accountBalance}
        <br />
        Harvester Balance: ${harvesterBalance}
      </div>
      <div>
        Your harvester tracks its own balance within your accounts balance.  It's own balance
        is what is used to calculate how much money is needed to cover the credit card payments.
      </div>
      <div>
        <Input placeholder="Amount" value={overrideBalance ?? 0} onChange={(_, {value}) =>
          setOverrideBalance(
            Math.min(safeParseFloat(value), accountBalance ?? 0)
          )
        }/>
        <br />
        <Input placeholder="Pending Payment" value={pendingAmount ?? 0} onChange={(_, {value}) =>
          setPendingAmount(
            Math.min(safeParseFloat(value), accountBalance ?? 0)
          )
        }/>
        <input type="datetime-local"
          value={dateFormatted ?? ""}
          onChange={value => setPendingDate(DateTime.fromISO(value.target.value))}
        />
        <br />
        <Button onClick={onApplyBalance} disabled={overrideBalance === undefined}>
          Apply
        </Button>
      </div>
    </Container>
  )
}
