import { Grid, Card, Loader, Icon, Popup } from 'semantic-ui-react'
import { HarvestData } from '../Harvester/types';
import { DateTime } from 'luxon';
import styles from './StateDisplay.module.less';
import { useEffect, useMemo, useState } from 'react';
import { fetchRate } from '@thecointech/fx-rates';
import { toHuman } from '@thecointech/utilities/Conversion';
import currency from 'currency.js';

type StateDisplayProps = {
  state?: HarvestData;
}
export const StateDisplay = ({ state }: StateDisplayProps) => {

  const [loading, setLoading] = useState(false);
  const paymentPending = state?.state.toPayVisa
    ? `${state.state.toPayVisa.format()} - ${state.state.toPayVisaDate?.toLocaleString(DateTime.DATETIME_SHORT)}`
    : 'No runs yet';

  const [cadBalance, setCadBalance] = useState<currency|null>(null);

  const eTransferred = useMemo(() => {
    if (!state?.delta) {
      return currency(0);
    }
    // The amount etransferred out of the chequing account is present in the
    // delta, but not the final state (in final it goes to 0 and harvesterBalance goes up)
    const transferred = state.delta.findLast((delta) => delta.toETransfer !== undefined)?.toETransfer;
    return transferred ?? currency(0);
  }, [state?.delta]);

  // Our state chq balance is from the start of the run.  Apply the changes to
  // get a more human version of the balance
  const chqBalance = useMemo(() => {
    if (!state?.chq) {
      return null;
    }
    return state.chq.balance.subtract(eTransferred);
  }, [state?.chq, eTransferred]);

  useEffect(() => {
    if (!state?.coin || state.coin < 0) {
      setCadBalance(eTransferred);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchRate(state.date.toJSDate())
      .then(async rate => {
        if (rate) {
          const balance = Number(state.coin);
          const initBalance = toHuman(rate.buy * balance * rate.fxRate, true);
          // The coin balance is from initial state, add in the e-transferred
          // amount.  This isn't strictly true, as it's not deposited (yet),
          // but it makes more sense to the user to see the expected balance
          const cadBalance = currency(initBalance).add(eTransferred);
          if (!cancelled) {
            setCadBalance(cadBalance);
          }
        }
      })
      .catch(error => {
        console.error('Failed to fetch rate:', error);
        if (!cancelled) {
          setCadBalance(null);
        }
      })
      .finally(() => {
        setLoading(false);
      })
      return () => { cancelled = true; }
  }, [state?.coin, state?.date, eTransferred])

  return (
    <Card fluid id={styles.container}>
      <Card.Header className={styles.header}>Run: {state?.date.toLocaleString(DateTime.DATETIME_SHORT) ?? 'N/A'}</Card.Header>
      <Card.Content>
        <Grid columns={2}>
          <Grid.Row>
            <Grid.Column className={styles.column}>Available Balance:</Grid.Column>
            <Grid.Column>
              {(loading)
                ? <Loader active/>
                : cadBalance?.format() ?? 'N/A'
              }
              <InfoTooltip eTransferred={eTransferred} />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column className={styles.column}>Harvester Balance:</Grid.Column>
            <Grid.Column>{state?.state.harvesterBalance?.format() ?? 'N/A'}</Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column className={styles.column}>Visa Payment Pending:</Grid.Column>
            <Grid.Column>{paymentPending}</Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column className={styles.column}>Chq Balance:</Grid.Column>
            <Grid.Column>{chqBalance?.format() ?? 'N/A'}</Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column className={styles.column}>Visa Balance:</Grid.Column>
            <Grid.Column>{state?.visa.balance.format() ?? 'N/A'}</Grid.Column>
          </Grid.Row>
        </Grid>
      </Card.Content>
    </Card>
  )
}

const InfoTooltip = ({ eTransferred }: { eTransferred: currency }) => {
  return eTransferred.value == 0 ? null : (
    <span style={{ marginLeft: '0.5rem' }}>
      <Popup
        content={`The available balance includes ${eTransferred.format()} transferred this run, which may not be deposited yet.`}
        trigger={<Icon name="info circle" />}
      />
    </span>
  )
}
