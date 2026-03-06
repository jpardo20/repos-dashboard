class GitHubClient {

    constructor(token) {
        this.token = token;
        this.cache = new Map();
        this.cacheTTL = 5 * 60 * 1000; // 5 minuts
    }

    _getCached(key) {

        const entry = this.cache.get(key);

        if (!entry) return null;

        const age = Date.now() - entry.time;

        if (age > this.cacheTTL) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    _setCache(key, data) {

        this.cache.set(key, {
            time: Date.now(),
            data: data
        });

    }

    async fetchRepoCommits(fullRepo) {

        const cacheKey = "repo:" + fullRepo;

        const cached = this._getCached(cacheKey);
        if (cached) return cached;

        const url = `https://api.github.com/repos/${fullRepo}/commits`;

        const res = await fetch(url, {
            headers: {
                "Authorization": "Bearer " + this.token
            }
        });

        const data = await res.json();

        this._setCache(cacheKey, data);

        return data;
    }

    async fetchCommitsSince(fullRepo, sinceISO) {

        const cacheKey = "since:" + fullRepo + ":" + sinceISO;

        const cached = this._getCached(cacheKey);
        if (cached) return cached;

        let page = 1;
        const all = [];

        while (page <= 3) {

            const url = `https://api.github.com/repos/${fullRepo}/commits?since=${encodeURIComponent(sinceISO)}&per_page=100&page=${page}`;

            const res = await fetch(url, {
                headers: {
                    "Authorization": "Bearer " + this.token
                }
            });

            const data = await res.json();

            if (!Array.isArray(data) || data.length === 0) break;

            all.push(...data);

            if (data.length < 100) break;

            page++;
        }

        this._setCache(cacheKey, all);

        return all;
    }

}