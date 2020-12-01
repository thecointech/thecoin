import { Email } from "node-mailjet";

async function connect() {
  const secret = process.env.TC_SENDGRID_API_KEY;
  if (secret == null)
    throw new Error('Cannot create MailJet without setting MAILJET_API_KEY')
  const mailjet = (await import('node-mailjet')).default;
  return mailjet.connect("7ae2f3b83905fca0cb618a5027409495", secret)
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

async function SendTemplate(to: string, template: number, variables: object)
{
  const options = {
		Messages: [
			{
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
    var body = response.body as Email.PostResponseData;
    return body.Messages.every(m => m.Status === 'success')
  }
  catch (e)
  {
    console.error(e)
  }
  return false;
}

export { SendMail, SendTemplate }
