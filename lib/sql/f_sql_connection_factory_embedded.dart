// Copyright 2023, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

import "../execution_context/f_execution_context.dart" show FExecutionContext;

import "f_sql_connection_factory.dart" show FSqlConnectionFactory;

abstract class FSqlConnectionFactoryEmbedded implements FSqlConnectionFactory {
  ///
  /// Check if a Database exists
  ///
  Future<bool> isDatabaseExists(FExecutionContext executionContext);

  ///
  /// Initialize a new database
  ///
  /// Optionally, you may pass init SQL script via `initScriptUrl` URL.
  /// Examples of `initScriptUrl`:
  /// * file://var/lib/myapp/database/dbschema.sql
  /// * http(s)://myapp.mydomain/database/dbschema.sql
  /// * flutter-asset://database/dbschema.sql
  /// See a documentation of implementation library for supported ULRs
  ///
  Future<void> newDatabase(
    FExecutionContext executionContext, {
    Uri? initScriptUrl,
  });

  const FSqlConnectionFactoryEmbedded._(); // disallow extends (allow implements only)
}
