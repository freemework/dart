// Copyright 2021, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

import 'CancellationToken.dart' show CancellationToken;
import 'LoggerProperty.dart' show LoggerProperty;

abstract class ExecutionContext {
  static const ExecutionContext EMPTY =
      SimpleExecutionContext(CancellationToken.DUMMY, []);

  List<T> traceOf<T extends ExecutionContext>();

  ExecutionContext? get prevContext;
  CancellationToken get cancellationToken;
  Iterable<LoggerProperty> get loggerProperties;

  ExecutionContext WithCancellationToken(CancellationToken cancellationToken);
  ExecutionContext WithLoggerProperty(String propertyName, propertyValue);
}

class SimpleExecutionContext implements ExecutionContext {
  @override
  final CancellationToken cancellationToken;

  @override
  final Iterable<LoggerProperty> loggerProperties;

  @override
  final ExecutionContext? prevContext;

  const SimpleExecutionContext(
    this.cancellationToken,
    this.loggerProperties, [
    this.prevContext,
  ]);

  @override
  List<T> traceOf<T extends ExecutionContext>() {
    final frames = <T>[];

    final ExecutionContext _this = this;
    if (_this is T) {
      frames.add(_this);
    }

    final _trace = prevContext;
    if (_trace != null && _trace is T) {
      frames.add(_trace);
    }

    return frames;
  }

  @override
  ExecutionContext WithCancellationToken(CancellationToken cancellationToken) {
    return SimpleExecutionContext(
      cancellationToken,
      loggerProperties,
      this,
    );
  }

  @override
  ExecutionContext WithLoggerProperty(String propertyName, propertyValue) {
    final loggerProperty = LoggerProperty(
      propertyName,
      propertyValue,
    );

    Iterable<LoggerProperty> innerLoggerProperties =
        loggerProperties.toList(growable: true)..add(loggerProperty);
    return SimpleExecutionContext(
      cancellationToken,
      innerLoggerProperties.toList(growable: false),
      this,
    );
  }
}
