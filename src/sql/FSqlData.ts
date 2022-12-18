import { FDecimal } from "../primitive/FDecimal";

export interface FSqlData {
	readonly asBoolean: boolean;
	readonly asBooleanNullable: boolean | null;

	readonly asString: string;
	readonly asStringNullable: string | null;

	readonly asInteger: number;
	readonly asIntegerNullable: number | null;

	readonly asNumber: number;
	readonly asNumberNullable: number | null;

	readonly asDecimal: FDecimal;
	readonly asDecimalNullable: FDecimal | null;

	readonly asDate: Date;
	readonly asDateNullable: Date | null;

	readonly asBinary: Uint8Array;
	readonly asBinaryNullable: Uint8Array | null;

	readonly asObject: any;
	readonly asObjectNullable: any | null;
}
