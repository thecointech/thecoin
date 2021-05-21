import React from 'react';
import styles from './styles.module.less';
import { Grid } from 'semantic-ui-react';

type VisualProps={
  key: number,
  locale: string,

  yearToDisplay: number,
  monthTodisplay: string,
  dayToDisplay: number,

  imgForLine: string,
  contentForComment: JSX.Element,
  addressComment: string,
  descForComment: JSX.Element,

  classForMoneyCell: string,
  changeCad: number,
  timeToDisplay: string,

  balanceCad: number

};
                
export const TransactionLine = (props:VisualProps) => {

    return (
      <Grid.Row key={props.key} className={styles.transactionLine}>
        <Grid.Column className={styles.dateColumn} width={2} textAlign='center'>
          <div className={`${styles.dateInTable}`}>
            <div className={`font-small write-vertical ${styles.yearInTable}`}>{props.yearToDisplay}</div>
            <div className={"font-bold"}>{props.monthTodisplay}</div>
            <div className={`font-big ${styles.dayInTable}`}>{props.dayToDisplay}</div>
          </div>
        </Grid.Column>
        <Grid.Column className={styles.imageColumn} width={1}><img src={props.imgForLine} /></Grid.Column>
        <Grid.Column className={styles.contentColumn} width={7}>
          <div className={`font-bold ${styles.contentTextInTable}`}>{props.contentForComment}</div>
          <span className={`font-small font-green font-bold`}>{props.descForComment}</span>&nbsp;<span className={`${styles.toTextInTable} font-grey-06`}>{props.addressComment}</span>
        </Grid.Column>
        <Grid.Column className={styles.changeColumn} width={3} textAlign='right'>
          <div className={props.classForMoneyCell}>{props.changeCad} $</div>
          <div className={`${styles.timeInTable}`}>{props.timeToDisplay}</div>
        </Grid.Column>
        <Grid.Column className={styles.balanceColumn} textAlign='right' width={3}><div className={`font-big`}>{props.balanceCad} $</div></Grid.Column>
      </Grid.Row>
    );
}
