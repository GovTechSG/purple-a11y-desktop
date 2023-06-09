#define MyAppName "Purple HATS Desktop"
#define MyAppVersion "0.0.13.0"
#define MyAppPublisher "GovTech"
#define MyAppURL "https://github.com/GovTechSG/purple-hats-desktop"
#define MyAppExeName "Purple HATS.exe"
#define MyAppAssocName MyAppName + ""
#define MyAppAssocExt ".myp"
#define MyAppAssocKey StringChange(MyAppAssocName, " ", "") + MyAppAssocExt

[Setup]
AppId={{D873C282-3D28-4930-B290-41D4220C2691}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppVerName=hats for Windows
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName=C:\Program Files\{#MyAppName}
DisableProgramGroupPage=yes
LicenseFile={autodesktop}\Purple HATS-win32-x64\LICENSE
; Uncomment the following line to run in non administrative install mode (install for current user only.)
;PrivilegesRequired=lowest
OutputBaseFilename=hats_for_windows
Compression=lzma
SolidCompression=yes
; WizardStyle=modern

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "{autodesktop}\Purple HATS-win32-x64\*"; DestDir: "{app}\Purple HATS Frontend"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "{userappdata}\Purple HATS Backend\*"; DestDir: "{app}\Purple HATS Backend"; Flags: ignoreversion recursesubdirs createallsubdirs
; NOTE: Don't use "Flags: ignoreversion" on any shared system files

[Icons]
Name: "{autoprograms}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\Purple HATS Frontend\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent