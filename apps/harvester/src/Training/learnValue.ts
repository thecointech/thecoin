import { useState } from 'react';
import { ValueType } from '../scraper/types';

export const useLearnValue = (valueName: string, valueType: ValueType) : [string, () => Promise<boolean>] => {
  const [value, setValue] = useState('');
  const learnValue = async () => {
    const r = await window.scraper.learnValue(valueName, valueType);
    if (r.error) alert(r.error);
    if (r.value) {
      console.log("The AI read: " + JSON.stringify(r.value));
      setValue(r.value.text ?? '');
    }
    return !!r.value;
  }
  return [value, learnValue];
}