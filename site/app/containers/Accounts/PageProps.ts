import { Option } from './New/Wizard/Options/Types';

export interface PageProps {
  accountName: string;
  setName: (name: string) => void;
  buttonText: string;
  onComplete: () => void;
  options: Option;
}

