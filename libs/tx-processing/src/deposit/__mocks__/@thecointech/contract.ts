
const genRanHex = (size: number) => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

export class Contract {

    coinPurchase = (_address: string, _amount: number) => ({
        wait: () => {},
        hash: `0x${genRanHex(64)}`,
    })

    provider = {
      waitForTransaction: () => Promise.resolve({})
    }
}

export function GetContract() {
    return new Contract();
}
