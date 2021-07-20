import { Email, connect } from "node-mailjet";
import { log } from '@thecointech/logging';

async function getClient() {
  const key = process.env.MAILJET_API_KEY;
  const secret = process.env.MAILJET_API_SECRET;
  if (!key || !secret)
    throw new Error('Cannot create MailJet without setting MAILJET_API_KEY/MAILJET_API_SECRET')
  return connect(key, secret)
}

async function SendMail(subject: string, message: string, toEmail?: string) {
	const options = {
		Messages: [
			{
				From: {
					Email: 'automailer@thecoin.io',
					Name: 'BrokerCAD Notifications',
				},
				To: [
					{
						Email: toEmail ?? "stephen.taylor.dev@gmail.com",
					},
				],
				Subject: subject,
				TextPart: message
			},
		],
  };

  const mj = await getClient();
	const response = await mj.post('send', { version: 'v3.1' }).request(options) as Email.PostResponse;

	// Render the index route on success
	return response.body.Messages.every(m => m.Status == "success");
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
    const mj = await getClient();
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
