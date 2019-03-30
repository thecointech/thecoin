import * as React from 'react';
//import styles from './index.module.css'
import { Label, Container, Icon } from 'semantic-ui-react';

class UploadAccount extends React.PureComponent {

	render() {
		return (
			<Container>
				<Label> htmlFor="file-input">
						<Icon size='massive' name='cloud upload' />
				</Label>
				<span>Drag and drop your .json file or click here</span>
				<input id="file-input" type="file" />
			</Container>
		);
	}
}

export { UploadAccount }
