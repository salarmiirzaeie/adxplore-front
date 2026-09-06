package ir.adxplore.app;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Typeface;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.widget.TextView;
import androidx.core.content.res.ResourcesCompat;
import com.google.androidbrowserhelper.trusted.LauncherActivity;

public class SplashActivity extends Activity {
  private static final long DELAY_MS = 900;
  private final Handler handler = new Handler(Looper.getMainLooper());
  private final Runnable launch = this::openApp;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_splash);

    TextView title = findViewById(R.id.splash_title);
    Typeface font = ResourcesCompat.getFont(this, R.font.vazirmatn_medium);
    if (font != null) {
      title.setTypeface(font);
    }

    handler.postDelayed(launch, DELAY_MS);
  }

  private void openApp() {
    startActivity(new Intent(this, LauncherActivity.class));
    overridePendingTransition(0, 0);
    finish();
  }

  @Override
  protected void onDestroy() {
    handler.removeCallbacks(launch);
    super.onDestroy();
  }
}
