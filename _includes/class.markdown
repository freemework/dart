# {{ include.data.name }} class

## Constructors

## Properties

{% assign properties = include.data.properties %}
{% for property in properties %}
- __{{ property.name }}__ - {{ property.description }}

    ```csharp
    public {% include native_type_resolver.markdown type=property.type targetLang='csharp' %} {{ property.name }} {% if property.keyword %}{get;}{% endif %}
    ```

    ```dart
    {% include native_type_resolver.markdown type=property.type targetLang='dart' %} {% if property.keyword %}get{% endif %} {{ property.name }};
    ```

    ```python
    TBD
    ```

    ```typescript
    public {{ property.name }}: {% include native_type_resolver.markdown type=property.type targetLang='typescript' %};
    ```

{% endfor %}

## Methods

## Static Methods

{% assign staticMethods = include.data.staticMethods %}
{% for static_method in staticMethods %}
- __{{ static_method.name }}__ - _{{ static_method.description }}_

    ```csharp
    public static {{ static_method.return.type }}{% if static_method.return.nullable %}?{% endif %} {{ static_method.name }}(string uriString)
    ```

    ```dart
    factory {{ static_method.return.type }}{% if static_method.return.nullable %}?{% endif %} {{ static_method.name }}(string uriString)
    ```

    ```python
    @classmethod
    def {{ static_method.name }}(cls, uriString: str) -> {% if static_method.return.nullable %}Optional[{{ static_method.return.type }}]{% else %}{{ static_method.return.type }}{% endif %}
    ```

    ```typescript
    public static {{ static_method.name }}(string uriString): {{ static_method.return.type }}{% if static_method.return.nullable %} | null{% endif %}
    ```
{% endfor %}
