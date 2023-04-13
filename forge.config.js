module.exports = {
  packagerConfig: {
    icon: 'public/purple-hats-logo',
    osxUniversal: { // config options for `@electron/universal`
      x64ArchFiles: "*" // replace with any relevant glob pattern
    },
    ignore: [
      '/build/electron',
      '/build/purple-hats-logo'
    ]
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
