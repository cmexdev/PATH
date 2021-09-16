#define MyAppName "PATH"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "Owen Magill"
#define MyAppURL "https://cmexdev.github.io/PATH"
#define MyAppExeName "PATH.exe"

[Setup]
AppId={{5EC17F9A-14FF-4A10-B2E5-AD08ABFFDEB4}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\{#MyAppName}
DisableDirPage=yes
DisableProgramGroupPage=yes
OutputDir=C:\code\PATH\release
OutputBaseFilename=PATH-Setup-1.0.0
Compression=lzma
SolidCompression=yes
WizardStyle=modern

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "C:\code\PATH\PATH.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "C:\code\PATH\node.exe"; DestDir: "{app}";
Source: "C:\code\PATH\node_modules\*"; DestDir: "{app}\node_modules\"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "C:\code\PATH\index.js"; DestDir: "{app}"; Flags: ignoreversion
Source: "C:\code\PATH\package.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "C:\code\PATH\README.md"; DestDir: "{app}"; Flags: ignoreversion
Source: "C:\code\PATH\game\*"; DestDir: "{app}\game\"; Excludes: "games\*"; Flags: ignoreversion 
; NOTE: Don't use "Flags: ignoreversion" on any shared system files

[Icons]
Name: "{autoprograms}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

