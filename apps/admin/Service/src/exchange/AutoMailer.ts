
import { Mailjet } from './AutoMailer.secret';

async function SendMail(subject: string, message: string) {

	const options = {
		Messages: [
			{
				From: {
					Email: 'automailer@thecoin.io',
					Name: 'BrokerCAD Notifications',
				},
				To: [
					{
						Email: "stephen.taylor.dev@gmail.com",
					},
				],
				Subject: subject,
				TextPart: message
			},
		],
	};
	
	const response = await Mailjet.post('send', { version: 'v3.1' }).request(options);
	
	console.log(response.body);
	// Render the index route on success
	return response.body;
}

export { SendMail }
