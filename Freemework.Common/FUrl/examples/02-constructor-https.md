```dart
final httpsUri = FUri(
    scheme: 'https',
    host: 'docs.freemework.org',
    path: '/page/',
    queryParameters: {'search': 'blue', 'limit': '10'},
);
print(httpsUri); // https://docs.freemework.org/page/?search=blue&limit=10
```