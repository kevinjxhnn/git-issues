import githubApiClient from "./githubApiClient.js";

function toggleAttributesForActive() {
  const openButton = document.querySelector(".open-button");
  openButton.setAttribute("style", "display: none;");

  const closedButton = document.querySelector(".closed-button");
  closedButton.setAttribute("style", "display: block;");

  const show = document.querySelector(".issues-container.open");
  show.setAttribute("style", "display: block;");

  const displayNone = document.querySelector(".issues-container.closed");
  displayNone.setAttribute("style", "display: none;");
}

async function showActiveIssues() {
  try {
    showLoader();
    toggleAttributesForActive();

    const issues = await githubApiClient.getOpenIssues();
    hideLoader();
    const ul = document.getElementById("list-of-issues");
    ul.innerHTML = "";

    issues.forEach((issue) => {
      getEachActiveIssueAndDisplay(issue, ul);
    });
  } catch (error) {
    hideLoader();

    await snackBarEvent(
      "Oops! There was an error in retreiving active issues.",
    );
  }
}

function getEachActiveIssueAndDisplay(issue, ul) {
  const li = document.createElement("li");
  li.setAttribute("issue-number", issue.number);

  const div = document.createElement("div");
  div.className = "issue-content";

  const h4 = document.createElement("h4");
  h4.textContent = issue.title;
  div.appendChild(h4);

  const p = document.createElement("p");
  p.textContent = issue.body;

  div.appendChild(p);

  li.appendChild(div);

  const buttonDiv = createButtonDivForActiveIssues(issue);

  li.append(buttonDiv);

  const emptyDiv = document.createElement("div");
  emptyDiv.className = "update-onclick-container";
  emptyDiv.setAttribute("div-number", issue.number);

  li.appendChild(emptyDiv);

  ul.appendChild(li);
}

function createButtonDivForActiveIssues(issue) {
  const buttonDiv = document.createElement("div");
  buttonDiv.className = "button-div";

  const update = document.createElement("button");
  const close = document.createElement("button");

  update.addEventListener("click", () => callUpdateProcess(issue.number));
  close.addEventListener("click", () => closeIssue(issue.number));

  update.value = issue.number;
  close.value = issue.number;

  update.textContent = "Update issue";
  close.textContent = "Close issue";

  buttonDiv.appendChild(update);
  buttonDiv.appendChild(close);

  return buttonDiv;
}

function toggleAttributesForClosed() {
  const displayNone = document.querySelector(".issues-container.open");
  displayNone.setAttribute("style", "display: none;");

  const closedButton = document.querySelector(".closed-button");
  closedButton.setAttribute("style", "display: none;");

  const openButton = document.querySelector(".open-button");
  openButton.setAttribute("style", "display: block;");

  const show = document.querySelector(".issues-container.closed");
  show.setAttribute("style", "display: block;");
}

async function showClosedIssues() {
  try {
    showLoader();
    const issues = await githubApiClient.getClosedIssues();
    hideLoader();
    toggleAttributesForClosed();

    const ul = document.querySelector(".closed-issues");
    ul.innerHTML = "";

    issues.forEach((issue) => {
      const li = document.createElement("li");
      li.setAttribute("closed-number", issue.number);

      const div = document.createElement("div");
      div.className = "closed-content";

      const h4 = document.createElement("h4");
      h4.textContent = issue.title;
      div.appendChild(h4);

      const p = document.createElement("p");
      p.textContent = issue.body;

      div.appendChild(p);

      const reopenButton = document.createElement("button");
      reopenButton.className = "button reopen";
      reopenButton.textContent = "Re-Open";
      reopenButton.value = issue.number;
      console.dir(reopenButton);
      reopenButton.addEventListener("click", () =>
        reopenIssue(reopenButton.value),
      );

      div.appendChild(reopenButton);

      li.appendChild(div);

      ul.appendChild(li);
    });
  } catch (error) {
    hideLoader();

    await snackBarEvent(
      "Oops! There was an error in retreiving closed issues.",
    );
  }
}

async function createIssue() {
  const issueTitleElement = document.querySelector("#issue-title");
  const issueBodyElement = document.querySelector("#issue-body");

  const title = issueTitleElement.value;
  const body = issueBodyElement.value;

  try {
    if (issueTitleElement.value.trim() == "") {
      throw new Error();
    }

    showLoader();
    // Call GitHub API to create an issue
    await githubApiClient.createIssue(title, body);

    hideLoader();

    await snackBarEvent("Success! Issue was created!");
    issueTitleElement.value = "";
    issueBodyElement.value = "";
    await showActiveIssues();
  } catch (error) {
    console.log(error.message);
    hideLoader();

    await snackBarEvent(
      "Oops! There was an error creating the issue. Please ensure the title is filled in.",
    );
  }
}

function hideContentForUpdate(issueNumber) {
  const hideContent = document.querySelector(
    `li[issue-number="${issueNumber}"] .issue-content`,
  );
  const hideFirstTwoButtons = document.querySelectorAll(
    `li[issue-number="${issueNumber}"] button`,
  );

  hideContent.setAttribute("style", "display: none;");
  hideFirstTwoButtons[0].setAttribute("style", "display: none;");
  hideFirstTwoButtons[1].setAttribute("style", "display: none;");
}

async function callUpdateProcess(value) {
  await showActiveIssues();

  const issueNumber = value;

  hideContentForUpdate(issueNumber);

  const titleContainer = createUpdateContainerForUpdateProcess(issueNumber);

  const tempDiv = document.querySelector(`div[div-number="${issueNumber}"]`);

  tempDiv.append(titleContainer);
}

function createUpdateContainerForUpdateProcess(issueNumber) {
  const placeholderTitleContent = document.querySelector(
    `li[issue-number="${issueNumber}"] .issue-content h4`,
  );
  const placeholderBodyContent = document.querySelector(
    `li[issue-number="${issueNumber}"] .issue-content p`,
  );

  const titleContainer = document.createElement("div");
  titleContainer.className = "title-container card";

  const updateTitle = document.createElement("h3");
  updateTitle.textContent = `Updating Issue`;
  titleContainer.appendChild(updateTitle);

  const updateTitleInput = document.createElement("input");
  updateTitleInput.setAttribute("class", "card-title");
  updateTitleInput.setAttribute("type", "text");
  updateTitleInput.setAttribute("value", placeholderTitleContent.textContent);

  const updateBodyInput = document.createElement("textarea");
  updateBodyInput.setAttribute("class", "card-body");
  updateBodyInput.value = placeholderBodyContent.textContent;

  titleContainer.appendChild(updateTitleInput);

  titleContainer.appendChild(updateBodyInput);

  const updateButtonDiv = createConfirmCancelButtonDiv(issueNumber);

  titleContainer.appendChild(updateButtonDiv);

  return titleContainer;
}

function createConfirmCancelButtonDiv(issueNumber) {
  const updateButtonDiv = document.createElement("div");

  const updateButtonCard = document.createElement("button");
  const cancelButtonCard = document.createElement("button");

  updateButtonCard.addEventListener("click", () => updateIssue(issueNumber));
  cancelButtonCard.addEventListener("click", () => showActiveIssues());

  updateButtonCard.value = issueNumber;

  cancelButtonCard.textContent = "Cancel";

  updateButtonCard.textContent = "Confirm";
  updateButtonDiv.appendChild(updateButtonCard);
  updateButtonDiv.appendChild(cancelButtonCard);

  return updateButtonDiv;
}

async function updateIssue(value) {
  const issueNumber = value;

  try {
    showLoader();
    const issueTitleElement = document.querySelector(".card-title");
    const issueBodyElement = document.querySelector(".card-body");

    const title = issueTitleElement.value;
    const body = issueBodyElement.value;

    if (issueTitleElement.value.trim() == "") {
      throw new Error();
    }

    await githubApiClient.updateIssue(issueNumber, title, body);

    hideLoader();

    await snackBarEvent(
      "Issue updated! Please wait for the changes to reflect!",
    );

    await showActiveIssues();
  } catch (error) {
    console.log(error.message);
    hideLoader();

    await snackBarEvent(
      "Oops! There was an error updating the issue. Please ensure the title is filled in.",
    );
  }
}

async function closeIssue(value) {
  const issueNumber = value;

  try {
    showLoader();
    await githubApiClient.closeIssue(issueNumber);

    hideLoader();

    await snackBarEvent(
      "Issue closed! Please wait for the changes to reflect!",
    );

    await showActiveIssues();
  } catch (error) {
    console.log(error.message);
    hideLoader();

    await snackBarEvent("Oops! There was an error closing the issue.");
  }
}

async function reopenIssue(value) {
  const issueNumber = value;

  try {
    showLoader();
    await githubApiClient.reopenIssue(issueNumber);

    hideLoader();

    await snackBarEvent(
      "Issue reopened! Please wait for the changes to reflect!",
    );

    await showActiveIssues();
  } catch (error) {
    console.log(error.message);
    hideLoader();

    await snackBarEvent("Oops! There was an error re-opening the issue.");
  }
}

function showLoader() {
  document.body.appendChild(loaderContainer);
}

function hideLoader() {
  loaderContainer.remove();
}

async function snackBarEvent(message) {
  let snack = document.querySelector(".snackbar");
  snack.textContent = message;
  snack.classList.add("show-snackbar");
  setTimeout(() => {
    snack.classList.remove("show-snackbar");
  }, 3000);
}

const createButton = document.querySelector(".create-issue-button");
createButton.addEventListener("click", () => createIssue());

const closedButton = document.querySelector(".closed-button");
closedButton.addEventListener("click", () => showClosedIssues());

const openButton = document.querySelector(".open-button");
openButton.addEventListener("click", () => showActiveIssues());

const loaderContainer = document.createElement("div");
loaderContainer.className = "loader-container";
loaderContainer.innerHTML = '<div class="loader"></div>';

showActiveIssues();
