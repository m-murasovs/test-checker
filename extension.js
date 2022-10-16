const vscode = require('vscode');
const { camelCase } = require('lodash');
const { readdir } = require('fs').promises;

const { workspace, commands, window } = vscode;

// TODO: immediately set state - currently only updates on restart
// TODO: only check if there were changes in the file
// TODO: adjust performance - currently it takes a lot of work on save
// TODO: support checking multiple dirs

function stateManager(context) {
	const state = context.globalState.get('test-update-reminder') || {};
	const setState = (newState) => {
		context.globalState.update('test-update-reminder', { ...state, ...newState });
	}
	return { state, setState };
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
				window.showInformationMessage(
					`Yo, the file you just edited:
					${fileGrandparentName}/${fileParentName}/${savedFileName}
					has a corresponding test file:
					${testFileName}.
					Do you need to update it?`
				);
			}
		});
	} catch (err) {
		console.error(`Cannot read folder: ${testDirPath}: is not correct. \n\n ERR`, err);
	}
}

async function setTestDirPath(window, setState) {
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

	if (testDirPath !== undefined) {
		setState({ testDirPath });
	} else {
		window.showErrorMessage('The path to your test directory is required');
	}
}

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
	console.log('Extension "test-update-reminder" is running');

	const { state, setState } = stateManager(context);

	if (!state.testDirPath) {
		setTestDirPath(window, setState);
	}

	workspace.onDidSaveTextDocument(async (event) => {
		await checkFileAgainstTestDir(event.fileName, state.testDirPath);
	})

	let manuallyCheckFileAgainstTest = commands.registerCommand(
		'test-update-reminder.checkTestDir',
		function () {
			workspace.onDidSaveTextDocument(async (event) => {
				await checkFileAgainstTestDir(event.fileName, state.testDirPath);
			})
		}
	);

	let updateTestDirName = commands.registerCommand(
		'test-update-reminder.updateTestDir',
		function () {
			setTestDirPath(window, setState);
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
