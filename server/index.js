import React from 'react';
import bodyParser from 'body-parser';
import express from 'express';
import compression from 'compression';
import { renderToString } from 'react-dom/server';
import { ServerStyleSheet, StyleSheetManager } from 'styled-components';
import fs from 'fs';
import path from 'path';
import requestIp from 'request-ip';
import './ignore-styles';
import App from '../src/app';

const app = express();

app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  const filePath = path.resolve(__dirname, '..', 'public', 'index.html');
  const ip = requestIp.getClientIp(req);
  fs.readFile(filePath, 'utf8', (err, htmlData) => {
    if (err) {
      return res.status(404).end();
    }

    const sheet = new ServerStyleSheet();

    const markup = renderToString(
      <StyleSheetManager sheet={sheet.instance}>
          <App />
      </StyleSheetManager>,
    );

    const styleTags = sheet.getStyleTags();

    const RenderedApp = process.env.NODE_ENV === 'development' ?
      htmlData : htmlData
      .replace('<style id="serverStyleTags"></style>', styleTags)
      .replace('<div id="root"></div>', `<div id="root">${markup}</div>`)
      .replace('{{remoteAddress}}', ip)
    ;

    res.send(RenderedApp);
  });
});

app.use(express.static(path.join(__dirname, '..', 'static')));
app.use(express.static(path.join(__dirname, '..', 'public')));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});

app.on('error', (error) => {
  throw error;
});