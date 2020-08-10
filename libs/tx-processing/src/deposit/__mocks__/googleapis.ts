import emaillist from './emails.list.json';
import emailget from './emails.get.json';

export namespace google {


    export namespace auth {
        export class OAuth2 {
            public credentials: any; 
            setCredentials = () => {
                // Ignore input, just set default
                this.credentials = {
                    access_token: "TEST_TOKEN"
                }
            }
        }
    }

    export function gmail() {
        return new gmail_mocked();
    }

    class gmail_mocked {
        users = {
            labels: {
                list() {
                    return { 
                        data: { 
                            labels: [
                                {
                                    name: 'etransfer',
                                    id: '123'
                                },
                                {
                                    name: 'deposited',
                                    id: '234'
                                },
                                {
                                    name: 'rejected',
                                    id: '456'
                                }
                            ]
                        }
                    }
                }
            },

            messages: {
                list() {
                    return emaillist;
                },

                get(opts: {id: string}) {
                    return emailget.find(e => e.data.id === opts.id)
                }
            }
        }
    }
}