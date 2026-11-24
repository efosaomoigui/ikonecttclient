const path = require('node:path');
function assertOwnedDevelopment(state, env, directory) {
  const url = new URL(env.DATABASE_URL || 'invalid:');
  if (env.NODE_ENV !== 'development' || url.protocol !== 'postgresql:' || url.hostname !== '127.0.0.1' || url.port !== String(state.port) || !Number.isInteger(state.port) || state.port < 1024 || state.port > 65535 || state.user !== 'ikonectt_development' || decodeURIComponent(url.username) !== state.user || url.pathname !== '/' + state.database || !/^ikonectt_development(?:_\d{13})?$/.test(state.database)) throw new Error('Refusing operation: environment does not match this helper-owned development database');
  if (path.resolve(state.data) !== path.join(directory,'postgres')) throw new Error('Refusing operation: cluster data path does not match the workspace');
  return url;
}
module.exports = { assertOwnedDevelopment };
