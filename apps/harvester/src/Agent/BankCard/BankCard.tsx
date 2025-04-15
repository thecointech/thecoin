import { Button, Input } from "semantic-ui-react";
import type { BankData } from "./data";
import { useState } from "react";

type BasicData = {
  isSelected: boolean
  onClick: (bank: BankData) => void
}
type BankProps = BankData & BasicData;
export const BankCard: React.FC<BankProps> = ({ name, url, icon, isSelected, onClick }) => {
  const style = isSelected ? { border: '1px solid #FC0' } : { border: '1px solid grey' }
  return (
    <div style={{ ...style, cursor: 'pointer' }} onClick={() => onClick({ name, url, icon })}>
      <img style={{ width: '200px', height: '200px' }} src={icon} alt={name} />
    </div>
  );
}


export const CustomBankCard: React.FC<BasicData> = ({ isSelected, onClick }) => {
  const style = isSelected ? { border: '1px solid #FC0' } : { border: '1px solid grey' }
  const [url, setUrl] = useState('');
  const onSubmit = () => {
    onClick({ name: "Custom", url })
  }
  // TODO: We could potentially use node to trigger a fetch of title & icon here
  return (
    <div style={{ ...style, cursor: 'pointer', position: 'relative' }}>
      <div style={{ width: '200px', height: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }} onClick={() => onClick({ name: "Custom", url, icon : 'Custom'})}>
        <div style={{ backgroundColor: '#138175', borderRadius: '4px', width: '90%', fontSize: '3rem', color: 'white', padding: '16px' }}>
          Custom
        </div>
      </div>
      <div style={{width: '90%', marginTop: '-3rem', display: 'flex', flexDirection: 'row', visibility: isSelected ? 'visible' : 'hidden', position: 'absolute'}}>
        <Input
          style={{ width: '156px' }}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="URL to process"
        />
        <Button style={{
          paddingLeft: '1rem',
          paddingRight: '1rem'
        }}
          onClick={onSubmit}>Go</Button>
      </div>
    </div>
  );
}
