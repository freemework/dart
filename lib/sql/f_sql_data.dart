// Copyright 2023, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

import "dart:typed_data" show Uint8List;

import "../primitive/f_decimal.dart" show FDecimal;

abstract class FSqlData {
  Uint8List get asBinary;
  Uint8List? get asBinaryNullable;

  bool get asBoolean;
  bool? get asBooleanNullable;

  String get asString;
  String? get asStringNullable;

  int get asInteger;
  int? get asIntegerNullable;

  DateTime get asDate;
  DateTime? get asDateNullable;

  FDecimal get asDecimal;
  FDecimal? get asDecimalNullable;

  const FSqlData._(); // disallow extends (allow implements only)
}
