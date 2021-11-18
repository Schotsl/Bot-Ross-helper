const sonos = require('sonos');
const huev3 = require('node-hue-api').v3;
const express = require('express');
const network = require('quick-local-ip');

const { Sonos } = require('sonos');

const GroupLightState = huev3.model.lightStates.GroupLightState

const app = express()
const port = 3000;
const ipv4 = network.getLocalIP4();
const user = 'HRnPq6nm2hWWYxPxIZGMka9k5-ngJ07NK5gb7tky';

app.use(express.json());
app.use('/public', express.static('public'));

app.get('/hue/light', async (request, response) => {
    const bridge = await huev3.api.createLocal('192.168.2.21').connect(user);
    const lights = await bridge.lights.getAll();
    const parsed = lights.map(light => { return { id: light.data.id, name: light.data.name }});

    response.send(parsed);
});

app.get('/hue/group', async (request, response) => {
    const bridge = await huev3.api.createLocal('192.168.2.21').connect(user);
    const groups = await bridge.groups.getAll();
    const parsed = groups.map(group => { return { id: group.data.id, name: group.data.name }});

    response.send(parsed);
});

app.post('/hue/group', async (request, response) => {
    const bridge = await huev3.api.createLocal('192.168.2.21').connect(user);
    const state = new GroupLightState().alertShort();
  
    await bridge.groups.setGroupState(1, state)

    response.send();
});

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

async function startup() {
    const bridge = await huev3.api.createLocal('192.168.2.21').connect(user);
    const device = new Sonos('192.168.2.196');
    const state = new GroupLightState().effectColorLoop();

    device.play(`http://${ipv4}:3000/public/startup.mp3`);
    bridge.groups.setGroupState(1, state)
}

startup();

app.listen(port);