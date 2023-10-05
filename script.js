import axios from "axios";

// input parameters
const PACKAGE_NAME = "red-trial";
const PACKAGE_VERSION = "1.0.2";
const REPO_SLUG = "pr-opener";
const WORKSPACE = "mxmzigzag";
const PROJECT_KEY = "RDT";
const BRANCH_NAME = "update-package";

// bitbucket credentials (hardcoded)
const USERNAME = "max_zahorskyi";
const PASSWORD = "ATBBM7KM8z8heEnavLRNBhTRxfmb62D5E0F1";

// bitbucket API endpoint URL
const API_URL = `https://api.bitbucket.org/2.0/repositories/${WORKSPACE}/${REPO_SLUG}`;

// headers for requests
const headers = {
  "Content-Type": "application/json",
};

// auth creds
const auth = {
  username: USERNAME,
  password: PASSWORD,
};

// create a branch
async function start() {
  try {
    // branch payload
    const branchData = {
      name: BRANCH_NAME,
      target: {
        hash: "master",
      },
    };

    await axios.post(`${API_URL}/refs/branches`, branchData, {
      auth,
      headers,
    });
    console.log(`${BRANCH_NAME} branch was created`);
    await readAndUpdatePackage();
  } catch (error) {
    // TODO: Add error handling
    console.log("BRANCH ERR:", error.response.data);
  }
}

// read file and push new package to the bitbucket branch
async function readAndUpdatePackage() {
  try {
    const packageResp = await axios.get(`${API_URL}/src/master/package.json`, {
      auth,
      headers,
    });

    // create a new package (update what we need)
    const newPackage = {
      ...packageResp.data,
      dependencies: {
        ...packageResp.data.dependencies,
        [PACKAGE_NAME]: PACKAGE_VERSION,
      },
    };
    console.log("Package updated");

    await axios.put(
      `${API_URL}/src/${BRANCH_NAME}/package.json`,
      {
        message: `Update ${PACKAGE_NAME} to ${PACKAGE_VERSION}`,
        branch: BRANCH_NAME,
        content: JSON.stringify(newPackage, null, 2),
      },
      { auth, headers }
    );
    console.log(
      `${PACKAGE_NAME} updated to ${PACKAGE_VERSION} in package.json successfully. Check the ${BRANCH_NAME} branch`
    );

    await createPullRequest();
  } catch (error) {
    // TODO: Add error handling
    console.log("GET FILE ERR:", error);
  }
}

// create a pull request
async function createPullRequest() {
  try {
    await axios.post(
      `${API_URL}/pullrequests`,
      {
        title: `Update ${PACKAGE_NAME} to ${PACKAGE_VERSION}`,
        source: {
          branch: BRANCH_NAME,
          repository: { full_name: `${PROJECT_KEY}/${REPO_SLUG}` },
        },
        destination: {
          branch: "master",
          repository: { full_name: `${PROJECT_KEY}/${REPO_SLUG}` },
        },
      },
      { auth, headers }
    );
    console.log("Pull request created successfully.");
  } catch (error) {
    // TODO: Add error handling
    console.log("PR ERR:", error.response.data);
  }
}

// magic
start();
