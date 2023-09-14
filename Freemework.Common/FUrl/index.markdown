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

## Language Chaos

| URI String                                             | FUri.toString()  | C# Uri.ToString() | Dart Uri.toString()  | TypeScript URL.toString() |
|--------------------------------------------------------|------------------|--------------------------------------------------------||
| ololo://username:password@example.com                  | <span style="color:green"> ololo://username:password@example.com </span> | <span style="color:red">ololo://username:password@example.com/ </span> | <span style="color:green"> ololo://username:password@example.com </span> | <span style="color:green"> ololo://username:password@example.com </span> |
| ololo://username:password@example.com:389              | <span style="color:green"> ololo://username:password@example.com:389 </span> | <span style="color:red"> ololo://username:password@example.com:389/ </span> | <span style="color:green"> ololo://username:password@example.com:389 </span>| <span style="color:green"> ololo://username:password@example.com:389 </span> |
| ldap://username:password@example.com                   | <span style="color:green"> ldap://username:password@example.com </span> | <span style="color:red"> ldap://username:password@example.com/ </span> | <span style="color:green"> ldap://username:password@example.com </span> |  <span style="color:green"> ldap://username:password@example.com </span> |
| ldap://username:password@example.com:389               | <span style="color:green"> ldap://username:password@example.com:389 </span> | <span style="color:red"> ldap://username:password@example.com/</span> | <span style="color:green"> ldap://username:password@example.com:389 </span> | <span style="color:green"> ldap://username:password@example.com:389 </span> |
| http://username:password@example.com                   | <span style="color:green"> http://username:password@example.com </span> | <span style="color:red"> http://username:password@example.com/ </span> | <span style="color:green"> http://username:password@example.com </span> | <span style="color:red"> http://username:password@example.com/ </span> |
| http://username:password@example.com:80                | <span style="color:green"> http://username:password@example.com:80 </span> | <span style="color:red"> http://username:password@example.com/ </span> | <span style="color:red"> http://username:password@example.com </span> | <span style="color:red"> http://username:password@example.com/ </span> |
| https://username:password@example.com                  | <span style="color:green"> https://username:password@example.com </span> | <span style="color:red"> https://username:password@example.com/ </span> | <span style="color:green"> https://username:password@example.com </span> | <span style="color:red"> https://username:password@example.com/ </span> |
| https://username:password@example.com:443              | <span style="color:green"> https://username:password@example.com:443 </span> | <span style="color:red"> https://username:password@example.com/ </span> | <span style="color:red"> https://username:password@example.com </span> | <span style="color:red"> https://username:password@example.com/ </span> |
| telnet://192.0.2.16                                    | <span style="color:green"> telnet://192.0.2.16 </span> | <span style="color:red"> telnet://192.0.2.16/ </span> | <span style="color:green"> telnet://192.0.2.16 </span> | <span style="color:green"> telnet://192.0.2.16 </span> |
| telnet://192.0.2.16:80                                 | <span style="color:green"> telnet://192.0.2.16:80 </span> | <span style="color:red"> telnet://192.0.2.16:80/ </span> | <span style="color:green"> telnet://192.0.2.16:80 </span> | <span style="color:green"> telnet://192.0.2.16:80 </span> |
| news:comp.infosystems.www.servers.unix                 | <span style="color:green"> news:comp.infosystems.www.servers.unix </span> | <span style="color:green"> news:comp.infosystems.www.servers.unix </span> | <span style="color:green"> news:comp.infosystems.www.servers.unix </span> | <span style="color:green"> news:comp.infosystems.www.servers.unix </span> |
| news:comp.infosystems.www.servers.unix:389             | <span style="color:green"> news:comp.infosystems.www.servers.unix:389 </span> | <span style="color:green"> news:comp.infosystems.www.servers.unix:389 </span> | <span style="color:green"> news:comp.infosystems.www.servers.unix:389 </span> | <span style="color:green"> news:comp.infosystems.www.servers.unix:389 </span> |
| mailto:John.Doe@example.com                            | <span style="color:green"> mailto:John.Doe@example.com </span> | <span style="color:green"> mailto:John.Doe@example.com </span> | <span style="color:green"> mailto:John.Doe@example.com </span> | <span style="color:green"> mailto:John.Doe@example.com </span> |
| mailto:John.Doe@example.com:25                         | <span style="color:green"> mailto:John.Doe@example.com:25 </span> | <span style="color:red"> mailto:John.Doe@example.com </span> | <span style="color:green"> mailto:John.Doe@example.com:25 </span> | <span style="color:green"> mailto:John.Doe@example.com:25 </span> |
| tel:+1-816-555-1212                                    | <span style="color:green"> tel:+1-816-555-1212 </span> | <span style="color:green"> tel:+1-816-555-1212 </span> | <span style="color:green"> tel:+1-816-555-1212 </span> | <span style="color:green"> tel:+1-816-555-1212 </span> |
| tel:+1-816-555-1212:389                                | <span style="color:green"> tel:+1-816-555-1212:389 </span> | <span style="color:green"> tel:+1-816-555-1212:389 </span> | <span style="color:green"> tel:+1-816-555-1212:389 </span> | <span style="color:green"> tel:+1-816-555-1212:389 </span> |
| urn:oasis:names:specification:docbook:dtd:xml:4.1.2    | <span style="color:green"> urn:oasis:names:specification:docbook:dtd:xml:4.1.2 </span> | <span style="color:green"> urn:oasis:names:specification:docbook:dtd:xml:4.1.2 </span> | <span style="color:green"> urn:oasis:names:specification:docbook:dtd:xml:4.1.2 </span> | <span style="color:green"> urn:oasis:names:specification:docbook:dtd:xml:4.1.2 </span> |
| urn:oasis:names:specification:docbook:dtd:xml:4.1.2:389 | <span style="color:green"> urn:oasis:names:specification:docbook:dtd:xml:4.1.2:389 </span> | <span style="color:green"> urn:oasis:names:specification:docbook:dtd:xml:4.1.2:389 </span> | <span style="color:green"> urn:oasis:names:specification:docbook:dtd:xml:4.1.2:389 </span> | <span style="color:green"> urn:oasis:names:specification:docbook:dtd:xml:4.1.2:389 </span> |
| ololo://username:password@example.com/ | <span style="color:green"> ololo://username:password@example.com/ </span> | <span style="color:green"> ololo://username:password@example.com/ </span> | <span style="color:green"> ololo://username:password@example.com/ </span> | <span style="color:green"> ololo://username:password@example.com/ </span> | 
| ololo://username:password@example.com:389/ | <span style="color:green"> ololo://username:password@example.com:389/ </span> | <span style="color:green"> ololo://username:password@example.com:389/ </span> | <span style="color:green"> ololo://username:password@example.com:389/ </span> | <span style="color:green"> ololo://username:password@example.com:389/ </span> |

{% assign classData = site.data.spec.FreemeworkCommon.FUrl %}
{% include class.markdown data=classData %}

## References

- [RFC-3986](https://datatracker.ietf.org/doc/html/rfc3986)
- [RFC-2396](https://datatracker.ietf.org/doc/html/rfc2396)
- [RFC-2045](https://datatracker.ietf.org/doc/html/rfc2045)
