import React from 'react';
import { Form, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import moment from 'moment';
import Datetime from 'react-datetime';

import * as TheCadBroker from '@the-coin/broker-cad';
import * as Pricing from '@the-coin/pricing';
import { toHuman, toCoin } from '@the-coin/utilities';

class Complete extends React.Component {

    constructor(props, context) {
        super(props, context);

        this.state = {
            coinBuyRate: 1,
            coinSellRate: 1,
            FXRate: 1,
            deposit: 0,
            timestamp: new Date().getTime(),
            currentAction: "Submit",
            availableCoin: 0,
            submitEnabled: true
        };
    
        this.updateExchange();
        this.updateAvailableCoin();
    }
    
    componentDidUpdate(prevProps, prevState, snapshot) {
        const order = this.props.order;
        if (order.complete) {
            let newDeposit = order.complete.cadAmount;
            if (!prevProps.order.complete || newDeposit !== prevProps.order.complete.cadAmount) {
                this.setState({deposit: newDeposit});
            }    
        }
        else if (order.request) {
            let newDeposit = order.request.cadAmount;
            if (!prevProps.order.request || newDeposit !== prevProps.order.request.cadAmount) {
                this.setState({deposit: newDeposit});
            }
        }
    }

    enableComplete = (e, v) => {
        this.setState(e.checked);
    };
    validateDate = (currentDate, selectedDate) => currentDate < new Date();

    updateAvailableCoin = async () => {
        const { account, contract } = this.props;
        if (account) {
            const balance = await contract.balanceOf(account.address)
            const available = balance.toNumber();
            this.setState({availableCoin: available});
        }   
    }

    updateExchange = async () => {
        const currencyCode = 127; // {Number} The integer code for the countries currency
        const { timestamp } = this.state; // {Number} The timestamp we are requesting valid values for
        const api = new Pricing.RatesApi();
        const data = await api.getConversion(currencyCode, timestamp)
        this.setState({
            coinBuyRate: data.Buy,
            coinSellRate: data.Sell,
            FXRate: data.FxRate,
        });
    }

    async doTransfer(toUser, coins) {
        
        const { account, contract } = this.props;
        this.setState({ currentAction: "Submitting Tx"});
        let tx = await contract.transfer(toUser, coins);
        // ensure tx is mined
        this.setState({ currentAction: "Waiting Mining"});
        await tx.wait();
        return tx.hash;
    }

    setCompleted = async (e) => {
        if (e) 
            e.preventDefault();

        this.setState({ submitEnabled: false });
        const { user, id, order, account } = this.props;
        const { deposit, coinSellRate, FXRate, timestamp, availableCoin } = this.state;
        const xchangeRate = coinSellRate * FXRate;

        const coinsXfer = toCoin(deposit / xchangeRate);
        if (coinsXfer > availableCoin) {
            window.alert("Not enough coin!");
            this.setState({ submitEnabled: true });
            return;
        }
        if (!window.confirm("Transfering: " + coinsXfer)) {
            this.setState({ submitEnabled: true });
            return;
        }

        try {
            // First, do the transfer
            const txHash = await this.doTransfer(user, coinsXfer);
            this.setState({ currentAction: "Completing Tx"});
            const completion = new TheCadBroker.PurchaseComplete(timestamp, deposit, coinsXfer, coinSellRate, FXRate, txHash);
            const completionStr = JSON.stringify(completion);
            const signature = await account.signMessage(completionStr);
            const signedMessage = new TheCadBroker.SignedMessage(completionStr, signature);

            const purchaseApi = new TheCadBroker.PurchaseApi();
            const res = await purchaseApi.completeCoinPurchase(user, id, signedMessage);
            // Assume success (will throw otherwise?)
            this.props.order.complete = completion;
            window.alert("Transaction Completed");
        }
        catch (err) {
            this.setState({ submitEnabled: true });
        }
        this.setState({ currentAction: "Submit" });
    };
    
    onDatetimeChange = (current) => {
        if (this.timeout) clearTimeout(this.timeout);
        this.setState({
            timestamp: current.valueOf(),
            coinBuyRate: 1,
            coinSellRate: 1,
            FXRate: 1
        })
        this.timeout = setTimeout(() => {
            this.updateExchange();
        }, 1000);
    }

    onDepositChanged = (e) => {
        this.setState({
            deposit: e.target.value
        })
    }

    render() {
        const { order, account } = this.props;
        const { availableCoin, deposit, coinSellRate, FXRate, timestamp, currentAction, submitEnabled } = this.state;
        const disabled = !submitEnabled || !account || Boolean(order.complete);

        const defaultDatetime = order.complete ? order.complete.timestamp : timestamp;
        const reserves = toHuman(availableCoin);
        const xchangeRate = coinSellRate * FXRate;

        // Generate the right sub-content depending on which page we're in.
        let pickerProps = {
            disabled: disabled
        };
        return (
            <Form>
                <h4>Set Complete</h4>
                <p>Reserves: {reserves}</p>
                <Form.Label>Deposit:</Form.Label>
                <Form.Control disabled={disabled} type="number" placeholder="Users deposit" value={deposit.toString()} onChange={this.onDepositChanged}/>
                <Datetime defaultValue={new Date(defaultDatetime)} isValidDate={this.validateDate} inputProps={pickerProps} onChange={this.onDatetimeChange} />
                <p>
                    Exchange Rate: { xchangeRate }
                </p>
                <p>
                    Coins to Transfer: { deposit / xchangeRate }
                </p>
                <Button disabled={disabled} variant="primary" type="submit" onClick={this.setCompleted}>
                    {currentAction}
                </Button>
            </Form>
        );
    }
}
const mapStateToProps = state => ({
    account: state.AccountsRedux.account,
    contract: state.AccountsRedux.contract
});

export default connect(mapStateToProps)(Complete);
