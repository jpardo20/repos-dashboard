async function loadRepos() {

  const reposFile = await fetch("data/repos.json");
  
  const groups = await reposFile.json();

  const container = document.getElementById("content");

  for (const group in groups) {

    const title = document.createElement("h2");
    title.innerText = group;
    container.appendChild(title);

    const table = document.createElement("table");

    table.innerHTML = `
      <tr>
        <th>Repo</th>
        <th>Autor</th>
        <th>Data</th>
        <th>Missatge</th>
      </tr>
    `;

    container.appendChild(table);

    for (const repo of groups[group]) {

      const response = await fetch(
        `https://api.github.com/repos/${repo}/commits`
      );

      const commits = await response.json();

      const last = commits[0];

      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${repo}</td>
        <td>${last.commit.author.name}</td>
        <td>${last.commit.author.date.substring(0,10)}</td>
        <td>${last.commit.message}</td>
      `;

      table.appendChild(row);
    }
  }
}

loadRepos();