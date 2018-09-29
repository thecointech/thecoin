import { combineReducers } from 'redux';
import AccountsRedux from "./AccountsRedux";
import PurchasesRedux from "./PurchasesRedux";

export default combineReducers({
    AccountsRedux,
    PurchasesRedux
});