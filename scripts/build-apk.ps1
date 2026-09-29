$ErrorActionPreference = "Stop"

$jdkPath = "C:\Users\kmane\jdk-21"
$androidHome = "C:\Users\kmane\android-sdk"

$env:JAVA_HOME = $jdkPath
$env:PATH = "$jdkPath\bin;$androidHome\platform-tools;$env:PATH"
$env:ANDROID_HOME = $androidHome
$env:ANDROID_SDK_ROOT = $androidHome

Write-Host "Starting Knockout Notes APK build..."

Write-Host "[Step 1] Preparing web bundle..."
Set-Location -Path "F:\KnockoutNotes"
node scripts/build-android-bundle.js

Write-Host "[Step 2] Syncing Capacitor..."
npx cap sync android

Write-Host "[Step 3] Running Gradle clean assembleDebug..."
Set-Location -Path "F:\KnockoutNotes\android"
.\gradlew.bat clean assembleDebug

Write-Host "Gradle finished."
