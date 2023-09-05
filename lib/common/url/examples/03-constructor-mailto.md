```dart
final mailtoUri = FUri(
    scheme: 'mailto',
    path: 'John.Doe@docs.freemework.org',
    queryParameters: {'subject': 'Example'},
);
print(mailtoUri); // mailto:John.Doe@docs.freemework.org?subject=Example
```