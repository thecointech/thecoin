import React, { type JSX } from 'react';
import styles from './styles.module.less';
import { Grid } from 'semantic-ui-react';

type VisualProps={
  id: number,
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
      <Grid.Row id={"transaction_"+props.id} className={styles.transactionLine} >
        <Grid.Column className={styles.dateColumn} width={2} textAlign='center' only='computer'>
          <div className={`${styles.dateInTable}`}>
            <div className={`font-small write-vertical ${styles.yearInTable}`}>{props.yearToDisplay}</div>
            <div className={"font-bold"}>{props.monthTodisplay}</div>
            <div className={`font-big ${styles.dayInTable}`}>{props.dayToDisplay}</div>
          </div>
        </Grid.Column>
        <Grid.Column className={styles.imageColumn} width={1} only='computer'>
          <img src={props.imgForLine} />
        </Grid.Column>
        <Grid.Column className={styles.contentColumn} width={7} only='computer'>
          <div className={`font-bold ${styles.contentTextInTable}`}>{props.contentForComment}</div>
          <span className={`font-small font-green font-bold`}>{props.descForComment}</span>&nbsp;<span className={`${styles.toTextInTable} font-grey-06`}>{props.addressComment}</span>
        </Grid.Column>
        <Grid.Column className={styles.changeColumn} width={3} textAlign='right' only='computer'>
          <div className={props.classForMoneyCell}>{props.changeCad} $</div>
          <div className={`${styles.timeInTable}`}>{props.timeToDisplay}</div>
        </Grid.Column>
        <Grid.Column className={styles.balanceColumn} textAlign='right' width={3} only='computer'>
          <div className={`font-big`}>{props.balanceCad} $</div>
        </Grid.Column>

        <Grid.Column only='tablet mobile' width={15}>
          <div className={styles.commentLineForMobile}>
            <img src={props.imgForLine} />
            <div className={`font-bold ${styles.contentTextInTable}`}>{props.contentForComment}</div>
            <span className={`font-small font-green font-bold`}>{props.descForComment}</span>&nbsp;<span className={`${styles.toTextInTable} font-grey-06`}>{props.addressComment}</span>
          </div>
        </Grid.Column>
        <Grid.Column  only='tablet mobile' width={15}>
          <div className={`${styles.dateLineForMobile}`}>
            <span className={`font-big ${styles.dayInTable}`}>{props.dayToDisplay} </span>
            <span className={`${styles.monthInTable}`}>{props.monthTodisplay} {props.yearToDisplay}</span>
            <span className={`${styles.timeInTable}`}>  {props.timeToDisplay}</span>
            <span className={`${props.classForMoneyCell} ${styles.money}`}>{props.changeCad} $</span>
          </div>
        </Grid.Column>

      </Grid.Row>

    );
}
