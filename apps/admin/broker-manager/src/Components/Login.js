import React, { PureComponent } from 'react';
import { Button, Form, FormGroup, FormControl } from 'react-bootstrap';
import { Wallet } from 'ethers';
import { connect } from "react-redux"
import FileInput from 'react-simple-file-input';

import { setAccount } from '../store/AccountsRedux'

class Login extends PureComponent {

    constructor(props, context) {
        super(props, context);

        const initState = !props.account ? 'Not logged in' : 'Logged In';
        this.state = {
            password: '',
            accountFile: '',
            state: initState,
            enabled: true
        };
    }

    SetAccount = (e, results) => {
        this.setState({ accountFile: e.target.result });
    }

    SetPassword = (e) => {
        this.setState({ password: e.target.value });
    }

    Unlock = async () => {
        this.setState({
            enabled: false
        })
        const { accountFile, password } = this.state;
        if (!accountFile || !password) {
            this.setState({ state: 'No password or account set' });
        }
        const start = new Date().getTime();
        try {
            const decrypted = await Wallet.fromEncryptedJson(accountFile, password, (percentage) => {
                let pers = Math.round(percentage * 100)
                this.setState({ state: 'Decrypting: ' + pers });
            })

            const dur = new Date().getTime() - start;
            console.log("Ethers decrypted in: " + dur);

            this.setState({ state: 'Logged In' });
            this.props.setAccount(decrypted);
        }
        catch(err) {

            const dur = new Date().getTime() - start;
            console.log("Ethers Key failed in: " + dur);

            this.setState({ state: err.toString() });
            console.error(err);
        }

        this.setState({
            enabled: true
        })
    }

    // Unlock2 = () => {
    //     this.Unlock();
    //     return;

    //     const { accountFile, password } = this.state;
    //     const encrypted = JSON.parse(accountFile);
    //     const start = new Date().getTime();
    //     let dec = null;
    //     try {
    //         dec = web3.eth.accounts.wallet.decrypt([encrypted], password);
    //         const dur = new Date().getTime() - start;
    //         console.log("Web3 decrypted in: " + dur);
    //     }
    //     catch(err) { 
    //         console.error(err);
    //         const dur = new Date().getTime() - start;
    //         console.log("Web3 Key failed in: " + dur);
    //     }
    // }

    render() {
        const { password, accountFile, state, enabled } = this.state;
        const { account } = this.props;
        return (
            <div style={{ margin: 'auto', width: '800px', textAlign: 'left' }}>
                <Form>
                    <FormGroup>
                        <FileInput
                            readAs='text'
                            onLoad={this.SetAccount}
                        />
                        <br />
                        <br />
                        <FormControl
                            type="text"
                            value={password}
                            placeholder="Account Password"
                            onChange={this.SetPassword}
                        />
                        <br />
                        <br />
                        <Button disabled={!enabled} onClick={this.Unlock}>Unlock Account</Button>
                        <p>
                            State: {state}
                        </p>
                    </FormGroup>
                </Form>
            </div>
        );
    }
}



const mapStateToProps = state => ({
    account: state.AccountsRedux.account,
})

const mapDispatchToProps = (dispatch) => ({
    setAccount: (account) => dispatch(setAccount(account))
})

export default connect(mapStateToProps, mapDispatchToProps)(Login)