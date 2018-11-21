import GetContract, { ConnectWallet } from '@the-coin/utilities/TheContract';

const SET_ACCOUNT = 'ACT_SET';

export default (state = {
	account: null,
	contract: GetContract()
}, action) => {
	switch (action.type) {
		case SET_ACCOUNT:
			const newContract = ConnectWallet(action.payload)
			return { 
				...state, 
				account: newContract.signer,
				contract: newContract
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
