import React from 'react';
import { connect } from "react-redux"

import { setPurchaseIds, setExchangeStep } from '../store/PurchasesRedux'
import { Dropdown } from 'react-bootstrap';

class Loader extends React.PureComponent {

    setPurchaseState = (eventKey, event) => {
        this.props.setExchangeStep(eventKey);
    }



    render() {
        const { keys, state, loading } = this.props;
        const numPurchases = keys.length;

        const message = (loading) ?
            <div>
                <p>Please wait: loading</p>
            </div>
            :
            <div>
                <p>Purchases: {numPurchases}</p>
            </div>

        const states = ['Request', 'Confirmed', 'Completed']
        const items = states.map((state, index) => <Dropdown.Item key={index} eventKey={index} as="button">{state}</Dropdown.Item>)
        const stateMsg = states[state || 0];
        return (
            <div>
                <Dropdown onSelect={this.setPurchaseState}>
                    <Dropdown.Toggle variant="success" id="dropdown-basic">
                        {stateMsg}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        {items}
                    </Dropdown.Menu>
                </Dropdown>
                {message}
            </div>

        );
    }
}

const mapStateToProps = state => ({
    keys: state.PurchasesRedux.keys,
    state: state.PurchasesRedux.state,
    loading: state.PurchasesRedux.loading,
})

const mapDispatchToProps = (dispatch) => ({
    setIds: (ids) => dispatch(setPurchaseIds(ids)),
    setExchangeStep: (state) => dispatch(setExchangeStep(state)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Loader)
