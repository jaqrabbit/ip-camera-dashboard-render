const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const onvif = require('node-onvif');

const streamDir = path.join(__dirname, 'streams');
if (!fs.existsSync(streamDir)) fs.mkdirSync(streamDir);

const streams = {};

function startStream(name, url) {
    const output = path.join(streamDir, `${name}.m3u8`);
    if (streams[name]) return;
    const ffmpeg = spawn('ffmpeg', [
        '-i', url,
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-tune', 'zerolatency',
        '-f', 'hls',
        '-hls_time', '1',
        '-hls_list_size', '3',
        '-hls_flags', 'delete_segments',
        output
    ]);
    streams[name] = ffmpeg;
    ffmpeg.stderr.on('data', data => console.error(`[${name}] ${data}`));
    ffmpeg.on('close', () => {
        delete streams[name];
        console.log(`${name} stream ended`);
    });
}

async function rebootCamera(url) {
    const device = new onvif.OnvifDevice({ xaddr: url });
    await device.init();
    await device.reboot();
}

module.exports = { startStream, rebootCamera };