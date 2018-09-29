import React from 'react';
import { connect } from "react-redux"
import * as TheCadBroker from 'the-broker-cad'; // eslint-disable-line import/no-extraneous-dependencies

import Request from './Request'
import Confirm from './Confirm'
import Complete from './Complete'

class Purchase extends React.Component {

    constructor(props, context) {
        super(props, context);

        this.state = {
            user: "Not yet set",
            id: "---",
            order: {
                request: null,
                confirm: null,
                complete: null
            }
        };

        const purchaseIdx = this.props.match.params.index;
        const purchaseKey = this.props.purchaseKeys[purchaseIdx];
        if (purchaseKey) {
            const [, user, , id] = purchaseKey.split('/')

            this.state.user = user;
            this.state.id = id;
            this.queryPurchaseOrder(user, id);
        }
    }

    queryPurchaseOrder = (user, id) => {

        const broker = new TheCadBroker.PurchaseApi();
        broker
            .queryCoinPurchase(user, id)
            .then((data) => {
                console.log('API called successfully. Returned data: ', data);
                this.setState({ order: data })
                return data;
            })
            .catch((err) => {
                console.error(err);
            });
    }

    render() {
        const { user, id, order } = this.state;
        // Generate the right sub-content depending on which page we're in.
        return (<div>
            <p>
                User: {user}
            </p>
            <Request request={order.request} />
            <hr />
            <Confirm user={user} id={id} order={order} />
            <hr />
            <Complete key={id} user={user} id={id} order={order} />
        </div>);
    }
}

const mapStateToProps = state => ({
    purchaseKeys: state.PurchasesRedux.keys,
    account: state.AccountsRedux.account
})

export default connect(mapStateToProps)(Purchase)