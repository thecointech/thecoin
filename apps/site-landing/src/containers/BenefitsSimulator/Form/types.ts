import { Dispatch, SetStateAction } from 'react';
import { SimulationParameters } from '../../ReturnProfile/data/params';

export type Props = {
  params: SimulationParameters;
  setParams: Dispatch<SetStateAction<SimulationParameters>>;
  years: number,
  setYears: Dispatch<SetStateAction<number>>;
};
