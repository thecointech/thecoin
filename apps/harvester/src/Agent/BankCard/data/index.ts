import RBC from './RBC.svg';
import TD from './TD.svg';
import BMO from './BMO.svg';
import CIBC from './CIBC.svg';
import NationalBank from './NationalBank-EN.svg';
import Scotia from './Scotiabank.svg';
import Tangerine from './Tangerine.svg';
import { BankIdent } from '@thecointech/store-harvester';

export type BankData = {
  icon?: string,
} & BankIdent

export const banks = [
  {
    name: 'RBC',
    icon: RBC,
    url: 'https://www.rbcroyalbank.com/'
  },
  {
    name: 'TD',
    icon: TD,
    url: 'https://www.td.com/'
  },
  {
    name: 'BMO',
    icon: BMO,
    url: 'https://www.bmo.com/'
  },
  {
    name: 'CIBC',
    icon: CIBC,
    url: 'https://www.cibc.com/'
  },
  {
    name: 'National Bank',
    icon: NationalBank,
    url: 'https://www.nationalbank.com/'
  },
  {
    name: 'Scotiabank',
    icon: Scotia,
    url: 'https://www.scotiabank.com/ca/en/personal.html'
  },
  {
    name: 'Tangerine',
    icon: Tangerine,
    url: 'https://www.tangerine.ca/'
  }
] as const satisfies readonly BankData[];

export type SupportedBanks = typeof banks[number]['name'];
