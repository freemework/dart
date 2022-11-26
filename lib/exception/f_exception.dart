// Copyright 2023, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

class FException extends Error {
  static FException wrapIfNeeded(Object likeError, [StackTrace? stackTrace]) {
    if (likeError is FException) {
      return likeError;
    } else if (likeError is Error) {
      return FExceptionNativeErrorWrapper(likeError);
    } else if (likeError is Exception) {
      return FExceptionNativeExceptionWrapper(likeError);
    } else {
      return FExceptionNativeObjectWrapper(likeError);
    }
  }

  final FException? innerException;

  FException([String? message, this.innerException]) : _message = message;

  String get message {
    return this._message ?? "Exception of type '$runtimeType' was thrown.";
  }

  @override
  String toString() {
    final StringBuffer messageBuffer = StringBuffer();
    final StringBuffer stackTraceBuffer = StringBuffer();

    messageBuffer.write(this.runtimeType);
    messageBuffer.write(": ");
    messageBuffer.write(message);

    FException? innerException = this.innerException;
    while (innerException != null) {
      messageBuffer.write(" ---> ");

      messageBuffer.write(innerException.runtimeType);
      messageBuffer.write(": ");
      messageBuffer.write(innerException.message);

      final StackTrace? innerStackTrace = innerException.stackTrace;
      if (innerStackTrace != null) {
        stackTraceBuffer.write(innerStackTrace.toString());
      } else {
        stackTraceBuffer.writeln("No available stack trace");
      }
      stackTraceBuffer.writeln("--- End of inner exception stack trace ---");

      innerException = innerException.innerException;
    }

    final StackTrace? stackTrace = this.stackTrace;
    if (stackTrace != null) {
      stackTraceBuffer.write(stackTrace.toString());
    } else {
      stackTraceBuffer.write("No available stack trace");
    }

    messageBuffer.writeln();
    messageBuffer.write(stackTraceBuffer.toString());

    return messageBuffer.toString();
  }

  final String? _message;
}

class FExceptionNativeObjectWrapper extends FException {
  final dynamic nativeObject;

  FExceptionNativeObjectWrapper(this.nativeObject)
      : super(nativeObject.toString());
}

class FExceptionNativeErrorWrapper extends FException {
  final Error nativeError;

  FExceptionNativeErrorWrapper(this.nativeError)
      : super(nativeError.toString());

  @override
  String get message => nativeError.toString();

  @override
  StackTrace? get stackTrace => this.nativeError.stackTrace;
}

class FExceptionNativeExceptionWrapper extends FException {
  final Exception nativeException;

  FExceptionNativeExceptionWrapper(this.nativeException)
      : super(nativeException.toString());
}
