$backendTag = $args[0];

$purpleA11yDirectory = 'C:\Program Files\Purple A11y Desktop';
$purpleA11yBackendDirectory = 'C:\Program Files\Purple A11y Desktop\Purple A11y Backend';
$purpleA11yBackendPHDirectory = 'C:\Program Files\Purple A11y Desktop\Purple A11y Backend\purple-hats';
$backendReleaseUrl = "https://github.com/GovTechSG/purple-hats/releases/download/$backendTag/purple-a11y-portable-windows.zip";
$backendZipPath = 'C:\Program Files\Purple A11y Desktop\purple-a11y-portable-windows.zip';
$backendUnzipPath = 'C:\Program Files\Purple A11y Desktop\Purple A11y Backend';

$command = 
@" 
if (-not (Test-Path -Path '$purpleA11yDirectory' -PathType Container)) {
    New-Item -ItemType Directory -Path '$purpleA11yDirectory' | Out-Null
}

if (-not (Test-Path -Path '$purpleA11yBackendDirectory' -PathType Container)) {
    New-Item -ItemType Directory -Path '$purpleA11yBackendDirectory' | Out-Null
}

if (-not (Test-Path -Path '$purpleA11yBackendPHDirectory' -PathType Container)) {
    New-Item -ItemType Directory -Path '$purpleA11yBackendPHDirectory' | Out-Null
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
