// Copyright 2023, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

import "../exception/f_exception_argument.dart" show FExceptionArgument;

const _trace = "TRACE";
const _debug = "DEBUG";
const _info = "INFO";
const _warn = "WARN";
const _error = "ERROR";
const _fatal = "FATAL";

class FLoggerLevel {
  static const FLoggerLevel trace = FLoggerLevel._(_trace, 6);
  static const FLoggerLevel debug = FLoggerLevel._(_debug, 5);
  static const FLoggerLevel info = FLoggerLevel._(_info, 4);
  static const FLoggerLevel warn = FLoggerLevel._(_warn, 3);
  static const FLoggerLevel error = FLoggerLevel._(_error, 2);
  static const FLoggerLevel fatal = FLoggerLevel._(_fatal, 1);

  factory FLoggerLevel.parse(final String value) {
    switch (value) {
      case _trace:
        return FLoggerLevel.trace;
      case _debug:
        return FLoggerLevel.debug;
      case _info:
        return FLoggerLevel.info;
      case _warn:
        return FLoggerLevel.warn;
      case _error:
        return FLoggerLevel.error;
      case _fatal:
        return FLoggerLevel.fatal;
      default:
        throw FExceptionArgument("Cannot parse '$value' as '$FLoggerLevel'");
    }
  }

  bool operator >(FLoggerLevel other) => this._intValue > other._intValue;
  bool operator >=(FLoggerLevel other) => this._intValue >= other._intValue;
  bool operator <(FLoggerLevel other) => this._intValue < other._intValue;
  bool operator <=(FLoggerLevel other) => this._intValue <= other._intValue;

  @override
  String toString() => this._textValue;

  const FLoggerLevel._(this._textValue, this._intValue);
  final String _textValue;
  final int _intValue;
}
