#!/usr/bin/env bash

npm create wrangler --input ./wrangler.tmpl.js --output ./wrangler.toml

parcel build html/index.pug --dist-dir dist --no-content-hash

parcel build importer/index.ts --dist-dir dist --no-content-hash --no-source-maps
