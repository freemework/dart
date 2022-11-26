// Copyright 2023, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

import "../execution_context/f_execution_context.dart"
    show FExecutionContext, FExecutionElement;

import "f_logger_labels.dart";

class FLoggerLabelsExecutionContext extends FExecutionContext {
  final FLoggerLabels _loggerLabels;

  static FLoggerLabelsExecutionElement? of(FExecutionContext executionContext) {
    final FLoggerLabelsExecutionContext? loggerCtx =
        FExecutionContext.findExecutionContext<FLoggerLabelsExecutionContext>(
            executionContext);

    if (loggerCtx == null) {
      return null;
    }

    final List<FLoggerLabelsExecutionContext> chain = [loggerCtx];
    final prevExecutionContext = loggerCtx.prevContext;
    if (prevExecutionContext != null) {
      chain.addAll(FExecutionContext.listExecutionContexts<
          FLoggerLabelsExecutionContext>(
        prevExecutionContext,
      ));
    }

    return FLoggerLabelsExecutionElement(loggerCtx, chain);
  }

  FLoggerLabels get loggerLabels {
    return this._loggerLabels;
  }

  FLoggerLabelsExecutionContext(
      FExecutionContext prevContext, FLoggerLabels? loggerLabels)
      : _loggerLabels = loggerLabels != null
            ? Map.unmodifiable(loggerLabels)
            : Map.unmodifiable(<String, String>{}),
        super(prevContext);
}

class FLoggerLabelsExecutionElement<
        TExecutionContextLogger extends FLoggerLabelsExecutionContext>
    extends FExecutionElement<TExecutionContextLogger> {
  final List<FLoggerLabelsExecutionContext> chain;

  FLoggerLabelsExecutionElement(
    TExecutionContextLogger owner,
    List<FLoggerLabelsExecutionContext> chain,
  )   : chain = List.unmodifiable(chain),
        super(owner);

  FLoggerLabels get loggerLabels {
    // using reversed to take priority for first property in chain.
    final Map<String, String> dict = this.chain.reversed.fold({}, (p, c) {
      for (MapEntry<String, String> entry in c.loggerLabels.entries) {
        if (!p.containsKey(entry.key)) {
          p[entry.key] = entry.value;
        }
      }
      return p;
    });
    return Map.unmodifiable(dict);
  }
}
