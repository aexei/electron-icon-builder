#!/usr/bin/env node

const Jimp = require("jimp");
const args = require("args");
const path = require("path");
const fs = require("fs");
const icongen = require("icon-gen");

global.atob = require("atob");
global.btoa = require("btoa");
const changeDPI = require("changedpi");

var pngSizes = [16, 24, 32, 48, 64, 128, 256, 512, 1024];

args
  .option("input", "Input PNG file. Recommended (1024x1024)", "./icon.png")
  .option("output", "Folder to output new icons folder", "./")
  .option("flatten", "Flatten output structure for electron-builder", false);

const flags = args.parse(process.argv);

// correct paths
var input = path.resolve(process.cwd(), flags.input);
var output = path.resolve(process.cwd(), flags.output);
var flatten = flags.flatten;
var o = output;
var oSub = path.join(o);
var PNGoutputDir = flatten ? oSub : path.join(oSub, "png");
var macOutputDir = flatten ? oSub : path.join(oSub, "mac");
var winOutputDir = flatten ? oSub : path.join(oSub, "win");

createPNGs(0).catch((err) => {
  console.log(err);
});

// calls itself recursivly
async function createPNGs(position) {
  const info = await createPNG(pngSizes[position]);
  await changeDpi(info);
  console.log("Created " + info);

  if (position < pngSizes.length - 1) {
    // keep going
    createPNGs(position + 1);
  } else {
    // done, generate the icons
    ensureDirExists(macOutputDir);
    await icongen(PNGoutputDir, macOutputDir, {
      icns: { name: "icon" },
      report: true,
    });

    ensureDirExists(winOutputDir);
    await icongen(PNGoutputDir, winOutputDir, {
      ico: { name: "icon" },
      report: true,
    });

    // rename the PNGs to electron format
    console.log("Renaming PNGs to Electron Format");
    await renamePNGs(0);
  }
}

async function renamePNGs(position) {
  var startName = pngSizes[position] + ".png";
  var endName = pngSizes[position] + "x" + pngSizes[position] + ".png";
  fs.renameSync(
    path.join(PNGoutputDir, startName),
    path.join(PNGoutputDir, endName)
  );
  console.log("Renamed " + startName + " to " + endName);

  if (position < pngSizes.length - 1) {
    // not done yet. Run the next one
    renamePNGs(position + 1);
  } else {
    console.log("\n ALL DONE");
  }
}

async function createPNG(size) {
  var fileName = size.toString() + ".png";

  // make dir if does not exist
  ensureDirExists(output);
  ensureDirExists(oSub);
  if (!flatten) {
    ensureDirExists(PNGoutputDir);
  }

  const image = await Jimp.read(input);
  image.resize(size, size, Jimp.RESIZE_NEAREST_NEIGHBOR);
  await image.writeAsync(path.join(PNGoutputDir, fileName));

  return path.join(PNGoutputDir, fileName);
}

async function changeDpi(imagePath) {
  const image = await Jimp.read(imagePath);
  const b64 = await image.getBase64Async(Jimp.AUTO);
  const b64_highdpi = changeDPI.changeDpiDataUrl(b64, 144);
  const base64Image = b64_highdpi.split(";base64,").pop();
  const buffer = Buffer.from(base64Image, "base64");
  fs.writeFileSync(imagePath, buffer);
}

function ensureDirExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
}
