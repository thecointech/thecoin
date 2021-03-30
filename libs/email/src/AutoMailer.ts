import { Email } from "node-mailjet";
import { log } from '@thecointech/logging';

async function connect() {
  const secret = process.env.MAILJET_API_KEY;
  if (secret == null)
    throw new Error('Cannot create MailJet without setting MAILJET_API_KEY')
  const mailjet = (await import('node-mailjet')).default;
  return mailjet.connect("05f0b484b1388fd842431a1efddde228", secret)
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

  // In dev:live, don't actually send an email...
  if (process.env.NODE_ENV === 'development' && process.env.SETTINGS === 'live') {
    log.info("Emailer: I would have sent the following email:\n", message);
    return true;
  }

  const mj = await connect();
	const response = await mj.post('send', { version: 'v3.1' }).request(options);

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

  // In dev:live, don't actually send an email...
  if (process.env.NODE_ENV === 'development' && process.env.SETTINGS === 'live') {
    log.info("Emailer: I would have sent an email with the following parameters: \n", JSON.stringify(options));
    return true;
  }

  try {
    const mj = await connect();
    const response = await mj.post('send', { version: 'v3.1' }).request(options);
    const body = response.body as Email.PostResponseData;
    return body.Messages.every(m => m.Status === 'success')
  }
  catch (e)
  {
    // TODO: Proper logging here!
    log.error(e, "Failed sending email");
  }
  return false;
}

export { SendMail, SendTemplate }
