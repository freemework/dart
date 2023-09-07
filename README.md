# Freemework

[Freemework](https://docs.freemework.org) is a general purposes framework with goal to provide cross language API. Learn API once - develop for any programming language.


## Sources Worktree Branch Naming Convention

src-<LIBRARY>-<LANGUAGE>-<BRANCH>


## Libraries

| Library name  | Description  |
|-|-|
| common               | All langs |
| decimal_bignumberjs  | TypeScript only  |
| hosting              | All langs |
| sql_misc_migration   | All langs |
| sql_postgres         | All langs |


## Freemework Common Library

This is `workspace` branch of **Freemework Common Library** multi project repository based on [orphan](https://git-scm.com/docs/git-checkout#Documentation/git-checkout.txt---orphanltnew-branchgt) branches.

The branch contains [VSCode's workspace](https://code.visualstudio.com/docs/editor/workspaces).

| Branch                                   | Description                                                                                                          |
|------------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| [docs](../../tree/docs)                  | A command line tool to help users to use LUKS-encrypted partition image without Linux host.                          |
| [src-csharp](../../tree/src-csharp)      | Database Migration Manager based on plain SQL scripts.                                                               |
| [src-dart](../../tree/src-dart)          | Provide ability to run series of SQL scripts against various databases like MSSQL, MySQL, PostgreSQL, SQLite, etc.  |
| [src-typescript](../../tree/src-dart)    | Provide ability to run series of SQL scripts against various databases like MSSQL, MySQL, PostgreSQL, SQLite, etc.  |

## Get Started

```shell
git@github.com:freemework/freemework.git
cd freemework
./workspace-configure.sh \
    --docs \
    --branch=dev \
    --lib=common:csharp \
    --lib=common:dart \
    --lib=common:typescript \
    --lib=decimal_bignumberjs:typescript \
    --lib=hosting:typescript \
    --lib=sql_misc_migration:typescript \
    --lib=sql_postgres:typescript
code "Freemework Common.code-workspace"
```

## Notes

### Checking out orphan branch in new work-tree

```shell
NEW_BRANCH=...
git worktree add --detach "./${NEW_BRANCH}"
cd "./${NEW_BRANCH}"
git checkout --orphan "${NEW_BRANCH}-work"
git reset --hard
git commit --allow-empty -m "Initial Commit"
git push origin "${NEW_BRANCH}-work":"${NEW_BRANCH}-master"
git push origin "${NEW_BRANCH}-work":"${NEW_BRANCH}-dev"
git push origin "${NEW_BRANCH}-work":"${NEW_BRANCH}-work"
```

See at [StackOverflow](https://stackoverflow.com/questions/53005845/checking-out-orphan-branch-in-new-work-tree)


### Remove all Git worktrees

```shell
for SRC in src-*; do git worktree remove "${SRC}"; done
```
