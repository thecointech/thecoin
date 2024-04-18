import Mailjet from "node-mailjet";
import { log } from '@thecointech/logging';

async function getClient() {
  const key = process.env.MAILJET_API_KEY;
  const secret = process.env.MAILJET_API_SECRET;
  if (!key || !secret)
    throw new Error('Cannot create MailJet without setting MAILJET_API_KEY/MAILJET_API_SECRET')
  return new Mailjet({ apiKey: key, apiSecret: secret});
}

// Mailjet seems to have forgotten the typing for it's returned codes
type MailjetResponse = {
  Messages: [ { Status: "success"|"error" } ]
}

const getSubject = (subject: string, markEnvironment: boolean) =>
  markEnvironment
    ? `${process.env.CONFIG_NAME}: ${subject}`
    : subject

export async function SendMail(subject: string, message: string, toEmail?: string, markEnvironment=true) {
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
				Subject: getSubject(subject, markEnvironment),
				TextPart: message
			},
		],
  };

  const mj = await getClient();
	const response = await mj.post('send', { version: 'v3.1' }).request<MailjetResponse>(options);

  const failed = response.body.Messages.filter(m => m.Status != "success");
	failed.forEach(m => {
    log.error(`Failed sending email: ${JSON.stringify(m)}`)
  })
	return failed.length == 0;
}

export async function SendTemplate(to: string, template: number, variables: object)
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
    const response = await mj.post('send', { version: 'v3.1' }).request<MailjetResponse>(options);
    const body = response.body;
    return body.Messages.every(m => m.Status === 'success')
  }
  catch (e: any)
  {
    // TODO: Proper logging here!
    log.error(e, "Failed sending email");
  }
  return false;
}
