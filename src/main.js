// main.js
import { app, BrowserWindow} from "electron";
import path from "path";

import { run } from "../dist/run_file.js"; // output de tsc

function createWindow(outputText) {
	const win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			contextIsolation: true
		}
	});

	win.loadURL(`data:text/html,<html><body><h1>${outputText}</h1></body></html>`);
}

app.whenReady().then(async () => {
	const output = await run("./game.çb");

	createWindow(output.value);
});