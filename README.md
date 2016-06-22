Offline
=======

Clone of Offline 0.7.18

```
### When cloning this repo
# 
# ~ add remote upstream .git/config
#
git remote add upstream git@github.com:HubSpot/offline.git
git fetch upstream
# 
# takes some time [...] 

### 
# :fetch changes from upstream
## 
git fetch upstream

# Integrate new upstream in current repo
git co master
# Before merging upstream, make sure that the last upstream/master branch commit is not a beta release (nightly build)
# If it's the case, use `git log` to check the commit and find the good hash to use for the merge.
# Use git merge #commit-hash-of-the-stable-release
git merge --ff upstream/master
git push origin master

# fix merge conflicts, commit your changes... master needs to be packed
# example: current version was 0.7.18, upstream has been updated to 0.8.0
grunt upstream:pack:0.8.0

> kronos-offline 0.8.0+0 is created, this is your initial release of upstream

# so upstream 0.8.0 has a bug and you want to fix it
# - checkout master and commit your fix
# - generate a patch and submit upstream 
# - repack 
grunt upstream:repack 

> kronos-offline 0.8.0+1 is created, this is your fixed release of upstream, available to release envs. 

# ready to migrate this version to stable
grunt upstream:stable 

> kronos-offline 0.8.0+1 is built and now available to stable environments.

``` 
