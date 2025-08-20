# Contribution Guide

We welcome any form of contribution from the community to help make AIGNE DocSmith better. Whether you've found a bug, have a feature suggestion, or want to contribute code directly, your participation is vital to us.

You can contribute to the project in the following ways:

- **Submit an Issue:** If you find any bugs or have any suggestions for improvements, please feel free to submit an issue.
- **Submit a Pull Request:** We highly welcome you to directly fix issues or implement new features by submitting a pull request.

## Local Development and Debugging

If you plan to contribute code, you may need to run and test it in your local environment. For ease of development and debugging, you can use `npx` to execute commands from your local codebase, which bypasses the globally installed version of the AIGNE CLI.

Here are some example commands for local development:

**Initialize Configuration**
```shell
npx --no doc-smith run --entry-agent init
```

**Generate Documentation**
```shell
npx --no doc-smith run --entry-agent generate
```

**Update Documentation**
```shell
npx --no doc-smith run --entry-agent update
```

**Retranslate Documentation**
```shell
npx --no doc-smith run --entry-agent retranslate
```

**Publish Documentation**
```shell
npx --no doc-smith run --entry-agent publish
```

Using these commands ensures that you are testing the code changes you have made locally, rather than the published version.