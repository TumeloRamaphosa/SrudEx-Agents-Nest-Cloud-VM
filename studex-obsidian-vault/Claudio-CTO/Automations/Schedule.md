# Automation Schedule

The executable source remains `/Users/tumeloramaphosa/skunk-works/cron/`.
This note documents intent and status; it is not executable.

| Frequency   | Job                      | Purpose                      | Audit status                                       |
| ----------- | ------------------------ | ---------------------------- | -------------------------------------------------- |
| 15 minutes  | Hermes heartbeat         | Gateway/channel/model health | Active; local Qwen calls frequently time out       |
| 20 minutes  | Activity logger          | Capture agent activity       | Active                                             |
| 30 minutes  | Agent sync               | Obsidian, Gitea, GitHub sync | Active; Gitea push failing                         |
| Hourly      | Brain/Obsidian sync      | Synchronize knowledge        | Active                                             |
| Hourly      | WhatsApp task            | Channel operation            | Active; WhatsApp reported disconnected             |
| 3 hours     | VM fleet monitor         | Remote/local machine health  | Active                                             |
| 6 hours     | Claudio status publisher | Write status report here     | Defined in source crontab; not installed yet       |
| 6 hours     | Obsidian push            | Push agent work to vault     | Defined in source; script currently needs repair   |
| 6 hours     | Skill sync               | Distribute shared skills     | Defined in source; Bash compatibility needs repair |
| 12 hours    | Skill discovery          | Discover candidate skills    | Active                                             |
| Daily 03:00 | Backup all               | Backups                      | Broken: target script is missing                   |
| Weekly      | Log cleanup              | Remove old logs              | Active                                             |

## Guardrails

- A failed destination must make the overall run fail.
- Reports must distinguish `healthy`, `degraded`, and `unknown`.
- No job may copy secrets or `.env` files into Obsidian, Drive, or Git.
- Model-based health summaries should run only after deterministic checks succeed.
- Overlapping jobs require locks to prevent concurrent copies and Git commits.
