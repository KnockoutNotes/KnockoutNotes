$ErrorActionPreference = "Stop"

$sdkZipUrl = "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"
$destZip = "C:\Users\kmane\cmdline-tools.zip"
$androidHome = "C:\Users\kmane\android-sdk"
$cmdlineDir = "$androidHome\cmdline-tools\latest"
$jdkPath = "C:\Users\kmane\jdk-21"

$env:JAVA_HOME = $jdkPath
$env:PATH = "$jdkPath\bin;$env:PATH"

if (-not (Test-Path "$cmdlineDir\bin\sdkmanager.bat")) {
    Write-Host "Downloading Android Command-Line Tools..."
    curl.exe -L -o $destZip $sdkZipUrl

    Write-Host "Extracting Command-Line Tools..."
    $tempDir = "C:\Users\kmane\cmdline-temp"
    if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
    Expand-Archive -Path $destZip -DestinationPath $tempDir -Force

    New-Item -ItemType Directory -Path "$androidHome\cmdline-tools" -Force | Out-Null
    if (Test-Path $cmdlineDir) { Remove-Item $cmdlineDir -Recurse -Force }
    Move-Item -Path "$tempDir\cmdline-tools" -Destination $cmdlineDir -Force

    Remove-Item $tempDir, $destZip -Recurse -Force
    Write-Host "Android Command-Line Tools installed successfully to $cmdlineDir"
} else {
    Write-Host "Command-Line Tools already exist at $cmdlineDir"
}

$env:ANDROID_HOME = $androidHome
$env:ANDROID_SDK_ROOT = $androidHome
$env:PATH = "$cmdlineDir\bin;$androidHome\platform-tools;$env:PATH"

Write-Host "Accepting Android SDK licenses and installing build-tools and platforms..."
cmd.exe /c "echo y | `"$cmdlineDir\bin\sdkmanager.bat`" --licenses"
cmd.exe /c "`"$cmdlineDir\bin\sdkmanager.bat`" `"platforms;android-34`" `"build-tools;34.0.0`" `"platform-tools`""

Write-Host "Android SDK configured successfully!"
