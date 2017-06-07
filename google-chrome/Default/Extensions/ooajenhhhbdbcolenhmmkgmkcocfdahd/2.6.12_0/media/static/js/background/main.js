/**
* Copyright 2014 Dossier Technologies Inc.
**/

function BackgroundHandler() {
    this.initialized = false;
}

BackgroundHandler.method("_init", function(path) {
    var _this = this;
    if (!this.initialized) {
        this.initialized = true;
        Browser.getWindows(false, function(windows) {
            var names = Autosave.getBundleNames();
            Autosave.clearBundles();
            // This should only happen on the first window.
            if (windows.length == 1 && names.length == 1) {
                var name = names[0];
                if (Options.isset(Options.ConfirmAutosaveTarget)) {
                    if (confirm("Do you want to set the current window as the autosave target for {0}?".format(name))) {
                        Badge.setWindowBadge(windows[0].id);
                        Autosave.addBundle(windows[0].id, name);
                    }
                }
            }
        });
    }
});

BackgroundHandler.method("saveBundle", function(windowId) {
    var bundleName = Autosave.getBundleName(windowId);
    if (bundleName && Autosave.isTarget(bundleName)) {
        Bundles.updateBundleFromWindow(bundleName, windowId);
    }
});

BackgroundHandler.method("start", function() {
    var _this = this;
    this._init();
    Autosave.assignEvents();

    Browser.onRemoved(function(windowId) {
        var bundleName = Autosave.getBundleName(windowId);
        Autosave.removeWindow(windowId);
    });

    Browser.onTabCreated(function(tab) {
        _this.saveBundle(tab.windowId);
        Badge.setBadge(tab.windowId, tab.id);
    });

    Browser.onTabUpdated(function(tab, changeInfo) {
        _this.saveBundle(tab.windowId);
        Badge.setBadge(tab.windowId, tab.id);
    });

    Browser.onTabDetached(function(tabId, detachInfo) {
        _this.saveBundle(detachInfo.oldWindowId);
        Badge.removeBadge(tabId);
    });

    Browser.onTabAttached(function(tabId, attachInfo) {
        _this.saveBundle(attachInfo.newWindowId);
    });

    Browser.onTabRemoved(function(tabId, removeInfo) {
        var windowId = removeInfo.windowId;
        if (!removeInfo.isWindowClosing) {
            _this.saveBundle(windowId);
        }
    });

    chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
        if (request.action === "open-all") {
            Browser.create(request.links, false, []);
        } else if (request.action === "save-links") {
            var bundle = new Bundle(request.name);
            for (var i = 0; i < request.links.length; i++) {
                var link = request.links[i];
                bundle.addTabs(new Tab(link.t, link.l, bundle, link.p));
            }
            bundle.save();
            Popup.show("Bundle Successfully Saved!");
        } else if (request.action === "hotkey") {
            
        }
    });
});

var Background = new BackgroundHandler("admin");
Background.start();