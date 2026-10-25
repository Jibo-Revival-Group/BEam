'use strict';

// Native view ownership helpers shared by touch apps (generalized from the
// Spotify UI). Error codes carry a caller-supplied prefix.
//
// This archived SDK serializes closed views for later reconstruction. A touch
// app owns live callbacks/state and must never return through that snapshot
// stack.
function prepareView(view) {
    view.viewStateStacked = true;
    return view;
}

function refuse(prefix, code) {
    const error = new Error((prefix || 'touch') + '_' + code);
    error.code = error.message;
    throw error;
}

// View.destroy() clears global gesture and GPU preparation queues. Only the
// current view may use that normal manager lifecycle. For a hidden,
// asset-free view, use the native ComponentGroup teardown and its owned stage.
// An active pauseThenOpen process still captures the old parent in a closure,
// so callers must wait for the native process event before attempting disposal.
function disposeHiddenView(views, tween, view, prefix) {
    if (!view || view.state === 'destroyed') return;
    if (!views || !views._viewProcess || !views.STATE || !views.ComponentGroup ||
        !views.ComponentGroup.prototype.destroy || !tween || !tween.stop) refuse(prefix, 'view_lifecycle_unavailable');
    if (views.currentView === view) refuse(prefix, 'view_is_current');
    if (views._viewProcess.active || (views._viewProcess.processQueue && views._viewProcess.processQueue.length)) refuse(prefix, 'view_transition_active');
    if (!view.viewStateStacked || (view.state !== views.STATE.OPENED && view.state !== views.STATE.CLOSED)) refuse(prefix, 'view_not_ready');
    if (view._assetLoad || (view._loadedAssets && view._loadedAssets.length) ||
        (view.assetManifest && view.assetManifest.length) ||
        (view._assetLoadQueue && view._assetLoadQueue.length) ||
        (view._assetLoadRequests && view._assetLoadRequests.length)) refuse(prefix, 'view_assets_active');
    // Validate the entire chain before mutation. Preserve any older ancestor,
    // and never remove another instance merely because it has the same id.
    let parent = null, cursor = views.currentView;
    const seen = [];
    while (cursor) {
        if (seen.indexOf(cursor) !== -1) refuse(prefix, 'view_parent_cycle');
        seen.push(cursor);
        if (cursor.pausedParent === view) parent = cursor;
        cursor = cursor.pausedParent;
    }
    if (parent) parent.pausedParent = view.pausedParent;
    view.pausedParent = null;
    view.status = views.STATE.DESTROYED;
    views.ComponentGroup.prototype.destroy.call(view);
    if (view.pauseOverlay) view.pauseOverlay.destroy();
    view.pauseOverlay = null;
    if (view.stage) {
        tween.stop(view.stage);
        if (view.stage.parent) view.stage.parent.removeChild(view.stage);
        view.stage.destroy({ children: true });
    }
    view._stage = null;
    view._viewManager = null;
    view._viewState = null;
    view._viewConfig = null;
    view._configPath = null;
    view._loadedAssets = null;
    view.assetManifest = null;
    view._assetLoadQueue = null;
    view._assetLoadRequests = null;
    view.transitionHandler = null;
}

// Remove the current view (normal manager lifecycle) or dispose a hidden one,
// waiting for any active native view process first. `done(error)` runs once.
function closeView(views, tween, view, timers, prefix, done) {
    let watching = null, timeout = null, finished = false;
    const unwatch = () => {
        if (watching) { watching.off(attempt); watching = null; }
        if (timeout !== null) { timers.clearTimeout(timeout); timeout = null; }
    };
    const finish = error => { if (finished) return; finished = true; unwatch(); done(error || null); };
    const fail = code => { const error = new Error((prefix || 'touch') + '_' + code); error.code = error.message; return error; };
    function attempt() {
        if (finished) return;
        if (!view || view.state === 'destroyed') { finish(); return; }
        if (!views) { finish(fail('view_lifecycle_unavailable')); return; }
        const process = views._viewProcess;
        if (process && (process.active || (process.processQueue && process.processQueue.length))) {
            if (watching) return;
            const event = views.events && views.events.process;
            if (!event || !event.on || !event.off) { finish(fail('view_transition_unobservable')); return; }
            watching = event; watching.on(attempt);
            timeout = timers.setTimeout(() => finish(fail('view_transition_timeout')), 2000);
            return;
        }
        unwatch();
        if (views.currentView === view) {
            timeout = timers.setTimeout(() => finish(fail('view_close_timeout')), 2000);
            try {
                views.changeView({ remove: true, leaveEmpty: views.viewStackLength === 1, transitionClose: views.TRANSITION.OUT }, () => {
                    if (views.currentView !== view && view.state === 'destroyed') finish();
                    else finish(fail('view_close_incomplete'));
                }, () => finish(fail('view_close_failed')));
            } catch (error) { finish(error); }
            return;
        }
        try { disposeHiddenView(views, tween, view, prefix); finish(); }
        catch (error) { finish(error); }
    }
    attempt();
}

module.exports = { prepareView, disposeHiddenView, closeView };
