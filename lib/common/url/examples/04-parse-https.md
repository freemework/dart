```dart
final parsedUri = Uri.parse(
    'https://docs.freemework.org/guides/libraries/library-tour#properties');
print(parsedUri); // https://docs.freemework.org
print(parsedUri.isScheme('https')); // true
print(parsedUri.origin); // https://docs.freemework.org
print(parsedUri.scheme); // https
print(parsedUri.host); // docs.freemework.org
print(parsedUri.authority); // docs.freemework.org
print(parsedUri.port); // 443
print(parsedUri.path); // guides/libraries/library-tour
print(parsedUri.pathSegments); // [guides, libraries, library-tour]
print(parsedUri.fragment); // properties
print(parsedUri.hasQuery); // false
print(parsedUri.data); // null
```