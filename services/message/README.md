# message

Send email using Sendgrid API

Required secrets:

- `HANDSHAKE_TOKEN`: A token to be used as authorization for the API
- `SENDGRID_TOKEN`: A token to be used with Sendgrid API
- `VERIFIED_SENDGRID_EMAIL`: [Email verified with SendGrid](https://docs.sendgrid.com/ui/sending-email/sender-verification)

Usage example:

```js
fetch("https://message.website.com/", {
	method: "POST",
	headers: {
		"Content-Type": "application/json",
		Authorization: "Bearer UdFGIpWU2LrfRvCgSBA8X0zNlc0SvNy5",
	},
	body: JSON.stringify({
		recipient: "owner@website.com", // Required
		subject: "Hi there",
		from: "Someone <someone@hotmail.com>",
		message: "Just wanted to say hi",
	}),
})
	.then((response) =>
		response.ok ? showSuccess() : showError(response.statusText),
	)
	.catch((error) => {
		showError(error.message);
		logger.error(error);
	});
```
