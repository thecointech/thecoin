
export class Contract {

    coinPurchase = (_address: string, amount: number) => ({
        wait: () => {},
        hash: `${amount}`,
    })
}

export function ConnectContract() {
    return new Contract();
}
