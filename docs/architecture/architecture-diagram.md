# Architecture Diagram

This diagram shows the current runtime architecture of the dashboard.

```
GitHub API
     │
     │
 GitHubClient
     │
     │
  Repository
     │
     │
  Dashboard
```

## Components

### GitHubClient

Centralizes communication with the GitHub API and implements caching to reduce the number of API calls performed by the dashboard.

Responsibilities:

- interact with the GitHub REST API
- retrieve repository commits
- handle pagination when needed
- cache API responses for a short time window

This component prevents API logic from being duplicated across the system.

---

### Repository

Represents a GitHub repository analyzed by the dashboard.

The Repository abstraction encapsulates the notion of a repository inside the system and provides a clear interface for retrieving repository-related information.

Responsibilities:

- represent repository identity
- provide normalized repository names
- act as the domain model used by the dashboard

---

### Dashboard

The dashboard is responsible for aggregating repository metrics and rendering them in the user interface.

Responsibilities:

- iterate through configured repositories
- request activity information from `GitHubClient`
- compute metrics (last commit date, commits in last 7 days, etc.)
- render tables and summary statistics

The dashboard intentionally contains minimal API logic. All GitHub communication is delegated to `GitHubClient`.