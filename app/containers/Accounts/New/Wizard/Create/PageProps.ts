import { Option } from "../Options/Types";

export type PageProps = {
  accountName: string,
  setName: (name: string) => void,
  buttonText: string,
	onComplete: () => void,
	options: Option
}

