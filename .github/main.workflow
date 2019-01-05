workflow "Build and deploy" {
  on = "push"
  resolves = ["Publish package"]
}

action "Install" {
  uses = "actions/npm@e7aaefe"
  args = "install"
}

action "Run tests" {
  uses = "actions/npm@e7aaefe"
  needs = ["Install"]
  args = "test"
}

action "Run lint" {
  uses = "actions/npm@e7aaefe"
  needs = ["Run tests"]
  args = "run lint"
}

action "Run coverage tests" {
  uses = "actions/npm@e7aaefe"
  needs = ["Run lint"]
  args = "run coverage"
}

action "Send coverage report" {
  uses = "actions/npm@e7aaefe"
  needs = ["Run coverage tests"]
  args = "run report"
}

action "Publish package" {
  uses = "actions/npm@e7aaefe"
  needs = ["Send coverage report"]
  args = "publish --access-public"
  secrets = ["NPM_AUTH_TOKEN"]
}
