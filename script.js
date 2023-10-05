import axios from "axios";

// input parameters
const PACKAGE_NAME = "red-trial";
const PACKAGE_VERSION = "1.0.2";
const REPO_SLUG = "pr-opener";
const WORKSPACE = "mxmzigzag";
const PROJECT_KEY = "RDT";
const BRANCH_NAME = `update-package-${new Date().getTime()}`;

// bitbucket credentials (hardcoded)
const USERNAME = "max_zahorskyi";
const PASSWORD = "ATBBM7KM8z8heEnavLRNBhTRxfmb62D5E0F1";

// bitbucket API endpoint URL
const API_URL = `https://api.bitbucket.org/2.0/repositories/${WORKSPACE}/${REPO_SLUG}`;

const ACCESS_TOKEN =
  "Bearer ATCTT3xFfGN02wvifXjmkTWhGa5VdJuU2r8y-zJd1YEUG8PqIU-XSkXYUtTpfhKxCAqDaBH_Tt5UDOJp3c1qMHl741kPgtfLZMuUCAB7aMuXC35MQqMDFels1DmdTW74UPxpgGcQzudsgY_0jdhWi47NcO4oZyGWfT7GfP-98uO1Klxg2aWN9go=42A7F462";

// headers for requests
const headers = {
  "Content-Type": "application/json",
};

// auth creds
const auth = {
  username: USERNAME,
  password: PASSWORD,
};

async function start() {
  // create a branch
  try {
    // branch payload
    const branchData = {
      name: BRANCH_NAME,
      target: {
        hash: "master",
      },
    };

    console.log("creating the branch...");
    await axios.post(`${API_URL}/refs/branches`, branchData, {
      headers: {
        Authorization: ACCESS_TOKEN,
        Accept: "application/json",
      },
    });
    console.log(`${BRANCH_NAME} branch was created!`);
    await readAndUpdatePackage();
  } catch (error) {
    // TODO: Add error handling
    console.log("BRANCH ERR:", error.response.data);
  }
}

// read file and push new package to the bitbucket branch
async function readAndUpdatePackage() {
  try {
    console.log("retrieving the package file...");
    const packageResp = await axios.get(`${API_URL}/src/master/package.json`, {
      auth,
      headers,
    });
    console.log("got it!");

    // create a new package (update what we need)
    const newPackage = packageResp.data;
    newPackage.dependencies[PACKAGE_NAME] = PACKAGE_VERSION;

    console.log("updated and sending it to the branch...");
    await axios.post(
      `${API_URL}/src`,
      {
        message: `Update ${PACKAGE_NAME} to ${PACKAGE_VERSION}`,
        branch: BRANCH_NAME,
        "package.json": JSON.stringify(newPackage, null, 2),
      },
      {
        headers: {
          Authorization: ACCESS_TOKEN,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    console.log(
      `${PACKAGE_NAME} updated to ${PACKAGE_VERSION} in package.json successfully. Check the ${BRANCH_NAME} branch`
    );

    await createPullRequest();
  } catch (error) {
    // TODO: Add error handling
    console.log("GET FILE ERR:", error.response.data);
  }
}

// create a pull request
async function createPullRequest() {
  try {
    const pullRequestBody = {
      title: `Update ${PACKAGE_NAME} to ${PACKAGE_VERSION}`,
      description: "We updated this package for you!",
      source: {
        branch: BRANCH_NAME,
        repository: { full_name: `${PROJECT_KEY}/${REPO_SLUG}` },
      },
      destination: {
        branch: "master",
        repository: { full_name: `${PROJECT_KEY}/${REPO_SLUG}` },
      },
    };

    console.log("creating the PR...");
    await axios.post(
      `${API_URL}/pullrequests`,
      {
        headers: {
          Authorization: ACCESS_TOKEN,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
      pullRequestBody
    );
    console.log("Pull request created successfully.");
  } catch (error) {
    // TODO: Add error handling
    console.log("PR ERR:", error.response.data);
  }
}

// start
start();
