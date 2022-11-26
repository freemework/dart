// Copyright 2023, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

import "../execution_context/f_execution_context.dart" show FExecutionContext;
import "../lifecycle/f_disposable.dart" show FDisposable;

import "f_sql_statement.dart" show FSqlStatement;
import "f_sql_temporary_table.dart" show FSqlTemporaryTable;

abstract class FSqlConnection implements FDisposable {
  FSqlStatement statement(String sql);

  Future<FSqlTemporaryTable> createTempTable(
    FExecutionContext executionContext,
    String tableName,
    String columnsDefinitions,
  );

  FSqlConnection._(); // disallow extends (allow implements only)
}
