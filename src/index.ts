import { FModuleVersionGuard } from "@freemework/common";

import { packageInfo } from "./package_info.js";
FModuleVersionGuard(packageInfo);

export * from "./f_decimal.extension.js";
export { FDecimalBackendBigNumber } from "./f_decimal_backend_big_number.js";
