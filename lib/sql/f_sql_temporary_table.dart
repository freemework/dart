// Copyright 2023, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

import "../execution_context/f_execution_context.dart" show FExecutionContext;
import "../lifecycle/f_disposable.dart" show FDisposable;

import "f_sql_statement_param.dart" show FSqlStatementParam;

abstract class FSqlTemporaryTable implements FDisposable {
  Future<void> bulkInsert(
    FExecutionContext executionContext,
    List<List<FSqlStatementParam>> bulkValues,
  );

  Future<void> clear(
    FExecutionContext executionContext,
  );

  Future<void> insert(
    FExecutionContext executionContext,
    List<FSqlStatementParam> values,
  );

  FSqlTemporaryTable._(); // disallow extends (allow implements only)
}
