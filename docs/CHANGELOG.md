# Changelog

## v1.2

### Architecture

- Introduced `Repository` domain model
- Introduced `GitHubClient` abstraction layer
- Added in-memory caching to reduce GitHub API calls

### Improvements

- Dashboard no longer calls the GitHub API directly
- API logic centralized inside `GitHubClient`

## v1.1

### Improvements

- Aggregate commits by student email
- Ignore teacher accounts
- Ignore bot commits

## v1.0

### Initial version

- Basic repository activity dashboard
- Commit aggregation
