$downloadUrl = "https://github.com/GovTechSG/purple-hats/releases/latest/download/purple-hats-portable-windows.zip"
$destinationPath = "$env:APPDATA\PHLatest.zip"
$extractPath = "$env:APPDATA\Purple HATS Backend"
$innoSetupCompilerUrl = "https://jrsoftware.org/download.php/is.exe"
$innoSetupCompilerPath = "$env:APPDATA\iscc.exe"
$current_path = (Get-Item -Path ".\" -Verbose).FullName

Invoke-WebRequest -Uri $downloadUrl -OutFile $destinationPath

Expand-Archive -Path $destinationPath -DestinationPath $extractPath -Force

Remove-Item -Path $destinationPath

echo "Purple HATS Backend extracted to $extractPath."

Invoke-WebRequest -Uri $innoSetupCompilerUrl -OutFile $innoSetupCompilerPath

echo "InnoSetup compiler extracted to $innoSetupCompilerPath."

# Start-Process "$env:APPDATA\iscc.exe" -ArgumentList "/LOG /O`"$env:APPDATA" `"C:\Program Files\Purple HATS Desktop\Purple HATS Frontend\hats_for_windows.iss`"" -Wait -NoNewWindow 

#echo "Inno Setup compiler has been installed."

Move-Item -Path "$current_path\hats_for_windows.iss" -Destination "$env:APPDATA\hats_for_windows.iss" -Force

echo "Moved Inno Setup script from $current_path to $env:APPDATA"
