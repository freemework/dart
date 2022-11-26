// Copyright 2023, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

import "dart:async" show Future, FutureOr;

import "../execution_context/f_execution_context.dart" show FExecutionContext;
import "f_disposable.dart" show FDisposable;
import "f_initable.dart" show FInitable;

typedef FusingResourceInitializer<TResource> = FutureOr<TResource> Function(
    FExecutionContext);
typedef FusingWorker<TResource, TResult> = FutureOr<TResult> Function(
    FExecutionContext, TResource);

Future<TResult> fusing<TResource extends FDisposable, TResult>(
  final FExecutionContext executionContext,
  final FusingResourceInitializer<TResource> resourceFactory,
  final FusingWorker<TResource, TResult> worker,
) {
  Future<TResult> workerExecutor(
    final FExecutionContext workerExecutorCancellactonToken,
    TResource disposableResource,
  ) async {
    if (disposableResource is FInitable) {
      await disposableResource.init(executionContext);
    }
    try {
      final workerResult =
          worker(workerExecutorCancellactonToken, disposableResource);
      if (workerResult is Future<TResult>) {
        return await workerResult;
      } else {
        return workerResult;
      }
    } finally {
      await disposableResource.dispose();
    }
  }

  Future<TResult> workerExecutorFacade(
      final FutureOr<TResource> disposableObject) {
    if (disposableObject is Future<TResource>) {
      return disposableObject.then(
        (disposableInstance) =>
            workerExecutor(executionContext, disposableInstance),
      );
    } else {
      return workerExecutor(executionContext, disposableObject);
    }
  }

  final FutureOr<TResource> resource = resourceFactory(executionContext);
  return workerExecutorFacade(resource);
}
