import React from 'react';
import { Form } from 'semantic-ui-react';
import { toHuman, toCoin } from '@the-coin/utilities/lib/Conversion';

type OnChangeCallback = (value: number) => void;
type Props = {
	onChange: OnChangeCallback,
	fxRate: number,
	value?: number,
	asCoin?: boolean, 	// Whether to store the value as currency or coin?
	maxValue?: number
}

const initialState = {
	value: undefined as (number | undefined)
};

type State = Readonly<typeof initialState>;

function roundPlaces(value?: number, places?: number) {
	if (!value) return undefined;
	const sf = places ? Math.pow(10, places) : 100;
	return Math.round(value * sf) / sf;
}

class DualFxInput extends React.PureComponent<Props, State, null> {
	state = initialState;

	constructor(props: Props) {
		super(props)

		this.onChange = this.onChange.bind(this);
	}

	// Returns [THE, CAD]
	getValues(val: number|undefined, isCoin: boolean) {
		if (val === undefined)
			return [undefined, undefined];
		if (!val)
			return [0, 0];
			 
		const { fxRate }= this.props;
		return (isCoin) ?
			[val, toHuman(val * fxRate)] :
			[toCoin(val / fxRate), val]
	}

	onChange(event: React.FormEvent<HTMLInputElement>) {
		const { currentTarget } = event;
		const {asCoin, maxValue} = this.props;
		let value = currentTarget.valueAsNumber;

		const valIsCoin = currentTarget.id == "xTHE";
		if (valIsCoin)
			value = toCoin(value);

		const [vTHE, vCAD] = this.getValues(value, valIsCoin);
		let newValue = asCoin ? vTHE : vCAD;
		if (newValue === undefined)
		 	return;
		if (newValue && maxValue)
			newValue = Math.min(newValue, maxValue);
		this.props.onChange(newValue);
	}

	render() {
		const { value, asCoin } = this.props;
		let [vTHE, vCAD] = this.getValues(value, !!asCoin);
		if (vTHE)
			vTHE = toHuman(vTHE);

		return (
			<React.Fragment>
				<Form.Input id="xCAD" placeholder="testing" label='CAD $' step="any" value={roundPlaces(vCAD)} type="number" onChange={this.onChange} />
				<Form.Input id="xTHE" placeholder="testing" label='THE $' step="any" value={roundPlaces(vTHE)} type="number" onChange={this.onChange} />
			</React.Fragment>
		)
	}
}

export { DualFxInput }
