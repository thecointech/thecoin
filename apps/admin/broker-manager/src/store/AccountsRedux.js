import GetContract, { ConnectWallet } from '@the-coin/utilities/TheContract';

const SET_ACCOUNT = 'ACT_SET';

export default (state = {
	account: null,
	contract: GetContract()
}, action) => {
	switch (action.type) {
		case SET_ACCOUNT:
			ConnectWallet(action.payload);
			const newContract = GetContract();
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
