// Copyright 2023, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

import "../exception/f_exception.dart" show FException;

import "f_sql_exception_query.dart" show FSqlExceptionQuery;

class FSqlExceptionSyntax extends FSqlExceptionQuery {
  FSqlExceptionSyntax(
    String message,
    String query,
    List<String> sqlParams, [
    FException? innerException,
  ]) : super(message, query, sqlParams, innerException);
}
