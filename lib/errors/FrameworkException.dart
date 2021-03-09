// Copyright 2021, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

class FrameworkException extends Error {
  final String message;
  final FrameworkException innerException;
  FrameworkException([this.message, this.innerException]);

  static FrameworkException wrapIfNeeded(dynamic e) {
    if (e == null) {
      return FrameworkException();
    }

    if (e is FrameworkException) {
      return e;
    }

    // if (e is Exception) {
    //   return FrameworkException(e.toString());
    // }

    if (e is Error) {
      return _ErrorAdapter(e);
    }

    return FrameworkException(e.toString());
  }
}

class _ErrorAdapter implements FrameworkException {
  final Error wrap;
  _ErrorAdapter(this.wrap);

  @override
  FrameworkException get innerException => null;

  @override
  String get message => wrap.toString();

  @override
  StackTrace get stackTrace => wrap.stackTrace;
}
