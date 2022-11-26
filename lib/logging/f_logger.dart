// Copyright 2023, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

import "../exception/f_exception.dart" show FException;
import "../exception/f_exception_invalid_operation.dart"
    show FExceptionInvalidOperation;

import "f_logger_console.dart"
    show FLoggerConsole; // Yes, here cyclic dependencies
import "f_logger_level.dart" show FLoggerLevel;

typedef FLoggerFactory = FLogger Function(String? loggerName);

typedef FLoggerMessageFactory = String Function();

abstract class FLogger {
  static FLoggerFactory? _loggerFactory;
  static FLoggerFactory get _safeLoggerFactory {
    if (FLogger._loggerFactory == null) {
      print(
        "Logging subsystem used before call FLogger.setLoggerFactory(). Use FLoggerConsole as default logger. Please, consider to call FLogger.setLoggerFactory() at bootstrap phase.",
      );
      FLogger._loggerFactory =
          (loggerName) => FLoggerConsole.create(loggerName, FLoggerLevel.trace);
    }
    return FLogger._loggerFactory!;
  }

  static void setLoggerFactory(FLoggerFactory factory) {
    if (FLogger._loggerFactory != null) {
      throw FExceptionInvalidOperation(
        "Cannot redefine logger factory by call setLoggerFactory(). Logger factory already set.",
      );
    }
    FLogger._loggerFactory = factory;
  }

  ///
  /// Factory constructor
  ///
  factory FLogger.create(String? loggerName) {
    return FLogger._safeLoggerFactory(loggerName);
  }

  const FLogger();

  bool get isTraceEnabled;
  bool get isDebugEnabled;
  bool get isInfoEnabled;
  bool get isWarnEnabled;
  bool get isErrorEnabled;
  bool get isFatalEnabled;

  String? get name;

  ///
  /// There several overloads
  /// ```dart
  /// void trace(FExecutionContext executionContext, String message, [FException? ex]);
  /// void trace(FExecutionContext executionContext, FLoggerMessageFactory messageFactory, [FException? ex]);
  /// void trace(FLoggerLabels labels, String message, [FException? ex]);
  /// void trace(FLoggerLabels labels, FLoggerMessageFactory messageFactory, [FException? ex]);
  /// ```
  ///
  void trace(
    dynamic labelsOrExecutionContext,
    dynamic messageOrMessageFactory, [
    FException? ex,
  ]);

  ///
  /// There two overloads
  /// ```
  /// void debug(FExecutionContext executionContext, String message, [FException? ex]);
  /// void debug(FExecutionContext executionContext, FLoggerMessageFactory messageFactory, [FException? ex]);
  /// void debug(FLoggerLabels labels String message, [FException? ex]);
  /// void debug(FLoggerLabels labels FLoggerMessageFactory messageFactory, [FException? ex]);
  /// ```
  ///
  void debug(
    dynamic labelsOrExecutionContext,
    dynamic messageOrMessageFactory, [
    FException? ex,
  ]);

  void info(
    dynamic labelsOrExecutionContext,
    dynamic messageOrMessageFactory,
  );

  void warn(
    dynamic labelsOrExecutionContext,
    dynamic messageOrMessageFactory,
  );

  void error(
    dynamic labelsOrExecutionContext,
    dynamic messageOrMessageFactory,
  );

  void fatal(
    dynamic labelsOrExecutionContext,
    dynamic messageOrMessageFactory,
  );
}
