# message

Send email using HTTP API

Required secrets:

- `HANDSHAKE_TOKEN`: A token to be used as authorization for the API
- `MAILEROO_API_KEY`: A token to be used with email API
- `SENDER_EMAIL`: Verified email

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
