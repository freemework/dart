import { FExecutionContext, FExecutionContextBase, FExecutionElement } from "../execution_context/index.js";
import { FInitable } from "../lifecycle/f_initable.js";
import { FSqlConnectionFactory } from "./f_sql_connection_factory.js";

export class FSqlConnectionFactoryExecutionContext extends FExecutionContextBase {
	private readonly _sqlConnectionFactory: FSqlConnectionFactory;

	public static async create(
		prevContext: FExecutionContext,
		sqlConnectionFactory: FSqlConnectionFactory,
	): Promise<FSqlConnectionFactoryExecutionContext> {
		if (FInitable.instanceOf(sqlConnectionFactory)) {
			await sqlConnectionFactory.init(prevContext);
		}
		return new FSqlConnectionFactoryExecutionContext(prevContext, sqlConnectionFactory);
	}

	public static of(executionContext: FExecutionContext): FSqlConnectionFactoryExecutionElement {
		const sqlFactoryExecutionContext: FSqlConnectionFactoryExecutionContext = FExecutionContext.getExecutionContext(
			executionContext,
			FSqlConnectionFactoryExecutionContext,
		);

		return new FSqlConnectionFactoryExecutionElement(
			sqlFactoryExecutionContext,
			sqlFactoryExecutionContext._sqlConnectionFactory,
		);
	}

	public get sqlConnectionFactory(): FSqlConnectionFactory {
		return this._sqlConnectionFactory;
	}

	private constructor(prevContext: FExecutionContext, sqlConnectionFactory: FSqlConnectionFactory) {
		super(prevContext);
		this._sqlConnectionFactory = sqlConnectionFactory;
	}
}
export class FSqlConnectionFactoryExecutionElement<
	TExecutionContext extends FSqlConnectionFactoryExecutionContext = FSqlConnectionFactoryExecutionContext,
> extends FExecutionElement<TExecutionContext> {
	private readonly _sqlConnectionFactory: FSqlConnectionFactory;

	public constructor(owner: TExecutionContext, sqlConnectionFactory: FSqlConnectionFactory) {
		super(owner);
		this._sqlConnectionFactory = sqlConnectionFactory;
	}

	public get sqlConnectionFactory(): FSqlConnectionFactory {
		return this._sqlConnectionFactory;
	}
}
