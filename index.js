import express from 'express';
import cors from 'cors';

import 'dotenv/config'

import { validateDefined, validateType } from "./helper.js";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const port = 443;
const app = express();

app.use(cors());
app.use(express.json())

app.post('/v1/signed/put', async (request, res) => {
  const { body, query } = request;
  const { file, type, size } = body;
  const { key, bucket, secret, endpoint } = query;

  validateDefined(response, key, 'key');
  validateDefined(response, file, 'file');
  validateDefined(response, type, 'type');
  validateDefined(response, size, 'size');
  validateDefined(response, bucket, 'bucket');
  validateDefined(response, secret, 'secret');
  validateDefined(response, endpoint, 'endpoint');

  validateType(response, key, 'key', 'string');
  validateType(response, file, 'file', 'string');
  validateType(response, type, 'type', 'string');
  validateType(response, size, 'size', 'number');
  validateType(response, bucket, 'bucket', 'string');
  validateType(response, secret, 'secret', 'string');
  validateType(response, endpoint, 'endpoint', 'string');
 
  const client = new S3Client({ region: "ams3", endpoint: endpoint, accessKeyId: key, secretAccessKey: secret });
  const params = { Key: file, Bucket: bucket, ContentType: type, ContentLength: size };

  const config = { expiresIn: 60 }
  const command = new PutObjectCommand(params);
  const response = await getSignedUrl(client, command, config);

  res.send(response);
});

app.post('/v1/signed/get', async (request, res) => {
  const { query } = request;
  const { key, file, bucket, secret, endpoint } = query;

  validateDefined(response, key, 'key');
  validateDefined(response, file, 'file');
  validateDefined(response, bucket, 'bucket');
  validateDefined(response, secret, 'secret');
  validateDefined(response, endpoint, 'endpoint');

  validateType(response, key, 'key', 'string');
  validateType(response, file, 'file', 'string');
  validateType(response, bucket, 'bucket', 'string');
  validateType(response, secret, 'secret', 'string');
  validateType(response, endpoint, 'endpoint', 'string');

  const client = new S3Client({ region: "ams3", endpoint: endpoint, accessKeyId: key, secretAccessKey: secret });
  const params = { Key: file, Bucket: bucket };

  const config = { expiresIn: 60 }
  const command = new GetObjectCommand(params);
  const response = await getSignedUrl(client, command, config);

  res.send(response);
});

app.listen(port, () =>
  console.log(`Bot-Ross helper listening on port ${port}!`),
);