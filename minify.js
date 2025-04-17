const fs = require("fs");

var text = fs.readFileSync("index.html").toString();

var map = {};
var min = -1;
var max = -1;
for(var i = 0; i < text.length; i++){
  map[text[i]] = map[text[i]] ? map[text[i]] + 1 : 1;
  if(min == -1 || text.charCodeAt(i) < min)
    min = text.charCodeAt(i);
  if(max == -1 || text.charCodeAt(i) > max)
    max = text.charCodeAt(i);
}
console.log(Object.keys(map).length);
console.log(min, max);
console.log(text.length);
console.log(map);

// const inject = `
// <script>
// window.onload=_=>{
// var b=0,t=document.body.innerHTML,o="";
// console.log(document.body.innerHTML);
// for(var i = 0; b < t.length * 8; b += 7) {
// var c1 = t.charCodeAt(Math.floor(b / 8)), c2 = t.charCodeAt(Math.ceil(b / 8));
// console.log(Math.ceil(b / 8), c2, (8 - b % 8));
// console.log((c1 << (b % 8)) & 0x7f, (c2 >> (8 - b % 8)) & 0x7f, ((c1 << (b % 8)) | (c2 >> (8 - b % 8))) & 0x7f);
// o += String.fromCharCode(((c1 << (b % 8)) | (c2 >> (8 - b % 8))) & 0x7f);
// }
// console.log(t);
// console.log(o);
// document.body.innerHTML=o;
// }
// </script>
// `.trim();

var outtext = "";
var space = false;
for(var i = 0; i < text.length; i++){
  var ls = space;
  space = false;
  if(text[i] == " " || text[i] == "\n" || text[i] == "\r") {
    text[i] = " ";
    space = true;
  }
  if(!space || !ls)
    outtext += text[i];
}

// outtext = "hello, world!"

var o = [], b = 0;
for(var i = 0; i < outtext.length; i++){
  var c = outtext.charCodeAt(i) & 0x7f;
  if(Math.ceil(b / 8) >= o.length)
    o.push(0);

  // console.log(String.fromCharCode(o.charCodeAt(Math.floor(b / 8)) | ((c >> (b % 8)) & 0x7f)));

  o[Math.floor(b / 8)] = o[Math.floor(b / 8)] | ((c >> (b % 8)) & 0xff);
  o[Math.ceil(b / 8)] = o[Math.ceil(b / 8)] | ((c << (8 - b % 8)) & 0xff);
  b += 7;
}

console.log(o);

// fs.writeFileSync("min.html", inject);
fs.writeFile("MIN", new Uint8Array(o), e => console.err);
