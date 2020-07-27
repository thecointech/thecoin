
import { SendMail } from './AutoMailer'

function isThisAManualTest() {
	return process.env.CI === "vscode-jest-tests";
}

test.skip("Can send an email", async () => {

	// I don't want to spam myself, so only run this test if manually requested
	if (!isThisAManualTest())
		return;

	await SendMail("This is a test mail", "You should be seeing this!")
})
