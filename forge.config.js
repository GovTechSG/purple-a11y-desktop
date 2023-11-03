const os = require("os");

module.exports = {
  packagerConfig: {
    icon: 'public/purple-hats-logo',
    osxUniversal: { // config options for `@electron/universal`
      x64ArchFiles: "*" // replace with any relevant glob pattern
    },
    osxSign: {}, // object must exist even if empty
    osxNotarize: {
      tool: 'notarytool',
      hardenedRuntime: true,
      'gatekeeper-assess': false,
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_PASSWORD,
      teamId: process.env.APPLE_TEAM_ID
    },
    ignore: [
      'nodejs-mac-arm64',
      'nodejs-mac-x64',
      'build/electron',
      'build/purple-hats-logo',
      'errors.txt',
      'tests',
      'Test.md',
      'playwright-report',
      'installer.ps1',
      'hats_for_windows.iss',
      '.github'
    ],
    ...(os.platform() === 'darwin' && { extraResource: ["/tmp/purple-hats-portable-mac.zip"]})
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
};
