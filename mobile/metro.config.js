const { getDefaultConfig } = require('metro-config');
module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts }
  } = await getDefaultConfig();
  return {
    watchFolders: [__dirname + '/../packages/common'],
    resolver: {
      assetExts,
      sourceExts: [...sourceExts, 'cjs', 'js', 'json', 'ts', 'tsx']
    }
  };
})();
