
import { Mailjet } from './AutoMailer.secret.json';

async function connect() {
  const mailjet = (await import('node-mailjet')).default;
  return mailjet.connect("7ae2f3b83905fca0cb618a5027409495", Mailjet)
}

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
  
  const mj = await connect();
	const response = await mj.post('send', { version: 'v3.1' }).request(options);
	
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
					Email: from,
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
    const mj = await connect();
    const response = await mj.post('send', { version: 'v3.1' }).request(options);
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
