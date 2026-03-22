type IEmailTemplate = {
	subject: string;
	html: string;
};
type TBody = {
	email: string
	name: string
	link: string
	password: string
}
export const sendEmailConfirmationTemplate = (
	body: TBody,
): IEmailTemplate => {
	const html = `
    <!DOCTYPE html>
    <html lang="en">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Collibri recover password</title>
    </head>

    <body style="font-family: 'Segoe UI', sans-serif; font-size: 13px;">

        <p>Dear ${body.name},</p>
			<p>Welcome to LMS— your all-in-one assets consolidation platform.</p>
			<p>Initial access details, you will be asked to change the password on first login.</p>
			<ul>
				<li>Username: ${body.email}</li>
				<li>Password: ${body.password}</li>
				<li>Link to platform: ${body.link}</li>
			</ul>
			<p>For any support, feel free to contact LMS admin directly.</p>
			<p>We are confident that our platform will be a valuable asset to you.</p>
			<p>Thank you for your trust!</p>
			<p>Sincerely,</p>
			<p>LMS</p>
    </body>

    </html>`

	const mail = {
		subject: 'Welcome to lms !',
		html,
	}

	return mail
}
