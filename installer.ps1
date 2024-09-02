$PHbackendUrl = "https://github.com/GovTechSG/purple-a11y/releases/latest/download/purple-a11y-portable-windows.zip"
$PHfrontendUrl = "https://github.com/GovTechSG/purple-a11y-desktop/releases/latest/download/purple-a11y-desktop-windows-prod.zip"
$BEdestinationPath = "$env:APPDATA\PHLatest.zip"
$BEextractPath = "$env:APPDATA\Purple A11y Backend"
$FEdestinationPath = "$env:APPDATA\Purple A11y-win32-x64.zip"
$FEextractPath = "$env:APPDATA\Purple A11y-win32-x64"
$innoSetupCompilerUrl = "https://jrsoftware.org/download.php/is.exe"
$innoSetupCompilerPath = "$env:APPDATA\iscc.exe"
$current_path = (Get-Item -Path ".\" -Verbose).FullName

Invoke-WebRequest -Uri $PHbackendUrl -OutFile $BEdestinationPath

Expand-Archive -Path $BEdestinationPath -DestinationPath $BEextractPath -Force

Remove-Item -Path $BEdestinationPath

echo "Purple A11y Backend extracted to $BEextractPath."

Invoke-WebRequest -Uri $PHfrontendUrl -OutFile $FEdestinationPath

Expand-Archive -Path $FEdestinationPath -DestinationPath $FEextractPath -Force

Remove-Item -Path $FEdestinationPath

echo "Purple A11y Frontend extracted to $FEextractPath."

# Invoke-WebRequest -Uri $innoSetupCompilerUrl -OutFile $innoSetupCompilerPath

# echo "InnoSetup compiler extracted to $innoSetupCompilerPath."

# Start-Process "$env:APPDATA\iscc.exe" -ArgumentList "/LOG /O`"$env:APPDATA" `"C:\Program Files\Purple A11y Desktop\Purple A11y Frontend\a11y_for_windows.iss`"" -Wait -NoNewWindow 

#echo "Inno Setup compiler has been installed."

Move-Item -Path "$current_path\a11y_for_windows.iss" -Destination "$env:APPDATA\a11y_for_windows.iss" -Force

echo "Moved Inno Setup script from $current_path to $env:APPDATA"
