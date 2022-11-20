const vscode = require('vscode');
const { camelCase } = require('lodash');
const { readdir } = require('fs').promises;
const path = require('path');

const { workspace, commands, window } = vscode;

// TODO: only check if there were changes in the file
// TODO: adjust performance - currently it takes a lot of work on save
// TODO: support checking multiple dirs
// TODO?: consider adding a settings file for all the stuff.

const NO_USER_INPUT_ERROR_MESSAGE = 'The test directory path is required. Use the CMD+SHIFT+P > Set Test Directory command to set it.';

function stateManager(context) {
	const workspaceState = context.workspaceState.get('test-update-reminder') || {};
	const setWorkspaceState = (newState) => {
		context.workspaceState.update('test-update-reminder', { ...workspaceState, ...newState });
	}
	return { workspaceState, setWorkspaceState };
}

async function checkFileAgainstTestDir(savedFilePath, testDirPath) {
	const filePathParts = savedFilePath.split('/');
	const savedFileName = camelCase(filePathParts.pop().split('.').shift());
	const fileParentName = camelCase(filePathParts.at(-1));
	const fileGrandparentName = camelCase(filePathParts.at(-2));
	const testDirAbsolutePath = path.join(__dirname, testDirPath);
	console.log(savedFilePath, testDirPath, testDirAbsolutePath)
	if (savedFilePath.includes(testDirPath)) return;

	try { 
		const testDirFileNames = await readdir(path.resolve(testDirAbsolutePath));
		testDirFileNames.map((testFileName) => {
			const cleanedTestFileName = camelCase(testFileName.split('.').shift());

			if (
				cleanedTestFileName === savedFileName
				|| cleanedTestFileName === fileParentName
				|| cleanedTestFileName === fileGrandparentName
			) {
				window.showWarningMessage(
					`Yo, the file you just edited:
					|> ${fileGrandparentName}/${fileParentName}/${savedFileName} <|
					has a corresponding test file:
					|> ${testFileName} <|
					Do you need to update it?`
				);
				console.log('Matching test file found');
			} else {
				console.log('No matching test file found');
			}
		});
	} catch (err) {
		console.error(`Cannot read folder: |> ${testDirPath} <| is not correct. \n\n ERR`, err);
	}
}

async function getUserInput(window) {
	const testDirPath = await window.showInputBox({
		placeHolder: 'test/directory/path',
		prompt: 'Enter the relative path to your test directory',
		value: '',
	}).then((value) => {
		if (!value) {
			return;
		}
		return value;
	});

	return testDirPath;
}

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
	console.log('Extension "test-update-reminder" is running');

	const { workspaceState, setWorkspaceState } = stateManager(context);
	let currentState = {};

	console.log(workspace)	



	if (!workspaceState.testDirPath) {
		const userInput = await getUserInput(window);

		if (!userInput) {
			window.showErrorMessage(NO_USER_INPUT_ERROR_MESSAGE);
		}

		currentState.testDirPath = userInput;
		setWorkspaceState(currentState);
	}

	workspace.onDidSaveTextDocument(async (event) => {
		const testDirPath = currentState.testDirPath || workspaceState.testDirPath;
		await checkFileAgainstTestDir(event.fileName, testDirPath);
	})

	const manuallyCheckFileAgainstTest = commands.registerCommand(
		'test-update-reminder.checkTestDir',
		function () {
			workspace.onDidSaveTextDocument(async (event) => {
				await checkFileAgainstTestDir(event.fileName, workspaceState.testDirPath);
			})
		}
	);

	const setTestDirName = commands.registerCommand(
		'test-update-reminder.setTestDir',
		async function () {
			const userInput = await getUserInput(window);

			if (!userInput) {
				window.showErrorMessage(NO_USER_INPUT_ERROR_MESSAGE);
			}

			currentState.testDirPath = userInput;
			setWorkspaceState(currentState);
		}
	);

	const getTestDirName = commands.registerCommand(
		'test-update-reminder.getTestDir',
		function () {
			const workspaceState = context.workspaceState.get('test-update-reminder') || {};
			window.showInformationMessage(workspaceState.testDirPath || 'No test directory set');
		}
	);

	context.subscriptions.push(
		manuallyCheckFileAgainstTest,
		setTestDirName,
		getTestDirName
	);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
