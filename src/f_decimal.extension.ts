import { FDecimal, FDecimalBackend, FDecimalBase } from '@freemework/common';
import BigNumber from 'bignumber.js';

declare module '@freemework/common' {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  namespace FDecimal {
    function fromBigNumber(x: BigNumber): FDecimal;
  }
  interface FDecimal {
    toBigNumber(): BigNumber;
  }

  //
  // We have to do same for FDecimalBase due to no direct class inheritance from FDecimal (just implement interface)
  //

  // eslint-disable-next-line @typescript-eslint/no-shadow
  namespace FDecimalBase {
    function fromBigNumber(x: BigNumber): FDecimal;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface FDecimalBase<TInstance, TBackend extends FDecimalBackend> {
    toBigNumber(): BigNumber;
  }
}

// eslint-disable-next-line no-inner-declarations
function fToBigNumber(this: FDecimal): BigNumber {
  return new BigNumber(this.toString());
}
FDecimal.prototype.toBigNumber = fToBigNumber;
FDecimalBase.prototype.toBigNumber = fToBigNumber;

// eslint-disable-next-line no-inner-declarations
function fFromBigNumber(x: BigNumber): FDecimal {
  return FDecimal.parse(x.toFixed(FDecimal.settings.fractionalDigits));
}
FDecimal.fromBigNumber = fFromBigNumber;
FDecimalBase.fromBigNumber = fFromBigNumber;
