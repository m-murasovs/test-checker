# Test update reminder

Checks if the file you just updated has a counterpart in the tests directory. Converts file names to camelCase and cleans them of file extensions like `.js`, `.spec.js`, etc.

On first start, you will need to enter an **absolute** path to your test directory. Just right-click the tab and select `Copy path`.

**Checks the file + parent and grandparent directories** against the test directory to make sure files like `/pages/your-mama-page/index.js` are also covered.

## Commands

You can find the commands in `package.json`.

- Check Matching Test Files - checks if the file you're currently on has a counterpart in the tests directory.

- Update Test Directory - change the directory in which to check for corresponding files.

![Hi, thanks, bye](https://media.tenor.com/jjADcY68aA0AAAAM/waving-bear-hi.gif)
