
export class Contract {

    coinPurchase = (address: string, amount: number) => ({
        wait: () => {},
        hash: `${address}-${amount}`,
    })
}

export function ConnectContract() {
    return new Contract();
}