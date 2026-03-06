const github = new GitHubClient(GITHUB_TOKEN);

function normalizeIdentity(commitItem) {
    const email = commitItem?.commit?.author?.email || "";
    const name = commitItem?.commit?.author?.name || "";
    const login = commitItem?.author?.login || "";

    if (email.endsWith("@users.noreply.github.com")) {
        const local = email.split("@")[0];
        const maybeUser = local.includes("+") ? local.split("+")[1] : local;
        const key = (login || maybeUser || name || email).toLowerCase();
        const label = login || maybeUser || name || "unknown";
        return { key, label, email };
    }

    if (email) {
        return { key: email.toLowerCase(), label: name || login || email, email };
    }

    if (login) {
        return { key: login.toLowerCase(), label: login, email: "" };
    }

    return { key: (name.toLowerCase() || "unknown"), label: name || "unknown", email: "" };
}

function shouldIgnore(identity, commitItem) {

    const login = (commitItem?.author?.login || "").toLowerCase();
    const email = (identity.email || "").toLowerCase();
    const label = (identity.label || "").toLowerCase();

    const ignoreLogins = Array.isArray(globalThis.IGNORE_LOGINS) ? globalThis.IGNORE_LOGINS : [];
    const ignoreEmails = Array.isArray(globalThis.IGNORE_EMAILS) ? globalThis.IGNORE_EMAILS : [];
    const ignoreLabels = Array.isArray(globalThis.IGNORE_LABELS) ? globalThis.IGNORE_LABELS : [];

    if (ignoreLogins.map(s => s.toLowerCase()).includes(login)) return true;
    if (ignoreEmails.map(s => s.toLowerCase()).includes(email)) return true;
    if (ignoreLabels.map(s => s.toLowerCase()).includes(label)) return true;

    if (email.includes("+")) {
        const userInNoReply = email.split("+")[1].split("@")[0];
        if (ignoreLogins.map(s => s.toLowerCase()).includes(userInNoReply.toLowerCase())) return true;
    }

    if (login && login.endsWith("[bot]")) return true;

    return false;
}



function aggregateCommitsByStudent(commitItems) {
    const counts = new Map();

    for (const item of commitItems) {

        const ident = normalizeIdentity(item);

        // 👇 IMPORTANT: ignorar commits no desitjats
        if (shouldIgnore(ident, item)) {
            continue;
        }

        const prev = counts.get(ident.key) || { label: ident.label, count: 0 };

        prev.count += 1;

        if (ident.label && ident.label.length > prev.label.length) {
            prev.label = ident.label;
        }

        counts.set(ident.key, prev);
    }

    const arr = Array.from(counts.values()).sort((a, b) => b.count - a.count);
    const total = arr.reduce((s, x) => s + x.count, 0);
    const topText = arr.slice(0, 3).map(x => `${x.label}: ${x.count}`).join(", ");

    return { total, topText, arr };
}


async function loadRepos() {

    if (DEBUG) {
        console.log("DEBUG config:", {
            hasToken: typeof GITHUB_TOKEN === "string" && GITHUB_TOKEN.length > 0,
            IGNORE_LOGINS: globalThis.IGNORE_LOGINS,
            IGNORE_EMAILS: globalThis.IGNORE_EMAILS
        });
    }

    const ALERT_DAYS = 2;      // groc fins a 2 dies
    

    let activeCount = 0;
    let alertCount = 0;
    let inactiveCount = 0;

    const reposFile = await fetch("data/repos.json");
    const data = await reposFile.json();

    const container = document.getElementById("content");

    const since = new Date();
    since.setDate(since.getDate() - 7);
    const sinceISO = since.toISOString();

    for (const group in data) {

        let groupActive = 0;
        let groupAlert = 0;
        let groupInactive = 0;

        const title = document.createElement("h2");
        title.textContent = group;
        container.appendChild(title);

        const table = document.createElement("table");

        const header = document.createElement("tr");
        header.innerHTML =
            "<th data-sort='repo'>Repo ▲▼</th>" +
            "<th data-sort='author'>Autor ▲▼</th>" +
            "<th data-sort='date'>Data ▲▼</th>" +
            "<th data-sort='days'>Dies ▲▼</th>" +
            "<th data-sort='commits7d'>Commits 7d ▲▼</th>" +
            "<th data-sort='message'>Missatge ▲▼</th>";

        table.appendChild(header);
        container.appendChild(table);



        for (const repoName of data[group]) {

            const repo = new Repository(repoName);
            const fullRepo = repo.getFullName();


            const commits7d = await github.fetchCommitsSince(fullRepo, sinceISO);

            const commits7dFiltered = commits7d.filter(c => {
                const ident = normalizeIdentity(c);
                return !shouldIgnore(ident, c);
            });

            const agg = aggregateCommitsByStudent(commits7dFiltered);

            if (DEBUG && commits7d.length > 0) {
                console.log("DEBUG repo:", fullRepo, "commits7d:", commits7d.length);

                // mostra 5 commits d'exemple
                commits7d.slice(0, 5).forEach((c, i) => {
                    const ident = normalizeIdentity(c);
                    const ignored = shouldIgnore(ident, c);

                    console.log(`DEBUG sample #${i + 1}`, {
                        login: c?.author?.login,
                        commitName: c?.commit?.author?.name,
                        commitEmail: c?.commit?.author?.email,
                        identKey: ident.key,
                        identLabel: ident.label,
                        ignored
                    });
                });

                // IMPORTANT: només ho fem per 1 repo
                // (si vols, comenta aquesta línia després)
            }



            const commits7dCount = agg.total;
            const commits7dTop = agg.topText || "-";

            const commits = await github.fetchRepoCommits(fullRepo);

            if (!Array.isArray(commits) || commits.length === 0) {
                continue;
            }

            const last = commits[0];

            const commitDate = new Date(last.commit.author.date);
            const today = new Date();

            const diffTime = today - commitDate;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            let activityIcon = "";
            let daysDisplay = "";
            let rowClass = "";

            if (diffDays === 0) {

                activityIcon = "🟢";
                daysDisplay = activityIcon + " " + diffDays;
                activeCount++;
                groupActive++;

            }
            else if (diffDays <= ALERT_DAYS) {

                activityIcon = "🟡";
                daysDisplay = activityIcon + " " + diffDays;
                alertCount++;
                groupAlert++;

            }
            else {

                activityIcon = "🔴";
                daysDisplay = "🚨 " + diffDays;
                rowClass = "inactive";
                inactiveCount++;
                groupInactive++;
            }

            const row = document.createElement("tr");

            if (rowClass) {
                row.classList.add(rowClass);
            }

            row.dataset.repo = repo.getFullName();
            row.dataset.author = last.commit.author.name;
            row.dataset.date = last.commit.author.date.substring(0, 10);
            row.dataset.days = diffDays;
            row.dataset.message = last.commit.message;
            row.dataset.commits7d = commits7dCount

            row.innerHTML =
                "<td><a href='https://github.com/" + fullRepo + "' target='_blank'>" + repo.getName() + "</a></td>" +
                "<td>" + last.commit.author.name + "</td>" +
                "<td>" + last.commit.author.date.substring(0, 10) + "</td>" +
                "<td>" + daysDisplay + "</td>" +
                "<td title='Top: " + commits7dTop.replaceAll("'", "") + "'>" + commits7dCount + "</td>" +
                "<td>" + last.commit.message + "</td>";

            table.appendChild(row);

        }
        const groupSummary = document.createElement("div");

        groupSummary.className = "group-summary";

        groupSummary.innerHTML =
            "<span class='summary-active'>Actius: " + groupActive + "</span> | " +
            "<span class='summary-alert'>Alerta: " + groupAlert + "</span> | " +
            "<span class='summary-inactive'>Inactius: " + groupInactive + "</span>" +
            "<hr>";

        container.appendChild(groupSummary);
    }

    const summary = document.getElementById("summary");

    summary.innerHTML =
        "<span class='summary-active'>Repos actius avui: " + activeCount + "</span> | " +
        "<span class='summary-alert'>Repos alerta: " + alertCount + "</span> | " +
        "<span class='summary-inactive'>Repos inactius: " + inactiveCount + "</span>";

    enableSorting();
}

function enableSorting() {

    const headers = document.querySelectorAll("th[data-sort]");

    headers.forEach(header => {

        let asc = true;

        header.addEventListener("click", () => {

            const table = header.closest("table");
            const rows = Array.from(table.querySelectorAll("tr")).slice(1);
            const key = header.dataset.sort;

            rows.sort((a, b) => {

                let v1 = a.dataset[key];
                let v2 = b.dataset[key];

                if (key === "days" || key === "commits7d") {
                    v1 = Number(v1);
                    v2 = Number(v2);
                }

                if (v1 < v2) return asc ? -1 : 1;
                if (v1 > v2) return asc ? 1 : -1;
                return 0;

            });

            rows.forEach(r => table.appendChild(r));

            asc = !asc;

        });

    });

}


loadRepos();


