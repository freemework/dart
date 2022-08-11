import { FDecimal } from "../primitive/FDecimal";

export interface FSqlData {
	readonly asBoolean: boolean;
	readonly asNullableBoolean: boolean | null;

	readonly asString: string;
	readonly asNullableString: string | null;

	readonly asInteger: number;
	readonly asNullableInteger: number | null;

	readonly asNumber: number;
	readonly asNullableNumber: number | null;

	readonly asDecimal: FDecimal;
	readonly asNullableDecimal: FDecimal | null;

	readonly asDate: Date;
	readonly asNullableDate: Date | null;

	readonly asBinary: Uint8Array;
	readonly asNullableBinary: Uint8Array | null;

	readonly asObject: any;
	readonly asNullableObject: any | null;
}
