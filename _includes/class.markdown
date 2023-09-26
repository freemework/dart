# {{ include.data.name }} class

## Constructors

## Properties

{% assign properties = include.data.properties %}
{% for property in properties %}
- __{{ property.name }}__ - {{ property.description }}

    ```csharp
    public {% if property.abstract == true %}abstract{% endif %} {% include native_type_resolver.markdown type=property.type targetLang='csharp' %} {{ property.name }} {% if property.get == true %}{get;}{% endif %} {% if property.set == true %}{set;}{% endif %}
    ```

    ```dart
    {% include native_type_resolver.markdown type=property.type targetLang='dart' %} {% if property.get == true %}get{% endif %} {% if property.set == true %}set{% endif %} {{ property.name }};
    ```

    ```python
    TBD
    ```

    ```typescript
    public {% if property.abstract == true %}abstract{% endif %} {% if property.get == true %}get{% endif %} {% if property.set == true %}set{% endif %} {{ property.name }}: {% include native_type_resolver.markdown type=property.type targetLang='typescript' %};
    ```

{% endfor %}

## Methods

{% assign methods = include.data.methods %}
{% for method in methods %}
- __{{ method.name }}__ - _{{ method.description }}_

    {% assign positionalArgs = method.positionalArgs %}

    ```csharp
    public {% if method.abstract == true %}abstract{% endif %}{{ method.return.type }}{% if method.return.nullable %}?{% endif %} {{ method.name }}(string uriString)
    ```

    ```dart
    factory {{ method.return.type }}{% if method.return.nullable %}?{% endif %} {{ method.name }}(string uriString)
    ```

    ```python
    @classmethod
    def {{ method.name }}(cls, {% for positionalArg in positionalArgs%} {{ positionalArg.name }} {% if positionalArg.name == "ex"%}?{% endif %}: {% include native_type_resolver.markdown type=positionalArg.type targetLang='python' %}{% endfor %}){% if method.return == false %}None{% else %}->{% endif %}{% if method.return.nullable %}Optional[{{ method.return.type }}]{% else %}{{ method.return.type }}{% endif %}
    ```

    ```typescript
    public {% if method.abstract == true %}abstract{% endif %} {{ method.name }}({% for positionalArg in positionalArgs %}{{positionalArg.name }}{% if positionalArg.name == "ex" %}?{% endif %}: {{ positionalArg.type}}{% unless forloop.last %}, {% endunless %}{% endfor %}): {{ method.return.type }}{% if method.return.nullable %} | null{% endif %}
    ```

{% endfor %}
## Static Methods

{% assign staticMethods = include.data.staticMethods %}
{% for static_method in staticMethods %}
- __{{ static_method.name }}__ - _{{ static_method.description }}_

    {% assign positionalArgs = static_method.positionalArgs%}

    ```csharp
    public static {{ static_method.return.type }}{% if static_method.return.nullable %}?{% endif %} {{ static_method.name }} ({% for positionalArg in positionalArgs%}{{
    positionalArg.name }}: {% include native_type_resolver.markdown type=positionalArg.type targetLang='csharp'%}{% endfor %})
    ```

    ```dart
    factory {{ static_method.return.type }}{% if static_method.return.nullable %}?{% endif %} {{ static_method.name }} ({% for positionalArg in positionalArgs%}{{
    positionalArg.name }}: {% include native_type_resolver.markdown type=positionalArg.type targetLang='dart'%}{% endfor %})
    ```

    ```python
    @classmethod
    def {{ static_method.name }}(cls, {% for positionalArg in positionalArgs%}{{ positionalArg.name }}{% if positionalArg.name == "ex" %}?{% endif %}: {% include native_type_resolver.markdown type=positionalArg.type targetLang='python' %}{% endfor %}) {% if method.return == false %}None{% else %}->{% endif %} {% if static_method.return.nullable %}Optional[{{ static_method.return.type }}]{% else %}{{ static_method.return.type }}{% endif %}
    ```

    ```typescript
    public static {{ static_method.name }}({% for positionalArg in positionalArgs%}{{
    positionalArg.name }} {% if positionalArg.name == "ex" %}?{% endif %}: {% include native_type_resolver.markdown type=positionalArg.type targetLang='typescript' %}{% endfor %}): {% include native_type_resolver.markdown type=static_method.return.type targetLang='typescript' %} {% if static_method.return.nullable %} | null{% endif %}
    ```
{% endfor %}
