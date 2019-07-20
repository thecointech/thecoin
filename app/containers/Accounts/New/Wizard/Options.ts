
import {VoiceID} from './Options/VoiceID'
import { Option, ValueLimits, Accessible } from './Options/Types';
import { OfflineBkp } from './Options/OfflineBackup';
import { Metamask } from './Options/Metamask';
import { OfflineSecureBkup } from './Options/OfflineSecureBkup';
import { Cloud } from './Options/Cloud';
import { Opera } from './Options/Opera';
import { OfflineCold } from './Options/OfflineCold';

export const StorageOptions: Option[] = [
	VoiceID,
	OfflineBkp,
	Metamask,
	Cloud,
	OfflineSecureBkup,
	Opera,
	OfflineCold,
];

export const RequiresExtn = (optn: Option) =>
  optn.stored == 'metamask' || optn.password == 'lastpass';
export const RequiresApp = (optn: Option) => optn.stored == 'opera';
const IsAccessible = (optn: Option) =>
  optn.stored == 'cloud' ||
  (optn.stored == 'offline' && optn.password == 'lastpass');
export const ValueLessThanMax = (maxValue: ValueLimits, value: ValueLimits|undefined) =>
	value === undefined ? 
		true :
		maxValue === 0 ? 
			true :
			value && value <= maxValue;

// Return the top 3 recommended (in order)
export const getRecommendations = (filter: {
  value: ValueLimits|undefined;
  installExtn: boolean;
  installAppn: boolean;
  accessible: Accessible;
}) => {
  const recommendations = StorageOptions.filter(
    op =>
      ValueLessThanMax(op.maxValue, filter.value) &&
		(!RequiresExtn(op) || filter.installExtn) &&
		(!RequiresApp(op) || filter.installAppn) &&
		(!IsAccessible(op) || filter.accessible === "true")
  );
  return recommendations;
};
