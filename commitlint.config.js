// Conventional Commits, checked locally by the husky commit-msg hook (.husky/commit-msg).
// CI checks PR titles against the same standard rules (release-reusable.yml), because squash merges
// turn the PR title into the commit on main. Cheat sheet: docs/conventional-commits.md
const config = {
  extends: ["@commitlint/config-conventional"],
};

export default config;
