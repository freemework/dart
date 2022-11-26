// Copyright 2023, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

import "../execution_context/f_execution_context.dart" show FExecutionContext;

import "f_sql_data.dart" show FSqlData;
import "f_sql_statement_param.dart" show FSqlStatementParam;

abstract class FSqlResultRecord {
  FSqlData getByIndex(int index);
  FSqlData getByName(String name);

  const FSqlResultRecord._(); // disallow extends (allow implements only)
}

abstract class FSqlStatement {
  ///
  /// Execute query and ignore any output
  ///
  Future<void> execute(
    FExecutionContext executionContext, [
    List<FSqlStatementParam>? values,
  ]);

  Future<List<FSqlResultRecord>> executeQuery(
    FExecutionContext executionContext, [
    List<FSqlStatementParam>? values,
  ]);

  Future<List<List<FSqlResultRecord>>> executeQueryMultiSets(
    FExecutionContext executionContext, [
    List<FSqlStatementParam>? values,
  ]);

  Future<FSqlData> executeScalar(
    FExecutionContext executionContext, [
    List<FSqlStatementParam>? values,
  ]);

  Future<FSqlData?> executeScalarOrNull(
    FExecutionContext executionContext, [
    List<FSqlStatementParam>? values,
  ]);

  ///
  /// Execute query with expectation of single line result
  ///
  Future<FSqlResultRecord> executeSingle(
    FExecutionContext executionContext, [
    List<FSqlStatementParam>? values,
  ]);

  ///
  /// Execute query with expectation of single line result or no any record
  ///
  Future<FSqlResultRecord?> executeSingleOrNull(
    FExecutionContext executionContext, [
    List<FSqlStatementParam>? values,
  ]);

  FSqlStatement._(); // disallow extends (allow implements only)
}
