import { Accordion, Icon } from "semantic-ui-react";
import React from 'react'
import AnimateHeight from "react-animate-height";
import styles from './index.module.css';
import { ReactNodeArray } from "prop-types";

type Props = {}
const initialState = {
	activeAccordion: -1
}

class AccordionPurchase extends React.PureComponent {

	constructor(props: Props) {
		super(props);
		this.accordionClick = this.accordionClick.bind(this);
	}

	state = initialState;

	accordionClick = (e, titleProps) => {
		const { index } = titleProps
		const { activeAccordion } = this.state
		const newIndex = activeAccordion === index ? -1 : index

		this.setState({ activeAccordion: newIndex })
	}


	render() {
		const children = this.props.children as ReactNodeArray;
		if (children == null)
			return;
		
			const { activeAccordion } = this.state;

		return (
			<Accordion
				fluid
				styled
				activeIndex={activeAccordion}
				onTitleClick={this.accordionClick}
				panels={children.map((item, index) => ({
					key: index,
					title: (
						<Accordion.Title>
							<div>
								<Icon name='dropdown' />
									{item}
								<div style={{ clear: "both" }} />
							</div>
						</Accordion.Title>
					),
					content: (AccordionContent, { key, active }) => (
						<div key={key} className={styles.PaymentMethod}>
							<AnimateHeight animateOpacity duration={300} height={active ? 'auto' : 0}>
								{item}
							</AnimateHeight>
						</div>
					)
				}))
				}
			/>
		);
	}
}


export { AccordionPurchase }