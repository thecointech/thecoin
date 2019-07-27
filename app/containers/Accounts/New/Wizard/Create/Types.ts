import queryString from 'query-string';
import { Option } from '../Options/Types';

type StepOption = {
  step?: number
} & Option

export function GetOptions(qs: string) {
  const query = queryString.parse(qs);
  const optionsString = query.options as string;
  if (!optionsString) return null;
  const options = JSON.parse(optionsString);
  // TODO: Data validation!
  return options as StepOption;
}

export function BuildCreateUrl(options: Option)
{
	const urlOpt = encodeURI(JSON.stringify(options))
	return `/accounts/create?options=${urlOpt}`;
}