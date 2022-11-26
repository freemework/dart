import "package:meta/meta.dart";

import "../cancellation/f_cancellation_execution_context.dart"
    show FCancellationExecutionContext;
import "../cancellation/f_cancellation_token.dart" show FCancellationToken;
import "../exception/f_exception_invalid_operation.dart"
    show FExceptionInvalidOperation;

class FExecutionContext {
  final FExecutionContext? prevContext;

  const FExecutionContext(this.prevContext);

  ///
  /// Provide empty execution context. Usually used as root of execution context chain.
  ///
  static FExecutionContext get emptyExecutionContext {
    return _EmptyExecutionContext.instance;
  }

  ///
  /// Provide default execution context.
  ///
  /// The execution context contains:
  /// * `FCancellationExecutionContext` with `FCancellationToken.Dummy`
  ///
  static FExecutionContext get defaultExecutionContext {
    return _DefaultExecutionContext.instance;
  }

  ///
  /// Obtain a closest instance of typed `FExecutionContext` that encloses
  /// the given context.
  ///
  /// Returns `null` if requested type not found
  ///
  @protected
  static T? findExecutionContext<T extends FExecutionContext>(
    final FExecutionContext context,
  ) {
    FExecutionContext? chainItem = context;
    while (chainItem != null) {
      if (chainItem is T) {
        return chainItem;
      }
      chainItem = chainItem.prevContext;
    }
    return null;
  }

  ///
  /// Obtain a closest instance of typed `FExecutionContext` that encloses
  /// the given context.
  ///
  /// Raise `FExceptionInvalidOperation` if requested type not found
  ///
  @protected
  static T getExecutionContext<T extends FExecutionContext>(
    final FExecutionContext context,
  ) {
    final T? chainItem = FExecutionContext.findExecutionContext<T>(context);

    if (chainItem != null) {
      return chainItem;
    }

    throw FExceptionInvalidOperation(
        "Execution context '$T' is not presented on the chain.");
  }

  static List<T> listExecutionContexts<T extends FExecutionContext>(
    final FExecutionContext context,
  ) {
    final List<T> result = [];

    FExecutionContext? chainItem = context;
    while (chainItem != null) {
      if (chainItem is T) {
        result.add(chainItem);
      }
      chainItem = chainItem.prevContext;
    }

    return List.unmodifiable(result);
  }
}

class FExecutionElement<TExecutionContext extends FExecutionContext> {
  final TExecutionContext _owner;

  FExecutionElement(TExecutionContext owner) : _owner = owner;

  TExecutionContext get owner {
    return this._owner;
  }
}

class _DefaultExecutionContext implements FExecutionContext {
  static _DefaultExecutionContext? _instance;
  static _DefaultExecutionContext get instance {
    // ignore: prefer_conditional_assignment
    if (_DefaultExecutionContext._instance == null) {
      _DefaultExecutionContext._instance = _DefaultExecutionContext();
    }
    return _DefaultExecutionContext._instance!;
  }

  final FExecutionContext _prevContext;

  _DefaultExecutionContext()
      : _prevContext = FCancellationExecutionContext(
          _EmptyExecutionContext.instance,
          FCancellationToken.dummy,
        );

  @override
  FExecutionContext? get prevContext {
    return this._prevContext;
  }
}

class _EmptyExecutionContext implements FExecutionContext {
  static _EmptyExecutionContext? _instance;
  static _EmptyExecutionContext get instance {
    // ignore: prefer_conditional_assignment
    if (_EmptyExecutionContext._instance == null) {
      _EmptyExecutionContext._instance = _EmptyExecutionContext();
    }
    return _EmptyExecutionContext._instance!;
  }

  @override
  FExecutionContext? get prevContext => null;
}
