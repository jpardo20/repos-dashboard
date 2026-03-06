class GitHubClient {

    constructor(token) {
        this.token = token;
    }

    async fetchCommits(repoFullName) {

        const response = await fetch(
            "https://api.github.com/repos/" + repoFullName + "/commits",
            {
                headers: {
                    "Authorization": "Bearer " + this.token
                }
            }
        );

        return await response.json();
    }

    async fetchCommitsSince(repoFullName, sinceISO) {

        const response = await fetch(
            "https://api.github.com/repos/" + repoFullName + "/commits?since=" + sinceISO,
            {
                headers: {
                    "Authorization": "Bearer " + this.token
                }
            }
        );

        return await response.json();
    }

}