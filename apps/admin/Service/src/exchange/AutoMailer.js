
const { Mailjet } = require('./AutoMailer.secret');

exports.SendMail = (subject, message) => {
	return new Promise((resolve, reject) => {
		var options = {
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
	
		var request = Mailjet.post('send', { version: 'v3.1' }).request(options);
	
		request
			.then(function (response, body) {
				console.log(response.statusCode, body);
				// Render the index route on success
				resolve([response, body])
			})
			.catch(function (err) {
				reject(err);
			});
	})
}
