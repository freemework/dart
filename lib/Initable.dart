// Copyright 2021, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

import 'Disposable.dart' show Disposable;
import 'ExecutionContext.dart' show ExecutionContext;

abstract class Initable extends Disposable {
  Future<void> init(ExecutionContext executionContext);
}
