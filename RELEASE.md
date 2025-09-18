### Release a beta version

Create a normal PR, and release-please will automatically create a beta version PR.  
Merge that PR when appropriate.

### Release a prod version

When you want to publish a production version, you can run `git commit --allow-empty -m "chore: release x.x.x" -m "Release-As: x.x.x"` to main.  
release-please will update the PR to release to a specific version (without beta).  
Merge that PR when appropriate.
