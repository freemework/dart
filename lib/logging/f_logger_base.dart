// Copyright 2023, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

import "dart:collection" show UnmodifiableMapView;

import "package:meta/meta.dart";

import "../exception/f_exception.dart" show FException;
import "../exception/f_exception_argument.dart" show FExceptionArgument;
import "../execution_context/f_execution_context.dart" show FExecutionContext;

import "f_logger.dart" show FLogger, FLoggerMessageFactory;
import "f_logger_labels.dart" show FLoggerLabels;
import "f_logger_labels_execution_context.dart"
    show FLoggerLabelsExecutionContext;
import "f_logger_level.dart" show FLoggerLevel;

abstract class FLoggerBase extends FLogger {
  @override
  bool get isTraceEnabled {
    return this.isLevelEnabled(FLoggerLevel.trace);
  }

  @override
  bool get isDebugEnabled {
    return this.isLevelEnabled(FLoggerLevel.debug);
  }

  @override
  bool get isInfoEnabled {
    return this.isLevelEnabled(FLoggerLevel.info);
  }

  @override
  bool get isWarnEnabled {
    return this.isLevelEnabled(FLoggerLevel.warn);
  }

  @override
  bool get isErrorEnabled {
    return this.isLevelEnabled(FLoggerLevel.error);
  }

  @override
  bool get isFatalEnabled {
    return this.isLevelEnabled(FLoggerLevel.fatal);
  }

  @override
  String? get name {
    return this._name;
  }

  @override
  void trace(
    dynamic labelsOrExecutionContext,
    dynamic messageOrMessageFactory, [
    FException? ex,
  ]) {
    if (!this.isTraceEnabled) {
      return;
    }
    final FLoggerLabels loggerLabels =
        FLoggerBase._resolveLoggerLabels(labelsOrExecutionContext);
    final String message = FLoggerBase._resolveMessage(messageOrMessageFactory);
    this.log(FLoggerLevel.trace, loggerLabels, message, ex);
  }

  @override
  void debug(
    dynamic labelsOrExecutionContext,
    dynamic messageOrMessageFactory, [
    FException? ex,
  ]) {
    if (!this.isDebugEnabled) {
      return;
    }
    final FLoggerLabels loggerLabels =
        FLoggerBase._resolveLoggerLabels(labelsOrExecutionContext);
    final String message = FLoggerBase._resolveMessage(messageOrMessageFactory);
    this.log(FLoggerLevel.debug, loggerLabels, message, ex);
  }

  @override
  void info(
    dynamic labelsOrExecutionContext,
    dynamic messageOrMessageFactory,
  ) {
    if (!this.isInfoEnabled) {
      return;
    }
    final FLoggerLabels loggerLabels =
        FLoggerBase._resolveLoggerLabels(labelsOrExecutionContext);
    final String message = FLoggerBase._resolveMessage(messageOrMessageFactory);
    this.log(FLoggerLevel.info, loggerLabels, message);
  }

  @override
  void warn(
    dynamic labelsOrExecutionContext,
    dynamic messageOrMessageFactory,
  ) {
    if (!this.isWarnEnabled) {
      return;
    }
    final FLoggerLabels loggerLabels =
        FLoggerBase._resolveLoggerLabels(labelsOrExecutionContext);
    final String message = FLoggerBase._resolveMessage(messageOrMessageFactory);
    this.log(FLoggerLevel.warn, loggerLabels, message);
  }

  @override
  void error(
    dynamic labelsOrExecutionContext,
    dynamic messageOrMessageFactory,
  ) {
    if (!this.isErrorEnabled) {
      return;
    }
    final FLoggerLabels loggerLabels =
        FLoggerBase._resolveLoggerLabels(labelsOrExecutionContext);
    final String message = FLoggerBase._resolveMessage(messageOrMessageFactory);
    this.log(FLoggerLevel.error, loggerLabels, message);
  }

  @override
  void fatal(
    dynamic labelsOrExecutionContext,
    dynamic messageOrMessageFactory,
  ) {
    if (!this.isFatalEnabled) {
      return;
    }
    final FLoggerLabels loggerLabels =
        FLoggerBase._resolveLoggerLabels(labelsOrExecutionContext);
    final String message = FLoggerBase._resolveMessage(messageOrMessageFactory);
    this.log(FLoggerLevel.fatal, loggerLabels, message);
  }

  @protected
  bool isLevelEnabled(FLoggerLevel level);

  ///
  /// Override this method to implement custom logger
  ///
  @protected
  void log(
    FLoggerLevel level,
    FLoggerLabels labels,
    String message, [
    FException? exception,
  ]);

  @protected
  FLoggerBase(String? loggerName) : this._name = loggerName;

  final String? _name;

  ///
  /// There two overloads
  /// ```dart
  /// FLoggerLabels _resolveLoggerLabels(FExecutionContext executionContext);
  /// FLoggerLabels _resolveLoggerLabels(FLoggerLabels labels);
  /// ```
  ///
  static FLoggerLabels _resolveLoggerLabels(
    dynamic labelsOrExecutionContext,
  ) {
    if (labelsOrExecutionContext == null) {
      return FLoggerBase._emptyLabels;
    } else if (labelsOrExecutionContext is FExecutionContext) {
      final executionElement =
          FLoggerLabelsExecutionContext.of(labelsOrExecutionContext);
      if (executionElement != null) {
        return UnmodifiableMapView<String, String>(
          {...executionElement.loggerLabels},
        );
      } else {
        // No any logger properties on excecution context chain
        return FLoggerBase._emptyLabels;
      }
    } else if (labelsOrExecutionContext is FLoggerLabels) {
      return labelsOrExecutionContext;
    } else {
      throw FExceptionArgument(
        "Unexpected overloading. Unsupported type '${labelsOrExecutionContext.runtimeType}'",
        "labelsOrExecutionContext",
      );
    }
  }

  ///
  /// There two overloads
  /// ```dart
  /// String _resolveMessage(String message) => message;
  /// String _resolveMessage(FLoggerMessageFactory messageFactory) => messageFactory()
  /// ```
  ///
  static String _resolveMessage(dynamic messageOrMessageFactory) {
    if (messageOrMessageFactory is String) {
      return messageOrMessageFactory;
    } else if (messageOrMessageFactory is FLoggerMessageFactory) {
      return messageOrMessageFactory();
    } else {
      throw FExceptionArgument(
        "Unexpected overloading. Unsupported type '${messageOrMessageFactory.runtimeType}'. Expected String or FLoggerMessageFactory.",
        "messageOrMessageFactory",
      );
    }
  }

  static final UnmodifiableMapView<String, String> _emptyLabels =
      UnmodifiableMapView({});
}
