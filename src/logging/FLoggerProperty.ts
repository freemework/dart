export class FLoggerProperty {
	public constructor(
		public readonly name: string,
		public readonly value: string,
	) { }

	public toString(): string {
		return `${this.name}:${this.value}`;
	}
}
