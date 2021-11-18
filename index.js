const sonos = require('sonos');
const express = require('express')
const network = require('quick-local-ip');

const { Sonos } = require('sonos');

const app = express()
const port = 3000;
const ipv4 = network.getLocalIP4();

app.use(express.json());
app.use('/public', express.static('public'));

app.get('/sonos', async (request, response) => {
    const Discovery = sonos.AsyncDeviceDiscovery;
    const discovery = new Discovery();

    const devices = await discovery.discoverMultiple({ timeout: 1000 });
    const parsed = devices.map(device => device.host);

    response.send(parsed);
});

app.post('/sonos/:speaker', (request, response) => {
    const filename = request.body.filename;
    const speaker = request.params.speaker;

    const device = new Sonos(speaker);

    device.play(`http://${ipv4}:3000/public/${filename}`);

    response.send();
});

app.listen(port);