class GithubApiClient {
  constructor(token, repoOwner, repoName) {
    this.token = token;
    this.repoOwner = repoOwner;
    this.repoName = repoName;
    this.baseUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/issues`;
  }

  async fetchData(url, method, data) {
    const requestConfig = {
      method: method,
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
    };

    if (method !== "GET") {
      requestConfig.body = JSON.stringify(data);
    }

    const response = await fetch(url, requestConfig);
    return await response.json();
  }

  async getOpenIssues() {
    const timestamp = new Date().getTime();
    const url = `${this.baseUrl}?_=${timestamp}`;
    return this.fetchData(url, "GET");
  }

  async getClosedIssues() {
    const timestamp = new Date().getTime();
    const closedUrl = `${this.baseUrl}?state=closed&_=${timestamp}`;
    return await this.fetchData(closedUrl, "GET");
  }

  async createIssue(title, body) {
    const data = { title, body };
    await this.fetchData(this.baseUrl, "POST", data);
  }

  async updateIssue(issueNumber, title, body) {
    const url = `${this.baseUrl}/${issueNumber}`;
    const data = { title, body };
    await this.fetchData(url, "PATCH", data);
  }

  async closeIssue(issueNumber) {
    const url = `${this.baseUrl}/${issueNumber}`;
    await this.fetchData(url, "PATCH", { state: "closed" });
  }

  async reopenIssue(issueNumber) {
    const url = `${this.baseUrl}/${issueNumber}`;
    await this.fetchData(url, "PATCH", { state: "open" });
  }
}

const token = "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";
const repoOwner = "kevinjxhnn";
const repoName = "esExercises";
const githubApiClient = new GithubApiClient(token, repoOwner, repoName);

export default githubApiClient;
