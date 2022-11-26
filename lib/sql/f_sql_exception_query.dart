// Copyright 2023, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

import "../exception/f_exception.dart" show FException;

import "f_sql_exception.dart" show FSqlException;

abstract class FSqlExceptionQuery extends FSqlException {
  final String query;
  final List<String> sqlParams;

  FSqlExceptionQuery(
    String message,
    this.query,
    List<String> sqlParams, [
    FException? innerException,
  ])  : sqlParams = List.unmodifiable(sqlParams),
        super(message, innerException);
}
