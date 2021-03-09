// Copyright 2021, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

import 'CancellationToken.dart' show CancellationToken;
import 'LoggerProperty.dart' show LoggerProperty;

abstract class ExecutionContext {
  static const ExecutionContext EMPTY = _ExecutionContext(CancellationToken.DUMMY, []);

  CancellationToken get cancellationToken;
  Iterable<LoggerProperty> get loggerProperties;

  ExecutionContext WithCancellationToken(CancellationToken cancellationToken);
  ExecutionContext WithLoggerProperty(String propertyName, propertyValue);
}

class _ExecutionContext implements ExecutionContext {
  @override
  final CancellationToken cancellationToken;
 
  @override
  final Iterable<LoggerProperty> loggerProperties;

  const _ExecutionContext(this.cancellationToken, this.loggerProperties);

  @override
  ExecutionContext WithCancellationToken(CancellationToken cancellationToken) {
    return _ExecutionContext(cancellationToken, loggerProperties);
  }

  @override
  ExecutionContext WithLoggerProperty(String propertyName, propertyValue) {
    final loggerProperty =
        LoggerProperty(propertyName, propertyValue);

    Iterable<LoggerProperty> innerLoggerProperties =
        loggerProperties.toList(growable: true)..add(loggerProperty);
    return _ExecutionContext(cancellationToken, innerLoggerProperties);
  }
}
