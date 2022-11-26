import "package:meta/meta.dart";

import "../cancellation/f_cancellation_exception.dart";
import "../exception/f_exception.dart";
import "../exception/f_exception_aggregate.dart";
import "../exception/f_exception_invalid_operation.dart";
import "../execution_context/f_execution_context.dart";
import "./f_channel_subscriber.dart"
    show
        FChannelSubscriberEvent,
        FSubscriberChannel,
        FSubscriberChannelCallback;

mixin FChannelSubscriberMixin<TData,
        TEvent extends FChannelSubscriberEvent<TData>>
    implements FSubscriberChannel<TData, TEvent> {
  List<FSubscriberChannelCallback<TData, TEvent>>? __callbacks;
  bool? __broken;

  @override
  void addHandler(FSubscriberChannelCallback<TData, TEvent> cb) {
    this.verifyBrokenChannel();
    if (this.__callbacks == null) {
      this.__callbacks = [];
    }

    this.__callbacks!.add(cb);
    if (this.__callbacks!.length == 1) {
      this.onAddFirstHandler();
    }
  }

  @override
  void removeHandler(FSubscriberChannelCallback<TData, TEvent> cb) {
    if (this.__callbacks == null) {
      return;
    }
    final int index = this.__callbacks!.indexOf(cb);
    if (index != -1) {
      this.__callbacks!.removeAt(index);
      if (this.__callbacks!.isEmpty) {
        this.onRemoveLastHandler();
      }
    }
  }

  @protected
  bool get isBroken {
    return this.__broken != null && this.__broken!;
  }

  @protected
  void verifyBrokenChannel() {
    if (this.isBroken) {
      throw FExceptionInvalidOperation("Wrong operation on broken channel");
    }
  }

  @protected
  /*void | Promise<void>*/ dynamic notify(FExecutionContext executionContext,
      /*TEvent | FException*/ dynamic event) {
    if (this.__callbacks == null || this.__callbacks!.isEmpty) {
      return;
    }
    final List<FSubscriberChannelCallback<TData, TEvent>> callbacks =
        this.__callbacks!.toList(growable: false);
    if (event is FException) {
      this.__broken = true;
      this.__callbacks!.clear();
    }
    if (callbacks.length == 1) {
      final FSubscriberChannelCallback<TData, TEvent> callback = callbacks[0];
      return callback(executionContext, event);
    }
    final List<Future<void>> promises = [];
    final List<FException> errors = [];
    for (final callback in callbacks) {
      try {
        final dynamic result = callback(executionContext, event);
        if (result is Future) {
          promises.add(result);
        }
      } catch (e) {
        final FException ex = FException.wrapIfNeeded(e);
        errors.add(ex);
      }
    }

    if (promises.length == 1 && errors.isEmpty) {
      return promises[0];
    } else if (promises.isNotEmpty) {
      return Future.wait(promises.map((Future<void> p) {
        return p.catchError((Object e) {
          final FException ex = FException.wrapIfNeeded(e);
          errors.add(ex);
        });
      })).then((_) {
        if (errors.isNotEmpty) {
          for (final FException error in errors) {
            if (error is! FCancellationException) {
              throw FExceptionAggregate(errors);
            }
          }
          // So, all errors are FCancellationException instances, throw first
          throw errors[0];
        }
      });
    } else {
      if (errors.isNotEmpty) {
        for (final FException error in errors) {
          if (error is! FCancellationException) {
            throw FExceptionAggregate(errors);
          }
        }
        // So, all errors are FCancellationException instances, throw first
        throw errors[0];
      }
    }
  }

  @protected
  bool get hasSubscribers {
    return this.__callbacks != null && this.__callbacks!.isNotEmpty;
  }

  @protected
  void onAddFirstHandler() {/* NOP */}

  @protected
  void onRemoveLastHandler() {/* NOP */}
}
