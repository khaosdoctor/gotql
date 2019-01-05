workflow "Build and deploy" {
  on = "push"
  resolves = ["Publish"]
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

action "Check if is a tag" {
  uses = "actions/bin/filter@b2bea07"
  args = "tag"
}

action "Publish" {
  uses = "actions/npm@e7aaefe"
  needs = ["Check if is a tag"]
  args = "publish --access-public"
  secrets = ["NPM_AUTH_TOKEN"]
}
