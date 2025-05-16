const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const ffmpegManager = require('./ffmpeg-manager');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/streams', express.static(path.join(__dirname, 'streams')));

let cams = [];
const camsPath = path.join(__dirname, 'cams.json');

function loadCams() {
    if (fs.existsSync(camsPath)) {
        cams = JSON.parse(fs.readFileSync(camsPath));
        cams.forEach(cam => ffmpegManager.startStream(cam.name, cam.url));
    }
}

function saveCams() {
    fs.writeFileSync(camsPath, JSON.stringify(cams, null, 2));
}

app.get('/dashboard', (req, res) => {
    res.render('dashboard', { cams });
});

app.get('/admin', (req, res) => {
    res.render('admin', { cams, error: null });
});

app.post('/admin', (req, res) => {
    const { password, name, url } = req.body;
    if (password !== ADMIN_PASSWORD) {
        return res.render('admin', { cams, error: 'Incorrect password' });
    }
    if (name && url) {
        cams.push({ name, url });
        saveCams();
        ffmpegManager.startStream(name, url);
    }
    res.redirect('/admin');
});

app.post('/reboot', (req, res) => {
    const { password, url } = req.body;
    if (password !== ADMIN_PASSWORD) {
        return res.status(403).send('Forbidden');
    }
    ffmpegManager.rebootCamera(url)
        .then(() => res.send('Camera rebooted'))
        .catch(err => res.status(500).send(err.toString()));
});

loadCams();
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});