/* eslint-env mocha */

const assert = require("assert");
const fs = require("fs");
const child_process = require("child_process");
const rimraf = require("rimraf");

describe("index.js", function () {
  beforeEach(function () {
    rimraf.sync("test/dist");
  });

  it("should generate icon files", function (done) {
    this.timeout(10000);

    const paths = [
      "icons/mac/icon.icns",
      "icons/win/icon.ico",
      "icons/png/16x16.png",
      "icons/png/24x24.png",
      "icons/png/32x32.png",
      "icons/png/48x48.png",
      "icons/png/64x64.png",
      "icons/png/128x128.png",
      "icons/png/256x256.png",
      "icons/png/512x512.png",
      "icons/png/1024x1024.png",
    ];

    const child = child_process.fork(
      "./index.js",
      ["--input", "test/test.png", "--output", "test/dist"],
      { silent: true }
    );

    child.on("exit", (code) => {
      assert.equal(code, 0, "Exit code");
      for (const path of paths) {
        assert.ok(fs.existsSync("./test/dist/" + path), path);
      }

      done();
    });
  });

  it("should generate icon files with flatten option", function (done) {
    this.timeout(10000);

    const paths = [
      "icons/icon.icns",
      "icons/icon.ico",
      "icons/16x16.png",
      "icons/24x24.png",
      "icons/32x32.png",
      "icons/48x48.png",
      "icons/64x64.png",
      "icons/128x128.png",
      "icons/256x256.png",
      "icons/512x512.png",
      "icons/1024x1024.png",
    ];

    const child = child_process.fork(
      "./index.js",
      ["--input", "test/test.png", "--output", "test/dist", "--flatten"],
      { silent: true }
    );

    child.on("exit", (code) => {
      assert.equal(code, 0, "Exit code");
      for (const path of paths) {
        assert.ok(fs.existsSync("./test/dist/" + path), path);
      }

      done();
    });
  });
});
