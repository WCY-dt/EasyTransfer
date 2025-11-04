# Branch Protection Setup Guide

This document explains how to configure branch protection rules for the EasyTransfer repository to ensure code quality by requiring checks to pass before merging.

## Configuration Steps

### Option 1: Manual Configuration via GitHub UI

1. Go to your repository on GitHub
2. Navigate to **Settings** > **Branches**
3. Click **Add branch protection rule**
4. Configure the following settings:
   - **Branch name pattern**: `main`
   - ✅ **Require status checks to pass before merging**
   - ✅ **Require branches to be up to date before merging**
   - Under "Status checks that are required":
     - Select `lint-and-format` (from the Check Lint and Format workflow)
   - ⚠️ **Do not** enable "Require conversation resolution before merging" if you want to allow merging without resolving all comments
   - ⚠️ **Do not** enable "Require linear history" if you use merge commits
5. Click **Create** or **Save changes**

### Option 2: Using GitHub Settings App (Probot)

If you have the [GitHub Settings App](https://github.com/apps/settings) or [Probot Settings](https://github.com/probot/settings) installed:

1. The `.github/settings.yml` file in this repository already contains the configuration
2. The app will automatically apply the settings when you merge changes to the `main` branch
3. The settings file is located at: `.github/settings.yml`

### Option 3: Using GitHub API or CLI

You can also configure branch protection using the GitHub API or CLI:

```bash
# Using GitHub CLI (gh)
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  --field required_status_checks[strict]=true \
  --field required_status_checks[contexts][]=lint-and-format \
  --field enforce_admins=false \
  --field restrictions=null
```

## Verification

After setting up branch protection:

1. Try creating a pull request
2. The "Check Lint and Format" workflow should run automatically
3. If the check fails, you will not be able to merge the PR
4. Once the check passes, the merge button will become available

## Troubleshooting

### Status Check Not Appearing

If the `lint-and-format` status check doesn't appear in the list:
1. Make sure the workflow has run at least once on a PR to the `main` branch
2. The status check name must exactly match the job name in `.github/workflows/check.yml`
3. Refresh the branch protection settings page

### Merge Button Still Available Despite Failed Checks

If you can still merge despite failed checks:
1. Verify that "Require status checks to pass before merging" is checked
2. Confirm that `lint-and-format` is listed under required status checks
3. Check if you have admin privileges that bypass branch protection (you may need to enable "Include administrators")

## Related Files

- Workflow configuration: `.github/workflows/check.yml`
- Settings template: `.github/settings.yml`
- This guide: `.github/BRANCH_PROTECTION.md`
