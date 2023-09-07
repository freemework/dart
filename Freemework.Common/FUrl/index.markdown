---
layout: default
title: FUrl
description: "TBD"
parent: Freemework.Common
---

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

## Example URIs ([wiki](https://en.wikipedia.org/wiki/Uniform_Resource_Identifier#Example_URIs))

```text
          userinfo       host      port
          ┌──┴───┐ ┌──────┴──────┐ ┌┴┐
  https://john.doe@www.example.com:123/forum/questions/?tag=networking&order=newest#top
  └─┬─┘   └─────────────┬────────────┘└───────┬───────┘ └────────────┬────────────┘ └┬┘
  scheme          authority                  path                  query           fragment

  ldap://[2001:db8::7]/c=GB?objectClass?one
  └┬─┘   └─────┬─────┘└─┬─┘ └──────┬──────┘
  scheme   authority   path      query

  mailto:John.Doe@example.com
  └─┬──┘ └────┬─────────────┘
  scheme     path

  news:comp.infosystems.www.servers.unix
  └┬─┘ └─────────────┬─────────────────┘
  scheme            path

  tel:+1-816-555-1212
  └┬┘ └──────┬──────┘
  scheme    path

  telnet://192.0.2.16:80/
  └─┬──┘   └─────┬─────┘│
  scheme     authority  path

  urn:oasis:names:specification:docbook:dtd:xml:4.1.2
  └┬┘ └──────────────────────┬──────────────────────┘
  scheme                    path
```


{% assign classData = site.data.spec.FreemeworkCommon.FUrl %}
{% include class.markdown data=classData %}

## References

- [RFC-3986](https://datatracker.ietf.org/doc/html/rfc3986)
- [RFC-2396](https://datatracker.ietf.org/doc/html/rfc2396)
- [RFC-2045](https://datatracker.ietf.org/doc/html/rfc2045)
