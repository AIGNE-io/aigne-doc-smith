### Release a beta version

Create normal pr, release-please will auto create a beta version PR.  
Merge that PR when appropriate.

### Release a prod version

When you want publish a prod version, you can run `git commit --allow-empty -m "chore: release x.x.x" -m "Release-As: x.x.x"` to main.  
release-please will update PR to release to specific version (without beta).  
Merge that PR when appropriate.
