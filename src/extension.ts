import * as vscode from 'vscode';
import { WebSocketServer } from 'ws';

const port = 42121;

let logger: vscode.LogOutputChannel;

let wss: WebSocketServer;

enum MessageType {
	MessageOutput = 0,
	MessageInformation = 1,
	MessageWarning = 2,
	MessageError = 3
}

// Declare client data on ws type to store data
declare module "ws" {
	interface WebSocket {
		clientData: { displayName: string, name: string };
	}
}

export function activate(context: vscode.ExtensionContext) {
	logger = vscode.window.createOutputChannel("ROBLOX Connect", { log: true });
  logger.show();

	context.subscriptions.push(vscode.commands.registerCommand('robloxconnect.execute_active', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			runLuasOnConnectedClients([ editor.document.getText() ]);
		} else {
			vscode.window.showErrorMessage(`You don't have a file open or active.`);
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('robloxconnect.execute_files', async (...args: any[]) => {
		const mainSelectedFile = args[0];
		const allFiles = args[1];

		const luas = [];

		const mainFileContent = await vscode.workspace.fs.readFile(vscode.Uri.file(mainSelectedFile.fsPath));
		luas.push(mainFileContent.toString());

		for (const file of allFiles) {
			if (file.fsPath !== mainSelectedFile.fsPath) {
				const fileContent = await vscode.workspace.fs.readFile(vscode.Uri.file(file.fsPath));
				luas.push(fileContent.toString());
			}
		}

		runLuasOnConnectedClients(luas);
	}));

	const executeButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
	executeButton.command = 'robloxconnect.execute';
	executeButton.text = '$(debug-start) Execute Lua';
	executeButton.tooltip = 'Execute the Lua code in the current editor on ROBLOX';
	executeButton.show();

	logger.info('ROBLOX Connect extension activated');

	wss = new WebSocketServer({ port: port });

	wss.on('connection', (ws) => {
		logger.debug('WebSocket connection established');

		ws.on('message', (data) => {
			logger.debug(`Received: ${data.toString()}`);

			const json = JSON.parse(data.toString());

			if (json.type === 'connect') {
				ws.clientData = json.data;

				vscode.window.showInformationMessage(`Connected: ${json.data.displayName} (${json.data.name})`);
				logger.info(`Connected: ${json.data.displayName} (${json.data.name})`);
			}
			else if (json.type === 'log') {
				switch (json.data.type) {
					case MessageType.MessageOutput:
						logger.info(`${wss.clients.size > 1 ? `[${ws.clientData.name}] ` : ''}[ROBLOX] ${json.data.message}`);
						break;
					case MessageType.MessageInformation:
						logger.debug(`${wss.clients.size > 1 ? `[${ws.clientData.name}] ` : ''}[ROBLOX] ${json.data.message}`);
						break;
					case MessageType.MessageWarning:
						logger.warn(`${wss.clients.size > 1 ? `[${ws.clientData.name}] ` : ''}[ROBLOX] ${json.data.message}`);
						break;
					case MessageType.MessageError:
						logger.error(`${wss.clients.size > 1 ? `[${ws.clientData.name}] ` : ''}[ROBLOX] ${json.data.message}`);
						break;
				}
			}
			else if (json.type === 'detailed_error') {
				logger.error(`${wss.clients.size > 1 ? `[${ws.clientData.name}] ` : ''}[ROBLOX] ${json.data.message}`);
			}
		});

		ws.on('close', (code, reason) => {
			logger.debug(`WebSocket connection closed: ${code} - ${reason}`);

			vscode.window.showWarningMessage(`Disconnected: ${ws.clientData.displayName} (${ws.clientData.name})`);
			logger.info(`Disconnected: ${ws.clientData.displayName} (${ws.clientData.name})`);
		});
	});

	wss.on('listening', () => {
		logger.debug(`WebSocket Server listening on port ${port}`);
	});
}


export function deactivate() {
	logger.info('ROBLOX Connect extension deactivated');

	if (wss) {
		for (const client of wss.clients) client.close();
		wss.close();
	}
}

async function runLuasOnConnectedClients(luas: string[]) {
	if (wss && wss.clients.size > 0) {
		if (wss.clients.size > 1) {
			const result = await vscode.window.showQuickPick(Array.from(wss.clients).map(ws => ws.clientData.name), {
				title: 'ROBLOX Connect',
				placeHolder: 'Select clients to run on',
				canPickMany: true,
				ignoreFocusOut: true
			});

			if (result !== undefined && result.length > 0) {
				for (const client of wss.clients) {
					if (result.includes(client.clientData.name)) {
						client.send(JSON.stringify({ type: 'run_luas', data: { luas: luas } }));
					}
				}
			}
		}
		else {
			for (const client of wss.clients) {
				client.send(JSON.stringify({ type: 'run_luas', data: { luas: luas } }));
			}
		}
	}
	else {
		vscode.window.showErrorMessage(`You don't have any ROBLOX client connected.`);
	}
}
