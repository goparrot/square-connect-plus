# Contributing

First of all, **thank you** for contributing, **you are awesome**!

Here are a few rules to follow in order to ease code reviews, and discussions before
maintainers accept and merge your work.

You MUST follow the [TypeScript](https://www.typescriptlang.org/docs/home.html) standards. If you don't know about any of them, you
should really read the recommendations.

Check your node version `node -v`.
You MUST have `">=10.13"`, because of <https://github.com/okonet/lint-staged#v10>.

You MUST run the `npm run coverage` command.

You MUST write (or update) unit tests.

You MUST run the `npm run commit` hook to add a new commit.

You SHOULD write documentation.

Please, write [commit messages that make
sense](http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html),
and [rebase your branch](http://git-scm.com/book/en/Git-Branching-Rebasing)
before submitting your Pull Request.

One may ask you to [squash your
commits](http://gitready.com/advanced/2009/02/10/squashing-commits-with-rebase.html)
too. This is used to "clean" your Pull Request before merging it (we don't want
commits such as `fix tests`, `fix 2`, `fix 3`, etc.).

Thank you!
