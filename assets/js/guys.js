const doEverything = () => {
	const guy = document.createElement("div");
	if (guy === undefined || guy === null) return;
	guy.classList.add("guy");
	guy.innerHTML = "test test";

	const body = document.getElementById("body");
	if (body === undefined || body === null) return;

	body.appendChild(guy);
	setInterval(() => {
		console.log("Would be moving guy around.");
	}, 100);
	console.log("Didn't Escape.");
};

doEverything();
