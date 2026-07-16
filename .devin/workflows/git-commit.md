---
description: Commit staged changes to git with a descriptive message
---

# Git Commit Workflow

This workflow commits staged changes to git with a descriptive commit message.

## Steps

1. **Stage all changes** using `git add .`
   ```bash
   git add .
   ```

2. **Review staged changes** to confirm what will be committed
   ```bash
   git diff --staged
   ```

3. **Propose a commit message** - must be one line only, following conventional commit format:
   - Use imperative mood (e.g., "fix validation" not "fixed validation")
   - Be concise but descriptive
   - Examples:
     - `fix: use IsInt for delivery_radius to match Prisma Int type`
     - `refactor: remove unused BadRequestException import`
     - `chore: remove redundant try-catch in update method`

4. **Ask user for confirmation** before committing
   - Show the proposed commit message
   - Wait for user approval before proceeding

5. **Commit with the message** once user confirms
   ```bash
   git commit -m "your message here"
   ```

## Notes

- Always review staged changes before committing
- Keep commit messages focused on a single logical change
- If you have multiple unrelated changes, consider making separate commits
