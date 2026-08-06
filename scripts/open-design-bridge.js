const { execSync, spawn } = require('child_process');
const path = require('path');

const OD_CLI_PATH = "C:\\Users\\priya\\AppData\\Local\\Programs\\Open Design\\resources\\app\\prebundled\\daemon\\daemon-cli.mjs";

/**
 * Executes an Open Design AI CLI command
 */
function runOpenDesign(args = []) {
  try {
    const cmd = `node "${OD_CLI_PATH}" ${args.join(' ')}`;
    const output = execSync(cmd, { encoding: 'utf-8' });
    return output;
  } catch (err) {
    console.error('Open Design Execution Error:', err.message);
    throw err;
  }
}

/**
 * Returns available Open Design system directions
 */
function getDesignDirections() {
  const jsonOutput = runOpenDesign(['tools', 'directions', '--json']);
  return JSON.parse(jsonOutput);
}

/**
 * Returns full design tokens (fonts, OKLCH palette, posture) for a specific Open Design direction
 */
function getDirectionSpec(directionId) {
  const jsonOutput = runOpenDesign(['tools', 'directions', '--id', directionId, '--json']);
  return JSON.parse(jsonOutput);
}

/**
 * Starts the Open Design MCP Stdio Server
 */
function startOpenDesignMCP() {
  console.log('Starting Open Design MCP Stdio Server...');
  const mcpProcess = spawn('node', [OD_CLI_PATH, 'mcp'], {
    stdio: 'inherit'
  });
  return mcpProcess;
}

module.exports = {
  runOpenDesign,
  getDesignDirections,
  getDirectionSpec,
  startOpenDesignMCP
};

if (require.main === module) {
  console.log('🎉 Connected to Open Design AI Daemon CLI v0.16.1!');
  console.log('\nAvailable Design System Directions:');
  const directions = getDesignDirections();
  directions.forEach(d => console.log(` - [${d.id}]: ${d.label}`));
}
