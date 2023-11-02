'use strict';

const getRunCmdEnv = require('./utils/getRunCmdEnv');

function runCmd(cmd, _args, fn) {
  const args = _args || [];
  cmd = cmd === 'npm' ? process.platform === 'win32' ? 'npm.cmd' : 'npm' : cmd
  const runner = require('child_process').spawn(cmd, args, {
    // keep color
    stdio: 'inherit',
    env: getRunCmdEnv(),
  });

  runner.on('close', code => {
    if (fn) {
      fn(code);
    }
  });
}

module.exports = runCmd;
