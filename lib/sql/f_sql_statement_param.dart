// Copyright 2023, the Freemework.ORG project authors. Please see the AUTHORS
// file for details. All rights reserved. Use of this source code is governed
// by a BSD-style license that can be found in the LICENSE file.

import "dart:typed_data" show Uint8List;

// ignore: prefer_double_quotes
import '../primitive/f_decimal.dart';

abstract class FSqlStatementParam {
  const FSqlStatementParam();

  factory FSqlStatementParam.fromBinary(Uint8List value) =
      FSqlStatementParamTyped<Uint8List>;

  factory FSqlStatementParam.fromBoolean(bool value) =
      FSqlStatementParamTyped<bool>;

  factory FSqlStatementParam.fromString(String value) =
      FSqlStatementParamTyped<String>;

  factory FSqlStatementParam.fromInteger(int value) =
      FSqlStatementParamTyped<int>;

  factory FSqlStatementParam.fromDate(DateTime value) =
      FSqlStatementParamTyped<DateTime>;

  factory FSqlStatementParam.fromDecimal(FDecimal value) =
      FSqlStatementParamTyped<FDecimal>;
}

class FSqlStatementParamTyped<T> extends FSqlStatementParam {
  final Type type;
  final T value;

  FSqlStatementParamTyped(this.value) : type = T;

  @override
  String toString() => "$value";
}
