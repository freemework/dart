import { FException } from "@freemework/common";

export class FLauncherException extends FException {
	//
}

export class FLauncherInitializeRuntimeException extends FException {
	//
}

export class FLauncherRestartRequiredException extends FLauncherInitializeRuntimeException {
	public readonly exitCode: number;

	public constructor(exitCode?: number) {
		super();
		this.exitCode = exitCode !== undefined ? exitCode : 126;
	}
}
