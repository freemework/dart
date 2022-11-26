// Copyright 2023, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

import "dart:async" show Future, FutureOr;

import "package:freemework/sql/f_sql_connection.dart" show FSqlConnection;

import "../execution_context/f_execution_context.dart" show FExecutionContext;

typedef FSqlConnectionWorker<TResult> = FutureOr<TResult> Function(
  FExecutionContext,
  FSqlConnection,
);

abstract class FSqlConnectionFactory {
  Future<FSqlConnection> create(
    FExecutionContext executionContext,
  );
  Future<T> usingProvider<T>(
    FExecutionContext executionContext,
    FSqlConnectionWorker<T> worker,
  );
  Future<T> usingProviderWithTransaction<T>(
    FExecutionContext executionContext,
    FSqlConnectionWorker<T> worker,
  );

  const FSqlConnectionFactory._(); // disallow extends (allow implements only)
}
