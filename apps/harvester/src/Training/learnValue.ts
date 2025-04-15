import { useState } from 'react';
import { ValueType } from '@thecointech/scraper/types';

export const useLearnValue = (valueName: string, valueType: ValueType) : [string, () => Promise<boolean>, boolean] => {
  const [value, setValue] = useState('');
  const [learning, setLearning] = useState(false);
  const learnValue = async () => {
    setLearning(true);
    const r = await window.scraper.learnValue(valueName, valueType);
    if (r.error) alert(r.error);
    if (r.value) {
      console.log("The AI read: " + JSON.stringify(r.value));
      setValue(r.value.text ?? '');
    }
    setLearning(false);
    return !!r.value;
  }
  return [value, learnValue, learning];
}
