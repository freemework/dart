import "package:meta/meta.dart";

import "../cancellation/f_cancellation_exception.dart"
    show FCancellationException;
import "../exception/f_exception.dart" show FException;
import "../exception/f_exception_aggregate.dart" show FExceptionAggregate;
import "../execution_context/f_execution_context.dart" show FExecutionContext;
import "f_channel_event.dart"
    show FChannelEvent, FEventChannelCallback, FChannelEventData;

mixin FChannelEventMixin<TData, TEvent extends FChannelEventData<TData>>
    implements FChannelEvent<TData, TEvent> {
  List<FEventChannelCallback<TData, TEvent>>? __callbacks;

  @override
  void addHandler(FEventChannelCallback<TData, TEvent> cb) {
    if (this.__callbacks == null) {
      this.__callbacks = [];
    }

    this.__callbacks!.add(cb);
    if (this.__callbacks!.length == 1) {
      this.onAddFirstHandler();
    }
  }

  @override
  void removeHandler(FEventChannelCallback<TData, TEvent> cb) {
    final List<FEventChannelCallback<TData, TEvent>>? callbacks =
        this.__callbacks;
    if (callbacks == null) {
      return;
    }
    final int index = callbacks.indexOf(cb);
    if (index != -1) {
      callbacks.removeAt(index);
      if (callbacks.isEmpty) {
        this.onRemoveLastHandler();
      }
    }
  }

  @protected
  Future<void> notify(FExecutionContext executionContext, TEvent event) {
    if (this.__callbacks == null || this.__callbacks!.isEmpty) {
      return Future.value();
    }

    final List<FEventChannelCallback<TData, TEvent>> callbacks =
        this.__callbacks!.toList(growable: false);
    if (callbacks.length == 1) {
      final FEventChannelCallback<TData, TEvent> callback = callbacks[0];
      return callback(executionContext, event);
    }
    const List<Future<void>> promises = [];
    const List<FException> errors = [];
    for (final FEventChannelCallback<TData, TEvent> callback in callbacks) {
      try {
        final Future<void> result = callback(executionContext, event);
        promises.add(result);
      } catch (e) {
        final ex = FException.wrapIfNeeded(e);
        errors.add(ex);
      }
    }

    if (promises.length == 1 && errors.isEmpty) {
      return promises[0];
    } else if (promises.isNotEmpty) {
      return Future.wait(promises.map((Future<void> p) {
        return p.catchError((Object e) {
          final ex = FException.wrapIfNeeded(e);
          errors.add(ex);
        });
      })).then((_) {
        if (errors.isNotEmpty) {
          for (final error in errors) {
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
        for (final error in errors) {
          if (error is! FCancellationException) {
            throw FExceptionAggregate(errors);
          }
        }
        // So, all errors are FCancellationException instances, throw first
        throw errors[0];
      } else {
        return Future.value();
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
