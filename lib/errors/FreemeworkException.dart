// Copyright 2021, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

class FreemeworkException extends Error {
  final String? message;
  final FreemeworkException? innerException;
  FreemeworkException([this.message, this.innerException]);

  static FreemeworkException wrapIfNeeded(dynamic e) {
    if (e == null) {
      return FreemeworkException();
    }

    if (e is FreemeworkException) {
      return e;
    }

    if (e is Error) {
      return _ErrorAdapter(e);
    }

    return FreemeworkException(e.toString());
  }

  @override
  String toString() {
    return message ?? super.toString();
  }
}

class _ErrorAdapter implements FreemeworkException {
  final Error wrap;
  _ErrorAdapter(this.wrap);

  @override
  FreemeworkException? get innerException => null;

  @override
  String get message => wrap.toString();

  @override
  StackTrace? get stackTrace => wrap.stackTrace;
}
