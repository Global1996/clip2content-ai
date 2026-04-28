# Push repo to GitHub (run in PowerShell from repo root or anywhere).
# Usage:
#   .\scripts\git-push-github.ps1 -RepoUrl "https://github.com/YOUR_USER/YOUR_REPO.git"
#
# Prerequisites: Git installed, repo created on GitHub (empty), HTTPS auth (credential manager or PAT).

param(
  [Parameter(Mandatory = $true)]
  [string]$RepoUrl,
  [string]$Branch = "main",
  [string]$CommitMessage = "feat: Virlo — dashboard, auth, APIs, Stripe hooks"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

Write-Host "Repo root: $Root"

git remote remove origin 2>$null

git remote add origin $RepoUrl

git add -A
git status

$changes = git status --porcelain
if ([string]::IsNullOrWhiteSpace($changes)) {
  Write-Host "Nothing to commit."
} else {
  git commit -m $CommitMessage
}

git branch -M $Branch

git push -u origin $Branch

Write-Host "Done: pushed to $RepoUrl ($Branch)"
