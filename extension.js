const vscode = require('vscode');
const { camelCase } = require('lodash');
const { readdir } = require('fs').promises;

const { workspace, commands, window } = vscode;

// TODO: only check if there were changes in the file
// TODO: adjust performance - currently it takes a lot of work on save
// TODO: support checking multiple dirs

const NO_USER_INPUT_ERROR_MESSAGE = 'The test directory path is required';

function stateManager(context) {
	const globalState = context.globalState.get('test-update-reminder') || {};
	const setGlobalState = (newState) => {
		context.globalState.update('test-update-reminder', { ...globalState, ...newState });
	}
	return { globalState, setGlobalState };
}

async function checkFileAgainstTestDir(savedFile, testDirPath) {
	const filePathParts = savedFile.split('/');
	const savedFileName = camelCase(filePathParts.pop().split('.').shift());
	const fileParentName = camelCase(filePathParts.at(-1));
	const fileGrandparentName = camelCase(filePathParts.at(-2));

	try {
		const testDirFileNames = await readdir(testDirPath);
		testDirFileNames.map((testFileName) => {
			const cleanedTestFileName = camelCase(testFileName.split('.').shift());

			if (
				cleanedTestFileName === savedFileName
				|| cleanedTestFileName === fileParentName
				|| cleanedTestFileName === fileGrandparentName
			) {
				window.showWarningMessage(
					`Yo, the file you just edited:
					<> ${fileGrandparentName}/${fileParentName}/${savedFileName} <>
					has a corresponding test file:
					<> ${testFileName} <>
					Do you need to update it?`
				);
				console.log('Matching test file found');
			} else {
				console.log('No matching test file found');
			}
		});
	} catch (err) {
		console.error(`Cannot read folder: <> ${testDirPath} <> is not correct. \n\n ERR`, err);
	}
}

async function getUserInput(window) {
	const testDirPath = await window.showInputBox({
		placeHolder: 'test/directory/path',
		prompt: 'Enter the absolute path to your test directory',
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

	const { globalState, setGlobalState } = stateManager(context);
	let currentState = {};

	console.log(workspace)	

	if (!globalState.testDirPath) {
		const userInput = await getUserInput(window);

		if (!userInput) {
			window.showErrorMessage(NO_USER_INPUT_ERROR_MESSAGE);
		}

		currentState.testDirPath = userInput;
		setGlobalState(currentState);
	}

	workspace.onDidSaveTextDocument(async (event) => {
		const testDirPath = currentState.testDirPath || globalState.testDirPath;
		await checkFileAgainstTestDir(event.fileName, testDirPath);
	})

	let manuallyCheckFileAgainstTest = commands.registerCommand(
		'test-update-reminder.checkTestDir',
		function () {
			workspace.onDidSaveTextDocument(async (event) => {
				await checkFileAgainstTestDir(event.fileName, globalState.testDirPath);
			})
		}
	);

	let updateTestDirName = commands.registerCommand(
		'test-update-reminder.updateTestDir',
		async function () {
			const userInput = await getUserInput(window);

			if (!userInput) {
				window.showErrorMessage(NO_USER_INPUT_ERROR_MESSAGE);
			}

			currentState.testDirPath = userInput;
			setGlobalState(currentState);
		}
	);

	context.subscriptions.push(
		manuallyCheckFileAgainstTest,
		updateTestDirName,
	);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
