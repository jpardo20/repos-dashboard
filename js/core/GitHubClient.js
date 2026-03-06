class GitHubClient {

    constructor(token) {
        this.token = token;
    }

    async fetchRepoCommits(fullRepo) {

        const res = await fetch(
            "https://api.github.com/repos/" + fullRepo + "/commits",
            {
                headers: {
                    "Authorization": "Bearer " + this.token
                }
            }
        );

        return await res.json();
    }

    async fetchCommitsSince(fullRepo, sinceISO) {

        let page = 1;
        const all = [];

        while (page <= 3) {

            const url =
                "https://api.github.com/repos/" +
                fullRepo +
                "/commits?since=" +
                encodeURIComponent(sinceISO) +
                "&per_page=100&page=" +
                page;

            const res = await fetch(url, {
                headers: {
                    "Authorization": "Bearer " + this.token
                }
            });

            const data = await res.json();

            if (!Array.isArray(data) || data.length === 0) {
                break;
            }

            all.push(...data);

            if (data.length < 100) {
                break;
            }

            page++;

        }

        return all;

    }

}