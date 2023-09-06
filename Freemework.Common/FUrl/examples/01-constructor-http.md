---
layout: default
nav_order: 1
title: Constructor HTTP
description: "TBD"
parent: FUrl
grand_parent: Freemework.Common
---

```dart
final httpUri = FUri(
    scheme: 'http',
    host: 'docs.freemework.org',
    path: '/guides/libraries/library-tour',
    fragment: 'properties',
);
print(httpUri); // http://docs.freemework.org/guides/libraries/library-tour#properties
```