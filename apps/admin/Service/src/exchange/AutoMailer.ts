
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

enum TemplateId {
  WelcomeConfirm = 1029944
}

async function SendTemplate(from: string, to: string, template: TemplateId, variables: object)
{
  const options = {
		Messages: [
			{
				From: {
					Email: 'newsletter@thecoin.io',
					Name: 'The Coin',
				},
				To: [
					{
						Email: to,
					},
        ],
        TemplateId: template,
        TemplateLanguage: true,
        Variables: variables
			},
		],
  };
  
  try {
    const response = await Mailjet.post('send', { version: 'v3.1' }).request(options);
    console.log(response.body);
  }
  catch (e)
  {
    console.error(e)
    return false;
  }
  return true;
}

export { SendMail, SendTemplate, TemplateId }
