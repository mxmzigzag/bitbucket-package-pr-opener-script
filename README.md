# Script that updates package.json in BitBucket repo and opens a pull request using BitBucket API.

To use this script you need to replace data in a few variables at the top of the file:

### PACKAGE_NAME - name of package that you want to update

### PACKAGE_VERSION - new version of the updating package

### REPO_PLUG - plug name of your bitbucket repository

### WORKSPACE - your bitbucket workspace

### BRANCH_NAME - this one is optional. The name of the newly created branch.

### ACCESS_TOKEN - the acces token of bitbucket repository

Then just type node script.js and let it run :D
