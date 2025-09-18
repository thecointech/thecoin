import { Grid, Card } from 'semantic-ui-react'
import { HarvestData } from '../Harvester/types';
import { DateTime } from 'luxon';
import styles from './StateDisplay.module.less';

interface StateDisplayProps {
  state?: HarvestData;
}

export const StateDisplay = ({ state }: StateDisplayProps) => {
  const paymentPending = state?.state.toPayVisa
    ? `${state.state.toPayVisa.format()} - ${state.state.toPayVisaDate?.toLocaleString(DateTime.DATETIME_SHORT)}`
    : 'No runs yet';

  const s = styles?.container;
  console.log(s);

  return (
    <Card fluid id={styles.container}>
      <Card.Header className={styles.header}>Run: {state?.date.toLocaleString(DateTime.DATETIME_SHORT) ?? 'N/A'}</Card.Header>
      <Card.Content>
        <Grid columns={2}>
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
