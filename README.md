### node-sonycam

[![build](https://github.com/arcatdmz/node-sonycam/workflows/npm-publish/badge.svg)](https://github.com/arcatdmz/node-sonycam/actions?query=workflow%3Anpm-publish)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Farcatdmz%2Fnode-sonycam.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Farcatdmz%2Fnode-sonycam?ref=badge_shield)
[![npm version](https://img.shields.io/npm/v/node-sonycam)](https://www.npmjs.com/package/node-sonycam)

**node-sonycam** is a Node.js library to fetch images from Sony DSLRs (e.g., ILCE-QX1) written in TypeScript.

**node-sonycam** はソニー製デジタル一眼から画像を取得するための Node.js 用ライブラリで、 TypeScript で記述されています。

- npm package: https://www.npmjs.com/package/node-sonycam
- API document: https://arcatdmz.github.io/node-sonycam/

### Usage / 使い方

```javascript
const location = await discoverSonyDevice();
console.log("Discovered service spec location:", location);

const spec = await fetchSonyCamSpec(location);
const serviceUrl = findSonyCamUrl(spec);
console.log("Found Sony camera service url:", serviceUrl);

const sonyCam = new SonyCam(serviceUrl);
await sonyCam.connect();

const liveviewUrl = await sonyCam.startLiveview();
await sonyCam.fetchLiveview();
console.log("Liveview URL:", liveviewUrl);

sonyCam.addListener("image", imageListener);
await new Promise((r) => setTimeout(r, 10 * 1000));

sonyCam.removeListener("image", imageListener);
await sonyCam.stopLiveview();
await sonyCam.disconnect();
```

More examples can be found in the following repositories.

実例は以下のリポジトリで見つけられます。

- https://github.com/arcatdmz/node-sonycam-example-socketio
- https://github.com/arcatdmz/node-sonycam-example-ffmpeg

### API Documentation / API ドキュメント

All of the exported classes and interfaces are listed in [TypeDoc](https://arcatdmz.github.io/node-sonycam/).

このモジュールが export しているすべてのクラスとインタフェースは [TypeDoc](https://arcatdmz.github.io/node-sonycam/) で閲覧できます。

### Credits / 開発者

- [Jun Kato](https://junkato.jp)
- Elijah Parker ([/timelapseplus/node-sony-camera](https://github.com/timelapseplus/node-sony-camera), 2017)
- Ikuo Terado ([/eqot/RemoteCamera](https://github.com/eqot/RemoteCamera), 2013-2014)

---

Copyright (c) 2022 Jun Kato. Released under the [MIT license](https://opensource.org/licenses/MIT).
