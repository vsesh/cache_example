'use strict';

const fs = require('fs');
const https = require('https');
const express = require('express');
const serveStatic = require('serve-static');

const LAST_MODIFIED_VALUE = new Date(Date.now() - 1000 * 10).toGMTString();

const app = express();

app
    .disable('etag')
    .use('/', serveStatic('static'))
    .get('/test-images', (req, res) => {
        res.set('Cache-Control', 'max-age=600, public');
        res.set('Content-Type', 'image/jpeg');
        fs.createReadStream('./static/unnamed.jpg').pipe(res);
    })
    .get('/without-cache', (req, res) => {
        res.set('Content-Type', 'application/json');
        sendRandomNumber(res);
    })
    .get('/no-cache', (req, res) => {
        res.set('Cache-Control', 'max-age=6000, no-cache');
        sendRandomNumber(res);
    })
    .get('/no-store', (req, res) => {
        res.set('Cache-Control', 'max-age=6000, no-store');
        sendRandomNumber(res);
    })
    .get('/e-tag', (req, res) => {
        const ETag = 'trustMeImAnEngineer';
        if (req.header('If-None-Match') === ETag) {
            res.status(304).end();
        } else {
            res.set('Content-Type', 'application/json');
            res.set('Etag', ETag);
            sendRandomNumber(res);
        }
    })
    .get('/last-modified', (req, res) => {
        if (req.header('If-Modified-Since') === LAST_MODIFIED_VALUE) {
            res.status(304).end();
        } else {
            res.set('Last-Modified', LAST_MODIFIED_VALUE);
            res.set('Etag', '"asdasd"');
            sendRandomNumber(res);
        }
    })
    .get('/e-tag-with-cache-control', (req, res) => {
        const ETag = 'lookAtMeImETag!';
        if (req.header('If-None-Match') === ETag) {
            res.status(304).end();
        } else {
            res.set('Content-Type', 'application/json');
            res.set('Cache-Control', 'max-age=2, public');
            res.set('Etag', ETag);
            sendRandomNumber(res);
        }
    })
    .get('/service-worker', (req, res) => {
        res.set('Content-Type', 'application/json');
        sendRandomNumber(res);
    })
    .get('/service-worker-404', (req, res) => {
        res.sendStatus(404);
    })
    .get('/service-worker-500', (req, res) => {
        res.sendStatus(500);
    })
    .get('/cache-control', (req, res) => {
        res.set('Cache-Control', 'max-age=10, public');
        res.set('Content-Type', 'application/x-javascript');// application/json');
        sendRandomNumber(res);
    })
    .use((req, res) => {
        res.sendStatus(404);
    })
    .use((err, req, res) => {
        res.sendStatus(500);
    });

https.createServer({
    key: fs.readFileSync( './secret/localhost.key' ),
    cert: fs.readFileSync( './secret/localhost.cert' ),
    requestCert: false,
    rejectUnauthorized: false
}, app).listen(3000);

app.listen(3031);

console.log('The application is running on port 3000');

function sendRandomNumber(res) {
    res.send(
        JSON.stringify({
            hey: Math.random()
        })
    );
}