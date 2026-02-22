# Start Task

Skill for starting work on a new task or feature request.

## Steps

1. **Read and understand the requirements**:
   - Parse the task description or issue.
   - Identify the acceptance criteria.
   - List any ambiguities or questions before starting.

2. **Create a feature branch**:

   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/[task-description]
   ```

   - Branch naming: `feature/[short-kebab-case-description]`
   - For bug fixes: `fix/[short-kebab-case-description]`
   - For refactors: `refactor/[short-kebab-case-description]`

3. **Plan the implementation approach**:
   - Identify which Clean Architecture layers are involved.
   - Determine if a new feature module is needed or if changes fit in an existing one.
   - List the files that need to be created or modified.
   - Identify translation keys that need to be added.
   - Identify test files that need to be created or updated.

4. **Identify affected files and layers**:
   - **Domain**: New types, entities, or interfaces?
   - **Application**: New hooks, use cases, or state logic?
   - **Infrastructure**: New API services or adapters?
   - **Presentation**: New components, pages, or routes?
   - **Shared**: New utilities or shared components?
   - **i18n**: New translation keys in `en.json` and `es.json`?
   - **Tests**: Which test files need to be created or updated?

## Output

After completing these steps, provide:

- A clear summary of the task.
- The branch name created.
- A numbered implementation plan with specific file paths.
- Any questions or concerns about the requirements.

## Rules

- Always start from an up-to-date `main` branch.
- Never start work on `main` directly.
- Ask clarifying questions before making assumptions.
- Keep the scope focused on the task at hand.
