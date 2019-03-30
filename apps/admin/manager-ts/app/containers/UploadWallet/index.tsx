import * as React from 'react';
//import styles from './index.module.css'
import { Label, Container, Icon } from 'semantic-ui-react';
import fs from 'fs';

interface ActionProps {
	onSelect: (file) => void;
}
class UploadWallet extends React.PureComponent<ActionProps> {

	private id: string = "upload" + Math.random();

	constructor(props) {
		super(props);
		this.onChangeFile = this.onChangeFile.bind(this);
	}

	private onChangeFile() {
		const fileButton: any = document.getElementById(this.id);
		const file = fileButton ? fileButton.files[0] : null;
		if (this.props.onSelect) {
			fs.readFile(file.path, 'utf8', (err, data) => {
				if (err) throw err;
				const obj = JSON.parse(data.trim());
				this.props.onSelect(obj);
			});
		}
	}

	render() {
		return (
			<Container >
				<Label width="4" as="label" htmlFor={this.id} size="massive">
					<Icon name="cloud upload" size='massive' />
					Upload File
				</Label>
				<input id={this.id} hidden type="file" accept=".json" onChange={this.onChangeFile} />
			</Container>
		);
	}
}

export { UploadWallet }
