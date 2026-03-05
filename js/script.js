async function loadRepos() {

    const ALERT_DAYS = 2;      // groc fins a 2 dies
    const INACTIVE_DAYS = 5;   // vermell a partir de 6 dies

    let activeCount = 0;
    let alertCount = 0;
    let inactiveCount = 0;

    const reposFile = await fetch("data/repos.json");
    const data = await reposFile.json();

    const container = document.getElementById("content");

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
            "<th data-sort='message'>Missatge ▲▼</th>";

        table.appendChild(header);
        container.appendChild(table);

        for (const repo of data[group]) {

            const fullRepo = repo;

            const response = await fetch(
                "https://api.github.com/repos/" + fullRepo + "/commits",
                {
                    headers: {
                        "Authorization": "Bearer " + GITHUB_TOKEN
                    }
                }
            );

            const commits = await response.json();

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

            row.dataset.repo = repo;
            row.dataset.author = last.commit.author.name;
            row.dataset.date = last.commit.author.date.substring(0, 10);
            row.dataset.days = diffDays;
            row.dataset.message = last.commit.message;

            row.innerHTML =
                "<td><a href='https://github.com/" + fullRepo + "' target='_blank'>" + repo + "</a></td>" +
                "<td>" + last.commit.author.name + "</td>" +
                "<td>" + last.commit.author.date.substring(0, 10) + "</td>" +
                "<td>" + daysDisplay + "</td>" +
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

                if (key === "days") {
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

                if (key === "days") {
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
