import {
  FEnsureException,
  FException,
  FExceptionAggregate,
  FExceptionArgument,
  FExceptionInvalidOperation,
  FExecutionContext,
  FLogger,
  FLoggerLabelsExecutionContext,
  FSqlConnection,
  FSqlConnectionFactoryExecutionContext,
} from '@freemework/common';
import os from 'os';
import path from 'path';
import { v4 as uuid } from 'uuid';

import { NamedBreakpointActivity, NativeBreakpointActivity } from './activities/BreakpointActivity.js';
import { WorkflowVirtualMachine1Impl } from './internal/WorkflowVirtualMachine1Impl.js';
import { Activity, BreakpointActivity, DataContextActivity, NativeActivity } from './activities/index.js';
import { WorkflowModel } from './models.js';
import { WorkflowDataCacheFacade, WorkflowDataCacheFacadeExecutionContext } from './WorkflowDataCacheFacade.js';
import { WorkflowDataPersistentFacade } from './WorkflowDataPersistentFacade.js';
import { WorkflowVirtualMachine } from './WorkflowVirtualMachine.js';

const LOCK_TIMEOUT_SECONDS = 64;

export class WorkflowApplication<TDataContext = {}> {
  private static _lockInstanceName: string | null = null;
  private readonly _workflowDataCacheFacade: WorkflowDataCacheFacade;
  private readonly _logger: FLogger;
  private readonly _workflowUuid: string;
  private readonly _wvm: WorkflowVirtualMachine;
  private _status: WorkflowModel.Status;
  private _lastTickDate: Date;
  /**
   * false after persist
   */
  private _isDirty: boolean;
  private _isUnlocked: boolean;
  private _prevTickId: WorkflowModel['tickId'] | null;

  public static async syncActiveWorkflowApplicationToRedis(executionContext: FExecutionContext): Promise<void> {
    const { workflowDataCacheFacade: workflowDataCache } = WorkflowDataCacheFacadeExecutionContext.of(executionContext);

    const activeWfAppUuids: Array<string> = await workflowDataCache.getActiveWorkflowApplications(executionContext);

    const notSyncedWfApps: Array<WorkflowModel> = await FSqlConnectionFactoryExecutionContext.of(
      executionContext,
    ).sqlConnectionFactory.usingConnection(
      executionContext,
      (usingExecutionContext: FExecutionContext, sqlConnection: FSqlConnection) =>
        WorkflowDataPersistentFacade.fromSqlConnection(sqlConnection).getActiveWorkflowApplications(
          usingExecutionContext,
          {
            exclude: activeWfAppUuids,
          },
        ),
    );

    if (notSyncedWfApps.length > 0) {
      for (const notSyncedWfApp of notSyncedWfApps) {
        await workflowDataCache.updateAndLockWorkflowApplication(
          executionContext,
          WorkflowApplication.lockInstanceName,
          notSyncedWfApp,
          null,
        );
        await workflowDataCache.unlockWorkflowApplication(
          executionContext,
          WorkflowApplication.lockInstanceName,
          notSyncedWfApp.workflowUuid,
          false,
        );
      }
    }
  }

  public static async lockNextWorkflowApplication(
    executionContext: FExecutionContext,
    workerTags: ReadonlyArray<string>,
  ): Promise<WorkflowApplication | null> {
    const { workflowDataCacheFacade: workflowDataCache } = WorkflowDataCacheFacadeExecutionContext.of(executionContext);

    while (true) {
      // Loop for case: Redis contains stale data

      const workflowUuid: string | null = await workflowDataCache.lockNextWorkflowApplication(
        executionContext,
        WorkflowApplication.lockInstanceName,
        LOCK_TIMEOUT_SECONDS,
        workerTags,
      );
      if (workflowUuid === null) {
        return null;
      }

      try {
        const workflowModel: WorkflowModel | null = await FSqlConnectionFactoryExecutionContext.of(
          executionContext,
        ).sqlConnectionFactory.usingConnection(
          executionContext,
          (usingExecutionContext: FExecutionContext, sqlConnection: FSqlConnection) =>
            WorkflowDataPersistentFacade.fromSqlConnection(sqlConnection).findWorkflowById(
              usingExecutionContext,
              workflowUuid,
            ),
        );

        if (workflowModel === null) {
          // Looks like Redis contains stale data. Cleanup.
          await workflowDataCache.cleanupWorkflowApplication(
            executionContext,
            WorkflowApplication.lockInstanceName,
            workflowUuid,
          );
          continue;
        } else {
          const { activityUuid } = workflowModel;
          const ActivityClass: Activity.Constructor = Activity.getActivityConstructor(activityUuid);
          const entryPointActivity: Activity = new ActivityClass();
          if (!(entryPointActivity instanceof NativeActivity)) {
            // TODO: crash this wf app
            console.error('Broken Workflow Engine');
            return null;
          }

          const vmData = workflowModel.workflowVirtualMachineSnapshot;

          return new WorkflowApplication(executionContext, entryPointActivity, {
            workflowUuid,
            vmData,
            prevTickId: workflowModel.tickId,
            status: workflowModel.workflowStatus,
          });
        }
      } catch (e1) {
        try {
          await workflowDataCache.unlockWorkflowApplication(
            executionContext,
            WorkflowApplication.lockInstanceName,
            workflowUuid,
            false,
          );
        } catch (e2) {
          const err1 = FException.wrapIfNeeded(e1);
          const err2 = FException.wrapIfNeeded(e2);
          throw new FExceptionAggregate([err1, err2]);
        }
        throw e1;
      }
    }
  }

  public static create(
    executionContext: FExecutionContext,
    entryPoint: NativeActivity,
    workflowUuid?: string,
  ): WorkflowApplication {
    return new WorkflowApplication(executionContext, entryPoint, {
      ...(workflowUuid !== undefined ? { workflowUuid } : {}),
      dataContext: {},
    });
  }

  public static createWithInitializer<TDataContext>(
    executionContext: FExecutionContext,
    entryPoint: DataContextActivity<TDataContext>,
    initialize: WorkflowApplication.Initialize<TDataContext>,
  ): WorkflowApplication {
    return new WorkflowApplication(executionContext, entryPoint, initialize);
  }

  public static restore(
    executionContext: FExecutionContext,
    entryPoint: NativeActivity,
    restore: WorkflowApplication.Restore,
  ): WorkflowApplication {
    return new WorkflowApplication(executionContext, entryPoint, restore);
  }

  private static get lockInstanceName(): string {
    if (this._lockInstanceName === null) {
      this._lockInstanceName =
        process.env["NODE_ENV"] !== 'production'
          ? `${os.hostname()}:${path.normalize(path.join(__dirname, '..', '..', '..', '..'))}:pid${process.pid}`
          : `${os.hostname()}:pid${process.pid}`;
    }

    return this._lockInstanceName;
  }

  private constructor(
    executionContext: FExecutionContext,
    entryPoint: NativeActivity,
    workflowUuidOrRestoreOrInitialize?:
      | string
      | WorkflowApplication.Initialize<TDataContext>
      | WorkflowApplication.Restore,
  ) {
    this._logger = FLogger.create(this.constructor.name);
    this._workflowDataCacheFacade =
      WorkflowDataCacheFacadeExecutionContext.of(executionContext).workflowDataCacheFacade;

    if (workflowUuidOrRestoreOrInitialize !== undefined) {
      if (typeof workflowUuidOrRestoreOrInitialize === "string") {
        this._workflowUuid = workflowUuidOrRestoreOrInitialize;
        this._prevTickId = null;
        this._wvm = new WorkflowVirtualMachine1Impl(entryPoint, null);
        this._status = WorkflowModel.Status.WORKING;
      } else if ('prevTickId' in workflowUuidOrRestoreOrInitialize) {
        const restore: WorkflowApplication.Restore = workflowUuidOrRestoreOrInitialize;
        this._workflowUuid = restore.workflowUuid;
        this._prevTickId = restore.prevTickId;
        this._wvm = new WorkflowVirtualMachine1Impl(entryPoint, restore.vmData);
        this._status = WorkflowModel.Status.parse(restore.status);
      } else {
        const initialize: WorkflowApplication.Initialize<TDataContext> = workflowUuidOrRestoreOrInitialize;
        const { workflowUuid } = initialize;
        this._workflowUuid = workflowUuid !== undefined ? workflowUuid : uuid();
        this._prevTickId = null;
        this._wvm = new WorkflowVirtualMachine1Impl(entryPoint, null);
        if (entryPoint instanceof DataContextActivity) {
          const dataContextConstructor = entryPoint.dataContextFactory;
          if (dataContextConstructor !== null) {
            dataContextConstructor.initDataContext(this._wvm, initialize.dataContext);
          }
        }
        this._status = WorkflowModel.Status.WORKING;
      }
    } else {
      this._workflowUuid = uuid();
      this._prevTickId = null;
      this._wvm = new WorkflowVirtualMachine1Impl(entryPoint, null);
      this._status = WorkflowModel.Status.WORKING;
    }

    this._lastTickDate = new Date();
    this._isDirty = true;
    this._isUnlocked = false;
  }

  public get currentExecutionContext(): WorkflowVirtualMachine.Context {
    this.verifyLocked();

    if (!this._wvm.isPaused) {
      throw new FExceptionInvalidOperation(
        'Wrong operation at current state. A currentExecutionContext is available in pause-state(non-in-tick) only.',
      );
    }

    if (this._wvm.isTerminated) {
      throw new FExceptionInvalidOperation('Wrong operation at current state. A WorkflowVirtualMachine is terminated.');
    }

    return this._wvm;
  }

  public get currentActivity(): Activity {
    this.verifyLocked();

    if (!this._wvm.isPaused) {
      throw new FExceptionInvalidOperation(
        'Wrong operation at current state. A currentExecutionContext is available in pause-state(non-in-tick) only.',
      );
    }

    if (this._wvm.isTerminated) {
      throw new FExceptionInvalidOperation('Wrong operation at current state. A WorkflowVirtualMachine is terminated.');
    }

    return this._wvm.currentActivity;
  }

  public get currentBreakpointActivity(): BreakpointActivity {
    this.verifyLocked();

    const { currentActivity } = this;
    if (currentActivity instanceof BreakpointActivity) {
      return currentActivity;
    }

    throw new FExceptionInvalidOperation('Wrong operation. Due currentActivity is not a BreakpointActivity.');
  }

  public get state(): WorkflowModel.Status {
    this.verifyLocked();
    return this._status;
  }

  public get workflowUuid(): string {
    this.verifyLocked();
    return this._workflowUuid;
  }

  public defineVariable(name: string, value: WorkflowVirtualMachine.Value) {
    this.verifyLocked();
    this._isDirty = true;
    this._wvm.variables.defineGlobal(name, value);
  }

  public async disableBreakpoint(_executionContext: FExecutionContext, breakpointName: string): Promise<void> {
    this.verifyLocked();

    if (this._wvm.isTerminated) {
      throw new FExceptionInvalidOperation('Cannot resume breakpoint on terminated workflow');
    }
    const breakpointActivity: NamedBreakpointActivity | undefined = this._wvm.breakpoints.get(breakpointName);
    if (breakpointActivity === undefined) {
      throw new FExceptionInvalidOperation(`Wrong breakpoint '${breakpointName}'. Not found.`);
    }

    breakpointActivity.createElement(this._wvm).isEnabled = false;
  }

  public getVariableBoolean(name: string): boolean {
    this.verifyLocked();
    return this._wvm.variables.getBoolean(name);
  }

  public getVariableInteger(name: string): number {
    this.verifyLocked();
    return this._wvm.variables.getInteger(name);
  }

  public getVariableNumber(name: string): number {
    this.verifyLocked();
    return this._wvm.variables.getNumber(name);
  }

  public getVariableString(name: string): string {
    this.verifyLocked();
    return this._wvm.variables.getString(name);
  }

  public async enableBreakpoint(_executionContext: FExecutionContext, breakpointName: string): Promise<void> {
    this.verifyLocked();

    if (this._wvm.isTerminated) {
      throw new FExceptionInvalidOperation('Cannot resume breakpoint on terminated workflow');
    }
    const breakpointActivity: NamedBreakpointActivity | undefined = this._wvm.breakpoints.get(breakpointName);
    if (breakpointActivity === undefined) {
      throw new FExceptionInvalidOperation(`Wrong breakpoint '${breakpointName}'. Not found.`);
    }

    breakpointActivity.createElement(this._wvm).isEnabled = true;
  }

  public async perform(
    executionContext: FExecutionContext,
    nextTickTags: ReadonlyArray<string>,
    opts?: {
      readonly dbFacade: WorkflowDataPersistentFacade;
      /**
       * Прервать тики, при достижении ближайшего BreakpointActivity
       * !!! Ни один тик из BreakpointActivity не выполяется !!!
       * т.е. перываение должно случиться ПЕРЕД выполнением BreakpointActivity
       */
      readonly breakOnFirstBreakpoint: boolean;
    },
  ): Promise<void> {
    if (this._wvm.isTerminated) {
      throw new FExceptionInvalidOperation('Cannot start terminated workflow');
    }

    executionContext = new FLoggerLabelsExecutionContext(executionContext, { workflowUuid: this.workflowUuid });

    let prevActivity: Activity | null = null;
    let activityHangsCounter = 0;
    while (true) {
      try {
        if (opts !== undefined && opts.breakOnFirstBreakpoint === true) {
          if (this._wvm.currentActivity instanceof BreakpointActivity) {
            // break on first breakpoint
            return;
          }
        }

        if (prevActivity === this._wvm.currentActivity) {
          ++activityHangsCounter;
        } else {
          prevActivity = this._wvm.currentActivity;
          activityHangsCounter = 0;
        }

        this._isDirty = true;

        const tickActivity: Activity = this._wvm.currentActivity;
        if (tickActivity instanceof BreakpointActivity) {
          const isApprovedCurrentBreakpoint = await this._workflowDataCacheFacade.isApprovedBreakpoint(
            executionContext,
            this._workflowUuid,
            tickActivity.oid, // this._wvm.getActivityOid(currentActivity)
          );
          if (isApprovedCurrentBreakpoint) {
            // Turn-off Breakpoint (allow execution)
            tickActivity.createElement(this._wvm).isEnabled = false;
          }
        }

        this._status = WorkflowModel.Status.WORKING;

        if (this._logger.isDebugEnabled) {
          const activityTypeName: string = tickActivity.constructor.name;
          this._logger.debug(executionContext, `Schedule tick for activity '${activityTypeName}'.`);
        }
        if (this._logger.isTraceEnabled) {
          const contextData: any = this._wvm.toJSON();
          this._logger.debug(executionContext, `State before tick: '${JSON.stringify(contextData)}'`);
        }
        const isIdle: boolean = await this._wvm.tick(executionContext);
        if (this._logger.isTraceEnabled) {
          const contextData: any = this._wvm.toJSON();
          this._logger.debug(executionContext, `State after tick: '${JSON.stringify(contextData)}'`);
        }

        this._lastTickDate = new Date();

        if (this._wvm.isTerminated) {
          this._status = WorkflowModel.Status.TERMINATED;
        } else if (isIdle) {
          if (this._wvm.currentActivity instanceof NativeBreakpointActivity) {
            // // В состоянии сна, может быть выполнено еще несколько тиков (напрмер отсылка мерчанту нотификации)
            // // Т.е. в состоянии SLEEPING выполняются все тики, пока BreakpointActivity не перейдет в isIdle
            // isIdle = this._wvm.currentActivity.createElement(this._wvm).isIdle;

            this._status = WorkflowModel.Status.SLEEPING;
          }
        }

        const workflowModel: WorkflowModel =
          opts === undefined
            ? await FSqlConnectionFactoryExecutionContext.of(executionContext).sqlConnectionFactory.usingConnection(
              executionContext,
              (usingExecutionContext: FExecutionContext, sqlConnection: FSqlConnection) =>
                this.persist(
                  usingExecutionContext,
                  WorkflowDataPersistentFacade.fromSqlConnection(sqlConnection),
                  nextTickTags,
                  this._prevTickId,
                ),
            )
            : await this.persist(executionContext, opts.dbFacade, nextTickTags, this._prevTickId);
        this._logger.trace(executionContext, () => `Workflow '${workflowModel.workflowUuid}' was persisted.`);

        if (isIdle || this._wvm.isTerminated) {
          const activityTypeName: string = tickActivity.constructor.name;

          if (this._logger.isDebugEnabled && isIdle) {
            this._logger.debug(executionContext, `Application idle on activity '${activityTypeName}'.`);
          }
          if (this._logger.isInfoEnabled && this._wvm.isTerminated) {
            this._logger.debug(executionContext, `Application terminated on activity '${activityTypeName}'.`);
          }

          return; // Nothing to do due idle/terminated
        }

        if (prevActivity !== null && activityHangsCounter >= 16) {
          console.error(
            `An hangs activity detected. The activity oid:'${prevActivity.oid}' of type '${prevActivity.constructor.name}' in workflow application '${prevActivity.root.children[0]!.constructor.name}' is executes 16 times. Force idle state.`,
          );
          return;
        }
      } catch (e) {
        this._lastTickDate = new Date();
        this._status = WorkflowModel.Status.CRASHED;
        const err: FException = FException.wrapIfNeeded(e);

        console.error(err);
        this._logger.error(executionContext, err.message);
        this._logger.debug(executionContext, err.message, err);

        let crashReport: string = err.message;
        if (err instanceof FException) {
          let promotionErr: Error | null = err.innerException;
          while (promotionErr !== null) {
            crashReport = `${crashReport}\n${promotionErr.message}`;
            promotionErr = promotionErr instanceof FException ? promotionErr.innerException : null;
          }
        }

        if (opts === undefined) {
          await FSqlConnectionFactoryExecutionContext.of(executionContext).sqlConnectionFactory.usingConnection(
            executionContext,
            (usingExecutionContext: FExecutionContext, sqlConnection: FSqlConnection) =>
              this.persist(
                usingExecutionContext,
                WorkflowDataPersistentFacade.fromSqlConnection(sqlConnection),
                nextTickTags,
                this._prevTickId,
                crashReport,
              ),
          );
        } else {
          const { dbFacade } = opts;
          await this.persist(executionContext, dbFacade, nextTickTags, this._prevTickId, crashReport);
        }

        return;
      }
    }
  }

  public setVariable(name: string, value: boolean | number | string | null) {
    this.verifyLocked();
    this._isDirty = true;
    this._wvm.variables.set(name, value);
  }

  public async persist(
    executionContext: FExecutionContext,
    dbFacade: WorkflowDataPersistentFacade,
    nextTickTags: ReadonlyArray<string>,
    prevTickId: WorkflowModel['tickId'] | null = null,
    crashReport: string | null = null,
  ): Promise<WorkflowModel> {
    this.verifyLocked();

    const { latestExecutedBreakpoint } = this._wvm;

    let workflowData: WorkflowModel.Data & WorkflowModel.Tick;

    {
      // local scope
      const workflowDataBaseData = {
        workflowUuid: this._workflowUuid,
        activityUuid: this._wvm.entryPointActivity.activityUUID,
        activityVersion: Activity.appVersion,
        workflowVirtualMachineSnapshot: this._wvm.toJSON(),
        latestExecutedBreakpoint: latestExecutedBreakpoint !== null ? latestExecutedBreakpoint.name : null,
        executedAt: this._lastTickDate,
        nextTickTags,
      };

      if (this._status === WorkflowModel.Status.CRASHED) {
        if (crashReport === null) {
          throw new FExceptionArgument('Cannot persist crash state without crash report.', 'crashReport');
        }

        workflowData = {
          ...workflowDataBaseData,
          workflowStatus: this._status,
          crashReport,
        };
      } else {
        workflowData = {
          ...workflowDataBaseData,
          workflowStatus: this._status,
        };
      }
    }

    const workflowModel: WorkflowModel = await dbFacade.persistWorkflow(executionContext, workflowData, prevTickId);
    this._prevTickId = workflowModel.tickId;

    let breakpoint: null | { readonly oid: string; readonly waitTimeout: number } = null;
    if (this.state === WorkflowModel.Status.SLEEPING && this.currentActivity instanceof NativeBreakpointActivity) {
      const { executeCounter } = NativeBreakpointActivity.of(this._wvm);
      let waitTimeout: number;
      if (executeCounter < 10) {
        waitTimeout = 30;
      } else if (executeCounter < 50) {
        waitTimeout = 60;
      } else {
        waitTimeout = 300;
      }
      breakpoint = Object.freeze({ oid: this.currentActivity.oid, waitTimeout });
    }

    await this._workflowDataCacheFacade.updateAndLockWorkflowApplication(
      executionContext,
      WorkflowApplication.lockInstanceName,
      workflowModel,
      breakpoint,
    );

    this._isDirty = false;

    return workflowModel;
  }

  public async unlock(executionContext: FExecutionContext): Promise<void> {
    if (this._isUnlocked === true) {
      // already unlocked
      return;
    }

    if (this._isDirty !== false) {
      throw new FExceptionInvalidOperation('Wrong usage. Cannot unlock dirty application. Try persist first.');
    }

    const removeFromProcessing: boolean =
      this._status === WorkflowModel.Status.TERMINATED || this._status === WorkflowModel.Status.CRASHED;

    await this._workflowDataCacheFacade.unlockWorkflowApplication(
      executionContext,
      WorkflowApplication.lockInstanceName,
      this._workflowUuid,
      removeFromProcessing,
    );
  }

  private verifyLocked(): void {
    if (this._isUnlocked !== false) {
      throw new FExceptionInvalidOperation('Wrong usage. Cannot use unlocked application.');
    }
  }
}

export namespace WorkflowApplication {
  export interface Initialize<TDataContext> {
    readonly dataContext: TDataContext;
    readonly workflowUuid?: string;
  }
  export interface Restore {
    readonly vmData: any;
    readonly workflowUuid: string;
    readonly prevTickId: WorkflowModel['tickId'];
    readonly status: WorkflowModel.Status;
  }

  export class ContractViolationError extends FEnsureException {
    //
  }

  export class WorkflowNotFoundError extends FExceptionArgument {
    public readonly workflowUuid: WorkflowApplication['workflowUuid'];

    public constructor(workflowUuid: WorkflowApplication['workflowUuid']) {
      super(
        'Requested workflow application was not found. See workflowUuid property for the workflow application identifier.',
        'workflowUuid',
      );
      this.workflowUuid = workflowUuid;
    }
  }

  export class WorkflowConcurrencyError extends Error { }
}
