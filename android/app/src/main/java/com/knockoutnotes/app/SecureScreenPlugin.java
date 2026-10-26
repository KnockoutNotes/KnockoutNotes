package com.knockoutnotes.app;

import android.view.WindowManager;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * SecureScreenPlugin
 * Restricts screenshots, screen recording, and recent-app thumbnails
 * using WindowManager.LayoutParams.FLAG_SECURE for protected Study Mode.
 */
@CapacitorPlugin(name = "SecureScreen")
public class SecureScreenPlugin extends Plugin {

    @PluginMethod
    public void enable(PluginCall call) {
        getBridge().executeOnMainThread(() -> {
            try {
                if (getActivity() != null && getActivity().getWindow() != null) {
                    getActivity().getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);
                    JSObject ret = new JSObject();
                    ret.put("isSecure", true);
                    call.resolve(ret);
                } else {
                    call.reject("Activity or Window is null");
                }
            } catch (Exception e) {
                call.reject("Failed to enable FLAG_SECURE: " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void disable(PluginCall call) {
        getBridge().executeOnMainThread(() -> {
            try {
                if (getActivity() != null && getActivity().getWindow() != null) {
                    getActivity().getWindow().clearFlags(WindowManager.LayoutParams.FLAG_SECURE);
                    JSObject ret = new JSObject();
                    ret.put("isSecure", false);
                    call.resolve(ret);
                } else {
                    call.reject("Activity or Window is null");
                }
            } catch (Exception e) {
                call.reject("Failed to clear FLAG_SECURE: " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void isSecure(PluginCall call) {
        getBridge().executeOnMainThread(() -> {
            try {
                if (getActivity() != null && getActivity().getWindow() != null) {
                    int flags = getActivity().getWindow().getAttributes().flags;
                    boolean isSecure = (flags & WindowManager.LayoutParams.FLAG_SECURE) != 0;
                    JSObject ret = new JSObject();
                    ret.put("isSecure", isSecure);
                    call.resolve(ret);
                } else {
                    call.reject("Activity or Window is null");
                }
            } catch (Exception e) {
                call.reject("Failed to check FLAG_SECURE: " + e.getMessage());
            }
        });
    }
}
