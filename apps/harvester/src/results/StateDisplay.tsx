import { Grid, Card, Loader } from 'semantic-ui-react'
import { HarvestData } from '../Harvester/types';
import { DateTime } from 'luxon';
import styles from './StateDisplay.module.less';
import { AccountMap } from '@thecointech/shared/containers/AccountMap';
import { useEffect, useState } from 'react';
import { fetchRate } from '@thecointech/fx-rates';
import { toHuman } from '@thecointech/utilities/Conversion';
import currency from 'currency.js';

type StateDisplayProps = {
  state?: HarvestData;
}
export const StateDisplay = ({ state }: StateDisplayProps) => {

  const [loading, setLoading] = useState(true);
  const active = AccountMap.useActive();
  const paymentPending = state?.state.toPayVisa
    ? `${state.state.toPayVisa.format()} - ${state.state.toPayVisaDate?.toLocaleString(DateTime.DATETIME_SHORT)}`
    : 'No runs yet';

  const [cadBalance, setCadBalance] = useState<currency|null>(null);
  useEffect(() => {
const [cadBalance, setCadBalance] = useState<currency|null>(null);
useEffect(() => {
    if (!active?.balance || active.balance < 0) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchRate()
      .then(async rate => {
        if (rate && active?.balance) {
          const balance = active?.balance ?? 0;
          const cadBalance = toHuman(rate.buy * balance * rate.fxRate, true);
          setCadBalance(currency(cadBalance));
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to fetch rate:', error);
        setCadBalance(null);
        setLoading(false);
      });
  }, [active?.balance])
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
              }</Grid.Column>
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
            <Grid.Column>{state?.chq.balance.format() ?? 'N/A'}</Grid.Column>
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
