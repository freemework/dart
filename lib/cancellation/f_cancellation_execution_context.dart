// Copyright 2023, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

import "f_cancellation_token.dart" show FCancellationToken;
import "f_cancellation_token_aggregated.dart" show FCancellationTokenAggregated;

import "../execution_context/f_execution_context.dart"
    show FExecutionContext, FExecutionElement;

class FCancellationExecutionContext extends FExecutionContext {
  final FCancellationToken _cancellationToken;

  FCancellationToken get cancellationToken {
    return this._cancellationToken;
  }

  static FCancellationExecutionElement of(FExecutionContext context) {
    final FCancellationExecutionContext cancellationExecutionContext =
        FExecutionContext.getExecutionContext<FCancellationExecutionContext>(
            context);

    return FCancellationExecutionElement(cancellationExecutionContext);
  }

  factory FCancellationExecutionContext(
    FExecutionContext prevContext,
    FCancellationToken cancellationToken, [
    bool isAggregateWithPrev = false,
  ]) {
    if (isAggregateWithPrev) {
      final FCancellationExecutionContext? prev =
          FExecutionContext.findExecutionContext<FCancellationExecutionContext>(
              prevContext);
      if (prev != null) {
        return FCancellationExecutionContext._(
          prevContext,
          FCancellationTokenAggregated(
            [cancellationToken, prev.cancellationToken],
          ),
        );
      }
    }

    return FCancellationExecutionContext._(prevContext, cancellationToken);
  }

  FCancellationExecutionContext._(
      FExecutionContext prevContext, this._cancellationToken)
      : super(prevContext);
}

class FCancellationExecutionElement<
        TFExecutionContextCancellation extends FCancellationExecutionContext>
    extends FExecutionElement<TFExecutionContextCancellation> {
  FCancellationExecutionElement(TFExecutionContextCancellation owner)
      : super(owner);

  FCancellationToken get cancellationToken {
    return this.owner.cancellationToken;
  }
}
