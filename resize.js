const sharp = require("sharp");
const fs = require("fs");

if (!fs.existsSync("./images"))
  fs.mkdirSync("./images");

fs.readdirSync("./rawimages").forEach(file => {
  sharp("./rawimages/" + file, {animated: true, limitInputPixels: false})
    .resize(file.includes("thmb") ? 500 : undefined)
    .webp({
      // nearLossless: true
    })
    .toFile(`./images/${file.split(".")[0]}.${file.includes(".gif") ? "gif" : "webp"}`, (err, info) => {
      if(err){
        console.log(err);
      }else{
        console.log(`\x1b[92mImage ${file} resized\x1b[0m`);
      }
    });
});
