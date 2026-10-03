# How to use `GH_TOKEN` for git in this repository

This is the procedure for every `git` and `gh` operation on `vaoan/eclipse-con`:
push, fetch, pull, PR, merge and GitHub API calls. It mirrors AeleOS's
`docs/git-with-gh-token.md`. Do not copy a name, email, login or token from
memory, from `git config --global`, or from a previous session.

Authentication and commit identity both come from the PAT in `.secrets`
(`GH_TOKEN`), via GitHub's own API. The PAT is the account that owns this
repository (`vaoan`). A machine's global git identity may be a different person
and must not appear on commits here.

## Prerequisites

- The repository root as the working directory.
- `.secrets` containing `GH_TOKEN`. If it does not, run `pnpm sync:secrets`.
- `gh` on `PATH`.

Never print `GH_TOKEN`. Never commit `.secrets`.

## Load the token

At the start of every shell that will run `git` or `gh` (PowerShell):

```powershell
$env:GH_TOKEN = ((Get-Content .secrets | Where-Object { $_ -match '^GH_TOKEN=' }) -replace '^GH_TOKEN=', '').Trim()
if (-not $env:GH_TOKEN) { throw "GH_TOKEN missing from .secrets — run pnpm sync:secrets" }
$env:GITHUB_TOKEN = $env:GH_TOKEN
```

Bash equivalent:

```bash
set -a; . ./.secrets; set +a
: "${GH_TOKEN:?GH_TOKEN missing from .secrets — run pnpm sync:secrets}"
export GH_TOKEN GITHUB_TOKEN="$GH_TOKEN"
```

`gh` reads `GH_TOKEN`; some tools read `GITHUB_TOKEN`. Point both at the same
PAT so a leftover environment cannot silently pick another credential. Do not
name a repository secret `GITHUB_TOKEN`: Actions reserves that name.

## Confirm who the token is

```powershell
gh api user --jq '{login,name,email,id}'
```

The `login` is who appears as the actor on pushes and PRs. If this fails, stop.

## Set commit identity from that response

Git takes `Author` / `Committer` from `user.name` and `user.email`, not from the
PAT. Set them **locally** from the API, once per clone:

```powershell
$name  = gh api user --jq '.name // .login'
$email = gh api user --jq '.email // empty'
if (-not $email) { $email = gh api user --jq '[.id, .login] | "\(.[0])+\(.[1])@users.noreply.github.com"' }
git config --local user.name  "$name"
git config --local user.email "$email"
```

Never use `git config --global` to fix identity. Check before the first commit
of a session with `git config --local --get user.email`.

## Route `git push` through `gh`

Disable any default credential helper for GitHub URLs in this repo and use
`gh`, which honours `GH_TOKEN`:

```powershell
git config --local credential."https://github.com".helper ""
git config --local --add credential."https://github.com".helper "!gh auth git-credential"
```

For a one-off that must not touch config:

```powershell
git -c credential.helper= -c "credential.helper=!gh auth git-credential" push origin HEAD
```

## Expected result

- `gh api user --jq .login` is `vaoan`.
- `git log -1 --format='%an <%ae>'` matches `gh api user`'s name and email.
- `git push` neither prompts nor fails with "Permission … denied to <other login>".

## Troubleshooting

**`GH_TOKEN missing`.** `.secrets` is stale. Run `pnpm sync:secrets`, then
confirm the line exists without printing it:
`(Select-String -Path .secrets -Pattern '^GH_TOKEN=.').Count`.

**`Permission … denied to <login>` on push.** Git used a helper other than
`gh`. Re-run the helper config above with `GH_TOKEN` loaded. Do not
`gh auth login` as a different account.

**A commit shows an address not fetched from `/user`.** Local identity was not
set. Fix local `user.*` from `/user`; never touch the global identity.

**`workflow` scope refused when pushing `.github/workflows/`.** The PAT needs
the `workflow` scope — a token setting on GitHub.

## See also

- `scripts/sync-secrets.mjs` — rebuilds `.secrets` from repository secrets
- `.github/workflows/sync-secrets.yml` — which secrets are synced
