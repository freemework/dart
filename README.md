# Freemework

[Freemework](https://docs.freemework.org) is a general purposes framework with goal to provide cross language API. Learn API once - develop for any programming language.

## Documentation Branch

This is `docs` branch of **Freemework** multi project repository based on [orphan](https://git-scm.com/docs/git-checkout#Documentation/git-checkout.txt---orphanltnew-branchgt) branches.

The branch contains documentation sources.

## Development

### Jekyll via Docker
1. Build the site and make it available on a local server inside [Docker](https://www.docker.com/)
  ```shell
  docker run --platform linux/amd64 \
    --interactive --rm \
    --mount type=bind,source="${PWD}",target=/data \
    --publish 4000:4000 \
    theanurin/jekyll:20230906
  ```
1. Browse to http://127.0.0.1:4000

### Jekyll local
1. Install Jekyll. See https://jekyllrb.com/docs/
1. Build the site and make it available on a local server
  ```shell
  cd docs
  bundle update
  jekyll serve --host 127.0.0.1 --port 4000
  ```
1. Browse to http://127.0.0.1:4000


### Update Gemfile.lock

```shell
docker run --platform linux/amd64 \
  --interactive --tty --rm \
  --mount type=bind,source="${PWD}",target=/data \
  --entrypoint /bin/sh \
  theanurin/jekyll:20230906 \
    -c 'cd /data && bundle install'
```
