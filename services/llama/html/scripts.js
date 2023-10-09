(() => {
	const webSocketProtpcol = location.protocol === "https:" ? "wss:" : "ws:";
	const webSocketHostname = location.hostname;
	const port = ["80", "443"].includes(location.port) ? "" : `:${location.port}`;
	const url = `${webSocketProtpcol}//${webSocketHostname}${port}`;
	let websocket = null;
	const form = document.querySelector("form");
	const input = document.querySelector("#input");
	const chat = document.querySelector("#chat");
	const button = document.querySelector("button");
	async function insertContent(content, className = "user") {
		const role = document.createElement("span");
		role.appendChild(document.createTextNode(className));
		const text = document.createTextNode(content.trim());
		const div = document.createElement("div");
		const { clientHeight } = chat;
		div.setAttribute("class", className);
		div.appendChild(role);
		div.appendChild(text);
		chat.appendChild(div);
		// Scroll to bottom
		const chatChildrenCumulativeHeight = Array.from(chat.children).reduce(
			(acc, child) => acc + child.clientHeight,
			0,
		);
		chat.style.paddingTop =
			chatChildrenCumulativeHeight > clientHeight
				? 0
				: clientHeight - chatChildrenCumulativeHeight + "px";
		chat.scrollTop = chat.scrollHeight;
	}
	function disable() {
		button.setAttribute("disabled", "");
		input.setAttribute("disabled", "");
	}
	function enable() {
		button.removeAttribute("disabled");
		input.removeAttribute("disabled");
	}
	function focus(empty) {
		input.focus();
	}
	initWebsocket();
	function initWebsocket() {
		if (websocket) {
			return;
		}
		websocket = new WebSocket(url);
		websocket.addEventListener("message", (event) => {
			const { message } = JSON.parse(event.data);
			insertContent(message, "server");
			enable();
			focus();
		});
		websocket.addEventListener("open", (event) => {
			websocket.accept?.();
			enable();
			focus();
		});
		websocket.addEventListener("close", (event) => {
			disable();
		});
	}
	form.addEventListener("submit", (event) => {
		event.preventDefault();
		disable();
		const message = input.value.trim();
		if (message.toLowerCase() === "close") {
			websocket?.close(1000, "normal closure");
			insertContent("Connection closed", "system");
			return;
		}
		insertContent(message, "user");
		input.value = "";
		websocket?.send(JSON.stringify({ message }));
	});
	const visibilityChangeReaction = {
		hidden() {
			disable();
			websocket?.close(1000, "normal closure");
			websocket = null;
		},
		visible() {
			initWebsocket();
		},
	};

	document.addEventListener("visibilitychange", (event) =>
		visibilityChangeReaction[document.visibilityState]?.(),
	);
})();
