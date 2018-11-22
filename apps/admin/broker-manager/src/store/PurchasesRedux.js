import * as TheCadBroker from '@the-coin/broker-cad';

const SET_IDS = 'PUR_SET';
const SET_STATE = 'PUR_STT';

let __lastState = -1;

export default (state = {
    keys: [],
    state: __lastState,
    loading: false
}, action) => {
    switch (action.type) {
        case SET_IDS:
            return { ...state, keys: action.payload, loading: false }
        case SET_STATE:
            return { ...state, state: action.payload, loading: true }
        default:
            return state;
    }
};


export const setPurchaseIds = (ids) => (dispatch) => {
    dispatch({
        type: SET_IDS,
        payload: ids,
    });
};

export const setExchangeStep = (state) => (dispatch) => {
    if (state !== __lastState) {
        __lastState = state;

        dispatch({
            type: SET_STATE,
            payload: state,
        });

        // Now, update our ID's
        const broker = new TheCadBroker.PurchaseApi();
        broker
            .queryCoinPurchasesIds(state)
            .then((data) => {
                console.log('IDs queried successfully. Returned data: ', data);
                dispatch({
                    type: SET_IDS,
                    payload: data,
                });
                return data;
            })
            .catch((err) => {
                console.error(err);
            });
    }
};
