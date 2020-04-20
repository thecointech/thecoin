import React from 'react';
import { Form } from 'semantic-ui-react';
import { toHuman, toCoin } from '@the-coin/utilities';

type OnChangeCallback = (value: number) => void;
type Props = {
	onChange: OnChangeCallback,
	fxRate: number,
	value: number|null,
	asCoin?: boolean, 	// Whether to store the value as currency or coin?
	maxValue?: number
}

const initialState = {
	value: null as (number | null)
};

type State = Readonly<typeof initialState>;

function roundPlaces(value: number|null, places?: number) {
	if (value === null) return null;
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
	getValues(val: number|null, isCoin: boolean) {
		if (val === null)
			return [null, null];
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
		if (newValue === null)
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

		let viCAD = (vCAD === null) ? "" : roundPlaces(vCAD);
		let viTHE = (vTHE === null) ? "" : roundPlaces(vTHE);
		return (
			<React.Fragment>
				<Form.Input id="xCAD" placeholder="value in CAD" label='CAD $' step="any" value={viCAD} type="number" onChange={this.onChange} />
				<Form.Input id="xTHE" placeholder="value in THE" label='THE ₡' step="any" value={viTHE} type="number" onChange={this.onChange} />
			</React.Fragment>
		)
	}
}

export { DualFxInput }
