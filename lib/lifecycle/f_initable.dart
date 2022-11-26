// Copyright 2023, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

import "dart:async" show Future;

import "../exception/f_exception.dart" show FException;
import "../exception/f_exception_aggregate.dart" show FExceptionAggregate;
import "../execution_context/f_execution_context.dart" show FExecutionContext;

import "f_disposable.dart" show FDisposable;

abstract class FInitable implements FDisposable {
  Future<void> init(FExecutionContext executionContext);

  static Future<void> initAll(
    FExecutionContext executionContext,
    Iterable<FInitable> instances,
  ) async {
    final List<FInitable> intializedInstances = [];
    try {
      for (final instance in instances) {
        await instance.init(executionContext);
        intializedInstances.add(instance);
      }
    } catch (initEx) {
      final List<FException> disposeExs = [];
      for (final intializedInstance in intializedInstances.reversed) {
        try {
          await intializedInstance.dispose();
        } catch (disposeEx) {
          disposeExs.add(FException.wrapIfNeeded(disposeEx));
        }
        if (disposeExs.isNotEmpty) {
          throw FExceptionAggregate([
            FException.wrapIfNeeded(initEx),
            ...disposeExs,
          ]);
        }
      }
      rethrow;
    }
  }

  // const FInitable._(); // disallow extends (allow implements only)
}
