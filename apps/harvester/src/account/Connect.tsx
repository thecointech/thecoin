import { useEffect, useState } from "react";

export const Connect = () => {

  const [address, setAddress] = useState<string|null>();
  useEffect(() => {
    window.scraper.getWalletAddress().then(res => {
      if (res.error) {
        alert(res.error);
      }
      else {
        setAddress(res.value);
      }
    });
  }, []);
  return (
    <>
      <DoConnect />
      <HasAddress address={address} />
    </>
  )

}

const DoConnect = () => {
  const [connecting, setConnecting] = useState(false);
  const connect = () => {
    setConnecting(true);
    window.scraper.getWalletFromSite().then(res => {
      if (res.error) {
        alert(res.error);
      }
      else {
        setConnecting(false);
      }
    });
  }
  return (
    <div>
      <p>Request connection to your Coin account</p>
      <button onClick={connect}>Connect</button>
      {connecting && <div>Connecting...</div>}
    </div>
  )
}

const HasAddress = ({address}: {address?: string|null}) => {
  return (
    address
    ? <div>Your harvester is connected to {address}</div>
    : <div>Your harvester is not connected to a Coin account</div>
  )
}
