import "package:meta/meta.dart";

import "../exception/f_exception.dart" show FException;

import "f_logger_base.dart" show FLoggerBase;
import "f_logger_labels.dart" show FLoggerLabels;
import "f_logger_level.dart" show FLoggerLevel;

class FLoggerDummy extends FLoggerBase {
  static FLoggerDummy? _instance;

  ///
  /// Factory constructor
  ///
  factory FLoggerDummy.create(String? loggerName) {
    // Lazy singleton

    // ignore: prefer_conditional_assignment
    if (FLoggerDummy._instance == null) {
      FLoggerDummy._instance = FLoggerDummy._();
    }

    return FLoggerDummy._instance!;
  }

  @protected
  @override
  bool isLevelEnabled(FLoggerLevel level) {
    return false;
  }

  @protected
  @override
  void log(
    FLoggerLevel level,
    FLoggerLabels labels,
    String message, [
    FException? exception,
  ]) {}

  FLoggerDummy._() : super(null);
}
