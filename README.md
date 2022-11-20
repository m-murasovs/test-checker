# Test update reminder

Checks if the file you just updated has a counterpart in the tests directory. Converts file names to camelCase and cleans them of file extensions like `.js`, `.spec.js`, etc.

On first start, you will need to enter an **absolute** path to your test directory. Just right-click the tab and select `Copy path`.

**Checks the file + parent and grandparent directories** against the test directory to make sure files like `/pages/your-mama-page/index.js` are also covered.

## Commands

You can find the commands in `package.json`.

- Check Matching Test Files - checks if the file you're currently on has a counterpart in the tests directory.

- Update Test Directory - change the directory in which to check for corresponding files.

## Install manually

Save the `test-update-reminder-0.0.1.vsix` file to your desktop. Then, in your VSCode, go to Extensions, click the `...` button, and select `Install from VSIX`.

If the input box doesn't come up on its own, just run the `Update Test Directory` command and enjoy!

<img width="515" alt="install-from-vsix" src="https://user-images.githubusercontent.com/38246758/196050636-a976753c-fac2-47b6-981f-51bb90b17106.png">

![Hi, thanks, bye](https://thumbs.gfycat.com/InferiorAdmirableCommongonolek-max-1mb.gif)
