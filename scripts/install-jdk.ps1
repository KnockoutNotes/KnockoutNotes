$ErrorActionPreference = "Stop"

$jdkUrl = "https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.12.1%2B1/OpenJDK21U-jdk_x64_windows_hotspot_21.0.12.1_1.zip"
$destZip = "C:\Users\kmane\jdk21.zip"
$tempDir = "C:\Users\kmane\jdk-temp"
$targetDir = "C:\Users\kmane\jdk-21"

if (-not (Test-Path $targetDir)) {
    Write-Host "Downloading OpenJDK 21 from $jdkUrl..."
    curl.exe -L -o $destZip $jdkUrl

    Write-Host "Extracting OpenJDK 21..."
    Expand-Archive -Path $destZip -DestinationPath $tempDir -Force

    $extractedFolder = Get-ChildItem -Path $tempDir -Directory | Select-Object -First 1
    Move-Item -Path $extractedFolder.FullName -Destination $targetDir -Force

    Remove-Item -Path $tempDir, $destZip -Recurse -Force
    Write-Host "OpenJDK 21 installed successfully to $targetDir"
} else {
    Write-Host "Target directory $targetDir already exists."
}

& "$targetDir\bin\java.exe" -version
