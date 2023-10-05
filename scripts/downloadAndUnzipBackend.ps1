$backendTag = $args[0];

$purpleHatsDirectory = 'C:\Program Files\Purple HATS Desktop';
$purpleHatsBackendDirectory = 'C:\Program Files\Purple HATS Desktop\Purple HATS Backend';
$purpleHatsBackendPHDirectory = 'C:\Program Files\Purple HATS Desktop\Purple HATS Backend\purple-hats';
$backendReleaseUrl = "https://github.com/GovTechSG/purple-hats/releases/download/$backendTag/purple-hats-portable-windows.zip";
$backendZipPath = 'C:\Program Files\Purple HATS Desktop\purple-hats-portable-windows.zip';
$backendUnzipPath = 'C:\Program Files\Purple HATS Desktop\Purple HATS Backend';

$command = 
@" 
if (-not (Test-Path -Path '$purpleHatsDirectory' -PathType Container)) {
    New-Item -ItemType Directory -Path '$purpleHatsDirectory' | Out-Null
}

if (-not (Test-Path -Path '$purpleHatsBackendDirectory' -PathType Container)) {
    New-Item -ItemType Directory -Path '$purpleHatsBackendDirectory' | Out-Null
}

if (-not (Test-Path -Path '$purpleHatsBackendPHDirectory' -PathType Container)) {
    New-Item -ItemType Directory -Path '$purpleHatsBackendPHDirectory' | Out-Null
}

Write-Host 'Downloading zip file to $backendZipPath'
(New-Object System.Net.WebClient).DownloadFile('$backendReleaseUrl', '$backendZipPath');
Write-Host 'Download complete, unzipping to  $backendUnzipPath'
Expand-Archive -Path '$backendZipPath' -DestinationPath '$backendUnzipPath' -Force;

if (Test-Path -Path '$backendZipPath' -PathType Leaf) {
    Remove-Item -Path '$backendZipPath' -Force
}
"@


Start-Process powershell.exe -Verb RunAs -Wait -ArgumentList "-Command", $command 
