; Script generated by the Inno Setup Script Wizard.
; SEE THE DOCUMENTATION FOR DETAILS ON CREATING INNO SETUP SCRIPT FILES!
; NOTE: The value of AppId uniquely identifies this application. Do not use the same AppId value in installers for other applications.
; (To generate a new GUID, click Tools | Generate GUID inside the IDE.)
[SETUP]
AppId={{75a53a2c-a9e1-4d9b-be27-f8c96f9315c5}
AppName=Purple A11y Desktop
AppVersion=0.9.0
AppVerName=Purple A11y Desktop
AppPublisher=GovTech
AppPublisherURL=https://github.com/GovTechSG/purple-a11y-desktop
AppSupportURL=https://github.com/GovTechSG/purple-a11y-desktop
AppUpdatesURL=https://github.com/GovTechSG/purple-a11y-desktop
DefaultDirName=C:\Program Files\Purple A11y Desktop
DisableDirPage=yes
ChangesAssociations=yes
DisableProgramGroupPage=yes
; LicenseFile=Purple A11y-win32-x64\LICENSE
; Uncomment the following line to run in non administrative install mode (install for current user only.)
;PrivilegesRequired=lowest
Compression=lzma
SolidCompression=yes
WizardStyle=modern
UninstallBeforeInstall={10A741B8-E330-4DC5-A86C-7F7B8DE775A9}_is1

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "Purple A11y-win32-x64\*"; DestDir: "\\?\{app}\Purple A11y Frontend"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "D:\a\Purple A11y Backend\*"; DestDir: "\\?\{app}\Purple A11y Backend"; Flags: ignoreversion recursesubdirs createallsubdirs
; NOTE: Don't use "Flags: ignoreversion" on any shared system files

[Icons]
Name: "{autoprograms}\Purple A11y Desktop"; Filename: "{app}\Purple A11y Frontend\Purple A11y.exe"
Name: "{autodesktop}\Purple A11y Desktop"; Filename: "{app}\Purple A11y Frontend\Purple A11y.exe"; Tasks: desktopicon

; [Run]
; Filename: "{app}\Purple A11y Frontend\Purple A11y.exe"; Description: "{cm:LaunchProgram,Purple A11y Desktop}"; Flags: nowait postinstall skipifsilent

[UninstallDelete]
Type: filesandordirs; Name: "{app}\Purple A11y Frontend"
Type: filesandordirs; Name: "{app}\Purple A11y Backend"

[InstallDelete]
Type: filesandordirs; Name: "{app}\Purple A11y Frontend"
Type: filesandordirs; Name: "{app}\Purple A11y Backend"
