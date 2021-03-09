// Copyright 2021, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

import 'ExecutionContext.dart' show ExecutionContext;

abstract class Logger {
  bool get isTraceEnabled;
  bool get isDebugEnabled;
  bool get isInfoEnabled;
  bool get isWarnEnabled;
  bool get isErrorEnabled;
  bool get isFatalEnabled;

  void trace(ExecutionContext executionContext, String message, [List<dynamic> args]);
  void debug(ExecutionContext executionContext, String message, [List<dynamic> args]);
  void info(ExecutionContext executionContext, String message, [List<dynamic> args]);
  void warn(ExecutionContext executionContext, String message, [List<dynamic> args]);
  void error(ExecutionContext executionContext, String message, [List<dynamic> args]);
  void fatal(ExecutionContext executionContext, String message, [List<dynamic> args]);

  ///
  /// Get sub-logger that belong to this logger
  ///
  /// @param name Sub-logger name
  Logger getSubLogger(String name);
}
