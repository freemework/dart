// Copyright 2023, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

import "dart:io" show stdout, stderr;

import "package:meta/meta.dart";

import "../exception/f_exception.dart" show FException;
import "../exception/f_exception_invalid_operation.dart"
    show FExceptionInvalidOperation;

import "f_logger_base.dart" show FLoggerBase;
import "f_logger_labels.dart" show FLoggerLabels;
import "f_logger_level.dart" show FLoggerLevel;

class FLoggerConsole extends FLoggerBase {
  ///
  /// Factory constructor
  ///
  factory FLoggerConsole.create(
    String? loggerName, [
    FLoggerLevel? level,
  ]) {
    final levels = <FLoggerLevel, bool>{
      FLoggerLevel.fatal: level != null && level >= FLoggerLevel.fatal,
      FLoggerLevel.error: level != null && level >= FLoggerLevel.error,
      FLoggerLevel.warn: level != null && level >= FLoggerLevel.warn,
      FLoggerLevel.info: level != null && level >= FLoggerLevel.info,
      FLoggerLevel.debug: level != null && level >= FLoggerLevel.debug,
      FLoggerLevel.trace: level != null && level >= FLoggerLevel.trace,
    };

    return FLoggerConsole._(loggerName, Map.unmodifiable(levels));
  }

  @override
  @protected
  bool isLevelEnabled(FLoggerLevel level) {
    bool? isEnabled = this._levels[level];
    return isEnabled == true;
  }

  @override
  @protected
  void log(
    FLoggerLevel level,
    FLoggerLabels labels,
    String message, [
    FException? exception,
  ]) {
    final String name = this.name ?? "Unnamed";

    final StringBuffer logMessageBuffer = StringBuffer();
    logMessageBuffer
        .write("${DateTime.now().toUtc().toIso8601String()} $name [$level]");
    for (final entry in labels.entries) {
      logMessageBuffer.write("(${entry.key}:${entry.value})");
    }

    logMessageBuffer.write(" ");
    logMessageBuffer.writeln(message);

    if (exception != null) {
      logMessageBuffer.writeln(exception.toString());
    }

    switch (level) {
      case FLoggerLevel.trace:
      case FLoggerLevel.debug:
      case FLoggerLevel.info:
        stdout.writeln(logMessageBuffer);
        break;
      case FLoggerLevel.warn:
      case FLoggerLevel.error:
      case FLoggerLevel.fatal:
        stderr.writeln(logMessageBuffer);
        break;
      default:
        throw FExceptionInvalidOperation("Unsupported log level '$level'.");
    }
  }

  Map<FLoggerLevel, bool> _levels;
  FLoggerConsole._(String? loggerName, this._levels) : super(loggerName);
}
