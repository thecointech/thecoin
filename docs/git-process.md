Git Workflows.

We are following the git-flow method of working.

We have two main branches, dev and release.
  - `dev` is intended to be the branch shared between developers, and should always be functional with unit tests passing.  As work items are completed, they are merged into the `dev` branch.
  - The `release` branch is represents the published state of the project.  When we are ready for a release we merge the new features into this branch for final testing and publishing.
  - (not done yet, but I would like to have this) We should have CI running on both `dev` and `release`.  PR's that do not pass testing on `dev` will be automatically rejected, and code that is merged into `release` would be automatically deployed.

The main idea is that the `dev` branch is always safe: it should always represent a known-good state.  The `release` branch can be used if we need to do small/emergency fixes to released code base - it is trivial to switch to a state representing the currently running system.

## Dev Process

For any unit of work, open a new branch using the naming scheme `area/feature`.  For example, if updating the homepage on the website, the branch should be named `site/homepage`.  Try to limit cross-cutting concerns, but when necessary use the area the most applies.  For example, if working on a new feature that requires changes to both the backend service and the website, name the branch for the area most affected.

### The first commit on a branch

When beginning a development (ie, not bug-fixing) work-item, there should be one initial commit to indicate the direction of the work.  This initial commit can be thought of as the equivalent of a design doc for the code to be implemented.  It should be clear what the work is intended to achieve, where it will live, and what parts of the code base it will affect.  It should also include an indication of the appropriate unit tests.

This is not expected to be exhaustive or even necessarily correct after implementation is complete, it is only meant as way to express intentions.  It shouldn't take too long to do: 1-2 hrs is probably sufficient for small/well known work items.  If anything is uncertain, then the first commit can be submitted after research is complete, but it should always be done before work commences in earnest.

The reasoning behind it is that it enforces us to plan ahead a little, and to keep our scope small.  If it takes a long time to write down the plan for implementation, then the work-item is too large.

### Continuing Review

After the initial commit, a PR should be opened allowing for review of the work item.  The PR should describe what is being attempted in the work-item in sufficient detail that another developer could take over that work item and complete it.  Ideally the code should be descriptive enough, but comments can also be used.

The reasoning for this is that pre-review of changes gives an opportunity to save a -lot- of time.  It is much cheaper to make changes in design than after production, and this applies equally to code and to products.  Often idea's and knowledge need a bit of 'nudging' to be remembered, and the pre-review gives an opportunity for this too.

Once in development, try to keep commits frequent too.  Each commit should represent completing one specific piece of the work-item, eg unit tests.  No commit should ever take longer than one development day, and should in general be a lot shorter.  Commits do not need to compile or even complete functionality, but should match mental checkmarks of the steps we go through to complete a work item.

### Final Review

Once work is complete, The work branch should be prepared for merging back into `dev`.  This mostly involves merging the `dev` branch into the work branch, and testing to make sure there are no conflicts.  Once this is done notify the reviewers so they can completed the review with the final implementation.  This should be fairly straight-forward and minimal, as any major issues should have been caught in the preview.

Reviewers should complete review within 24 hrs.  For continuing work, create a new branch name so subsequent commits do not get added to the PR.

For minor changes - stylistic changes that don't change the way things work - requested changes can be added to the next PR.  If this is done, please indicate so on the PR either with comments, or by marking the conversation resolved.  If reviewers identify issues with the implementation, then the developer should return to the branch under PR and add a new commit to address those issues.

### Completing Work-Items

A work item is complete only once it has been merged into `dev`.  It is the responsibility of the developer to complete this step. (this implies resolving all merge conflicts and unit tests complete successfully).

### General practices

A branch should contain (as a rule of thumb) only work related to its primary mission.  If the work item is refactoring CSS, there shouldn't be new components in the PR.  If bug-fixing, then there should be minimal restructuring. It should be noted that Stephen is really terrible at this, and will require constant prompting to keep on target.

As already stated, PR's should be small.  Ideally we should complete a PR to satisfaction within 3 days.  This doesn't mean that we stop working and submit whatever we have every 3 days, it means that the pre-commit only scopes out work we can expect to complete within this time, and that we complete the work intended.  If we frequently find ourselves over-time, that information should be fed back into the planning of the next PR and used to scope it down appropriately.

Finally, much of this stuff is a big change from the way we have been working, and is intended to introduce a level of discipline to our progress.  Solo-developing on this project has led to some difficult situations, and we hope that this process will ensure that we do not run into these kind of situations in the future.  If we find this doesn't work for us, then like all things we can look into what isn't working and fix it.
