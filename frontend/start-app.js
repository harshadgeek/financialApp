import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backendDir = path.resolve(__dirname, '../../backend');

console.log('Starting backend...');

const isWin = process.platform === 'win32';
const cmdPath = isWin ? process.env.comspec || 'C:\\Windows\\System32\\cmd.exe' : 'sh';

const backendProcess = spawn(cmdPath, isWin ? ['/c', 'start-backend.bat'] : ['-c', './start-backend'], {
    cwd: backendDir,
    env: process.env,
});

let backendPort = null;

backendProcess.stdout.on('data', (data) => {
    const output = data.toString();
    process.stdout.write(`[Backend]: ${output}`);

    const portMatch = output.match(/BACKEND_DYNAMIC_PORT=(\d+)/);
    if (portMatch && !backendPort) {
        backendPort = portMatch[1];
        console.log(`\n\n✅ Backend successfully started on dynamic port: ${backendPort}`);

        console.log('Starting frontend...');
        const frontendProcess = spawn('npm.cmd', ['run', 'dev'], {
            cwd: __dirname,
            env: { ...process.env, VITE_BACKEND_PORT: backendPort },
            stdio: 'inherit'
        });

        frontendProcess.on('close', (code) => {
            console.log(`Frontend exited with code ${code}`);
            backendProcess.kill();
            process.exit(code);
        });
    }
});

backendProcess.stderr.on('data', (data) => {
    console.error(`[Backend Error]: ${data.toString()}`);
});

backendProcess.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
    process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log("Shutting down processes...");
    backendProcess.kill();
    process.exit();
});
