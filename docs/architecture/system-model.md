# System Model

This document describes the conceptual architecture of the **GitHub Activity Dashboard**.

The goal of the system is to keep the implementation **simple, extensible and aligned with the pedagogical model** used in the courses.

---

# Core Concepts

The system is based on five main concepts:

- **Repository**
- **GitHubClient**
- **Evidence**
- **Dashboard**
- **Configuration**

Each concept has a clear responsibility and helps maintain a clean architecture.

---

# Architecture Overview

```
            GitHubClient
                 │
                 │
            Repository
                 │
        ┌────────┼────────┐
        │        │        │
   Tutoria   Modul    Project
   Repo      Repo      Repo
        │        │        │
        └──── Evidence ───┘
                 │
              Dashboard
```

---

# Repository

Represents a GitHub repository analyzed by the dashboard.

Each repository belongs to a **pedagogical category**.

The three repository types currently supported are:

- **Tutoria repository** – used for tutorial follow-up and reflection
- **Module repository** – used for individual technical work
- **Project repository** – used for collaborative projects

Each repository type computes different metrics depending on its pedagogical goal.

Example responsibilities:

- retrieve repository activity
- interpret activity according to repository type
- compute metrics for the dashboard

---

# GitHubClient

Responsible for interacting with the **GitHub API**.

This component centralizes all API communication in one place and prevents API logic from being duplicated across the system.

Typical responsibilities include:

- retrieving commits
- retrieving pull requests
- retrieving branches
- retrieving repository activity

This separation helps keep the architecture clean and maintainable.

---

# Evidence

Represents **detectable evidence of student activity** in the repository.

The system does not attempt to infer invisible work. Instead, it relies on **observable evidence** stored in Git.

Examples of evidence include:

- existence of required files
- commits
- branches
- pull requests
- pull request reviews
- commit authors

These evidences allow the dashboard to analyze student activity and participation.

---

# Dashboard

Responsible for **presenting metrics extracted from repositories**.

Different dashboards may exist depending on repository type:

- **TutoriaDashboard**
- **ModulDashboard**
- **ProjectDashboard**

Each dashboard focuses on a small number of meaningful metrics to support pedagogical decisions.

The goal is to keep dashboards **simple and informative**, avoiding unnecessary complexity.

---

# Configuration

Repositories analyzed by the system are defined in a configuration file.

Example configuration:

```yaml
repos:

  - name: tutoria-ramos
    type: tutoria
    student: Ramos

  - name: eda-diaz
    type: modul
    student: Diaz

  - name: phoenixtech-codecrafters
    type: project
    group: CodeCrafters
```

This configuration allows the system to remain **flexible and extensible**, without requiring changes to the code when new repositories are added.

---

# Design Principles

The system follows a few simple principles:

- **Separation of responsibilities**
- **Small number of metrics per dashboard**
- **Evidence-based analysis**
- **Extensibility for new repository types**

The architecture is intentionally simple so that the project can grow gradually without becoming difficult to maintain.