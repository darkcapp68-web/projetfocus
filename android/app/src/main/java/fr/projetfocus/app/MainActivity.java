package fr.projetfocus.app;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.Dialog;
import android.graphics.Color;
import android.os.Bundle;
import android.os.Message;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

/**
 * projetfocus 2 : une coquille qui montre le site publié dans une vue web (moteur de Chrome).
 * Couché en permanence, plein écran, écran allumé. Toute la maintenance se fait sur le site.
 */
public class MainActivity extends Activity {
    // Même adresse que l'icône installée par Chrome : le site ouvre la version 2.0.
    static final String URL = "https://darkcapp68-web.github.io/projetfocus/v2/";

    private WebView web;
    private FrameLayout root;

    @SuppressLint({"SetJavaScriptEnabled"})
    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        root = new FrameLayout(this);
        root.setBackgroundColor(Color.parseColor("#1C1A4D"));
        setContentView(root);

        web = newWeb();
        root.addView(web, new FrameLayout.LayoutParams(-1, -1));
        if (b != null) web.restoreState(b); else web.loadUrl(URL);
    }

    @SuppressLint("SetJavaScriptEnabled")
    private WebView newWeb() {
        WebView w = new WebView(this);
        w.setBackgroundColor(Color.parseColor("#1C1A4D"));
        WebSettings s = w.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setJavaScriptCanOpenWindowsAutomatically(true);
        s.setSupportMultipleWindows(true);
        // Google refuse la connexion dans une « vue web » (« ; wv ») : on se présente comme Chrome,
        // et on ajoute un repère pour que le site sache qu'il est dans l'appli.
        s.setUserAgentString(s.getUserAgentString().replace("; wv", "") + " projetfocusApk");
        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(w, true);
        w.setWebViewClient(new WebViewClient());
        w.setWebChromeClient(new WebChromeClient() {
            // Fenêtre de connexion Google (window.open) : une vue web dans une boîte, liée à la page.
            @Override
            public boolean onCreateWindow(WebView view, boolean dialog, boolean gesture, Message resultMsg) {
                final WebView pop = newWeb();
                final Dialog d = new Dialog(MainActivity.this, android.R.style.Theme_Material_NoActionBar);
                d.setContentView(pop, new ViewGroup.LayoutParams(-1, -1));
                pop.setWebChromeClient(new WebChromeClient() {
                    @Override public void onCloseWindow(WebView window) { d.dismiss(); window.destroy(); }
                    @Override public boolean onCreateWindow(WebView v, boolean dl, boolean g, Message m) {
                        return false;
                    }
                });
                d.show();
                ((WebView.WebViewTransport) resultMsg.obj).setWebView(pop);
                resultMsg.sendToTarget();
                return true;
            }
        });
        return w;
    }

    private void immersive() {
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
    }

    @Override public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) immersive();
    }

    @Override protected void onSaveInstanceState(Bundle o) { super.onSaveInstanceState(o); web.saveState(o); }

    @Override public void onBackPressed() {
        if (web.canGoBack()) web.goBack(); else moveTaskToBack(true);
    }
}
