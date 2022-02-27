"use strict";

// Linter: https://www.jslint.com/

const express = require("express");
const cors = require("cors");
const hue = require("node-hue-api").v3;

const { GetObjectCommand, PutObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const { validateDefined, validateType } = require("./helper.js");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { response } = require("express");

const port = 443;
const app = express();

app.use(cors());
app.use(express.json());

app.post("/v1/signed/put", async (request, response) => {
  const { body, query } = request;
  const { file, type, size } = body;
  const { key, bucket, secret, endpoint } = query;

  if (!validateDefined(response, key, "key")) return;
  if (!validateDefined(response, file, "file")) return;
  if (!validateDefined(response, type, "type")) return;
  if (!validateDefined(response, size, "size")) return;
  if (!validateDefined(response, bucket, "bucket")) return;
  if (!validateDefined(response, secret, "secret")) return;
  if (!validateDefined(response, endpoint, "endpoint")) return;

  if (!validateType(response, key, "key", "string")) return;
  if (!validateType(response, file, "file", "string")) return;
  if (!validateType(response, type, "type", "string")) return;
  if (!validateType(response, size, "size", "number")) return;
  if (!validateType(response, bucket, "bucket", "string")) return;
  if (!validateType(response, secret, "secret", "string")) return;
  if (!validateType(response, endpoint, "endpoint", "string")) return;

  try {
    const client = new S3Client({ region: "ams3", endpoint: endpoint, accessKeyId: key, secretAccessKey: secret });
    const params = { Key: file, Bucket: bucket, ContentType: type, ContentLength: size };

    const config = { expiresIn: 60 }
    const command = new PutObjectCommand(params);
    const signed = await getSignedUrl(client, command, config);

    response.status(200);
    response.send(signed);
  } catch (error) {
    response.status(500);
    response.send(error.message);
  };
});

app.post("/v1/signed/get", async (request, response) => {
  const { query } = request;
  const { key, file, bucket, secret, endpoint } = query;

  if (!validateDefined(response, key, "key")) return;
  if (!validateDefined(response, file, "file")) return;
  if (!validateDefined(response, bucket, "bucket")) return;
  if (!validateDefined(response, secret, "secret")) return;
  if (!validateDefined(response, endpoint, "endpoint")) return;

  if (!validateType(response, key, "key", "string")) return;
  if (!validateType(response, file, "file", "string")) return;
  if (!validateType(response, bucket, "bucket", "string")) return;
  if (!validateType(response, secret, "secret", "string")) return;
  if (!validateType(response, endpoint, "endpoint", "string")) return;

  try {
    const client = new S3Client({ region: "ams3", endpoint: endpoint, accessKeyId: key, secretAccessKey: secret });
    const params = { Key: file, Bucket: bucket };

    const config = { expiresIn: 60 }
    const command = new GetObjectCommand(params);
    const signed = await getSignedUrl(client, command, config);

    response.status(200);
    response.send(signed);
  } catch (error) {
    response.status(500);
    response.send(error.message);
  };
});

app.get("/v1/hue/light", async (request, response, next) => {
  const { query } = request;
  const { ip, key } = query;

  if (!validateDefined(response, "ip", ip)) return;
  if (!validateDefined(response, "key", key)) return;

  if (!validateType(response, "ip", ip, "string")) return;
  if (!validateType(response, "key", key, "string")) return;

  try {
    const bridge = await hue.api.createLocal(ip).connect(key);
    const lights = await bridge.lights.getAll();
    const parsed = lights.map(light => { return { id: light.data.id, name: light.data.name }});

    response.status(200);
    response.send(parsed);
  } catch (error) {
    response.status(500);
    response.send(error.message);
  };
});

app.get("/v1/hue/group", async (request, response) => {
  const { query } = request;
  const { ip, key } = query;

  if (!validateDefined(response, "ip", ip)) return;
  if (!validateDefined(response, "key", key)) return;

  if (!validateType(response, "ip", ip, "string")) return;
  if (!validateType(response, "key", key, "string")) return;

  try {
    const bridge = await hue.api.createLocal("192.168.2.21").connect(user);
    const groups = await bridge.groups.getAll();
    const parsed = groups.map(group => { return { id: group.data.id, name: group.data.name }});

    response.status(200);
    response.send(parsed);
  } catch (error) {
    response.status(500);
    response.send(error.message);
  };
});

app.post("/v1/hue/alert", async (request, response) => {
  const { query } = request;
  const { ip, key } = query;

  if (!validateDefined(response, "ip", ip)) return;
  if (!validateDefined(response, "key", key)) return;

  if (!validateType(response, "ip", ip, "string")) return;
  if (!validateType(response, "key", key, "string")) return;

  try {
    const bridge = await hue.api.createLocal(ip).connect(key);
    const state = new hue.model.lightStates.GroupLightState().alertShort();

    await bridge.groups.setGroupState(10, state)

    response.status(200);
    response.send({});
  } catch (error) {
    response.status(500);
    response.send(error.message);
  };
});

app.listen(port, () =>
  console.log(`Bot-Ross helper listening on port ${port}!`),
);