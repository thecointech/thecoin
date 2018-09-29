import {getDefaultProvider, Contract } from 'ethers';
import TheCoinSpec from './contracts/TheCoin';

const SET_ACCOUNT = 'ACT_SET';

const abi = TheCoinSpec.abi;
const address = TheCoinSpec.networks[3].address;
const ropsten = getDefaultProvider('ropsten');

export default (state = {
	account: null,
	contract: new Contract(address, abi, ropsten)
}, action) => {
	switch (action.type) {
		case SET_ACCOUNT:
			let account = action.payload;
			account = account.connect(ropsten);
			return { 
				...state, 
				account: account,
				contract: state.contract.connect(account)
			}
		default:
			return state;
	}
};

export const setAccount = (account) => (dispatch) => {
	dispatch({
		type: SET_ACCOUNT,
		payload: account,
	});
};
