const HEIGHT = 500, WIDTH = 500;

const PERSP = 0.2;
const LIMIT_TIGHTNESS = 2;

const ROT_SCALE = 0.01;
const MAX_ROT_SPEED = 0.006;

const EPSILON = 0.1;

var c = document.getElementById("c");
c.height = HEIGHT;
c.width = WIDTH;

var ctx = c.getContext("2d");

var ARM = [];

function newArm() {
  ARM = [];

  for(var i = 0; i < 4; i++) {
    var limits = [
      [-Math.PI * Math.random() ** LIMIT_TIGHTNESS, Math.PI * Math.random() ** LIMIT_TIGHTNESS],
      [-Math.PI * Math.random() ** LIMIT_TIGHTNESS, Math.PI * Math.random() ** LIMIT_TIGHTNESS],
      [-Math.PI * Math.random() ** LIMIT_TIGHTNESS, Math.PI * Math.random() ** LIMIT_TIGHTNESS]
    ];

    var offs = [
      40 * (Math.random() - 0.5),
      30 * (Math.random() + 0.5),
      40 * (Math.random() - 0.5)
    ];

    ARM.push({
      limits: limits,
      offs: offs,
      angle: [0, 0, 0]
    });
  }
}

newArm();

function mult(a, b){
  var out = [];
  for(var r = 0; r < a.length; r++) {
    out.push([]);
    for(var c = 0; c < b[0].length; c++) {
      var sum = 0;
      for(var i = 0; i < a[0].length; i++){
        sum += a[r][i] * b[i][c];
      }
      out[r].push(sum);
    }
  }

  return out;
}

function rotMatrix(rot) { // yeah, i probably have some signs flipped
  return mult(mult([      /// who cares. its just a proof of being solvable
    [1, 0, 0],
    [0, Math.cos(rot[0]), Math.sin(rot[0])],
    [0, -Math.sin(rot[0]), Math.cos(rot[0])]
  ],
  [
    [Math.cos(rot[1]), 0, Math.sin(rot[1])],
    [0, 1, 0],
    [-Math.sin(rot[1]), 0, Math.cos(rot[1])]
  ]),
  [
    [Math.cos(rot[2]), Math.sin(rot[2]), 0],
    [-Math.sin(rot[2]), Math.cos(rot[2]), 0],
    [0, 0, 1]
  ])
}

function vec3tomat(v) {
  return [[v[0]], [v[1]], [v[2]]];
}

function forwards(arm, callback) {
  var pos = [0, 0, 0];
  var mat = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];

  if(callback)
    callback(-1, pos);

  for(var i = 0; i < arm.length; i++) {
    var rot = rotMatrix(arm[i].angle);
    var offs = mult(rot, vec3tomat(arm[i].offs));
    pos = [
      pos[0] + offs[0][0],
      pos[1] + offs[1][0],
      pos[2] + offs[2][0]
    ];
    mat = mult(rot, mat);

    if(callback)
      callback(i, pos);
  }

  return pos;
}

function dist(a, b) {
  return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
}

function newTarget() {
  TARGET = [
    100 * (Math.random() - 0.5),
    100 * Math.random(),
    100 * (Math.random() - 0.5)
  ];
}

var t = 0;

var TARGET;
newTarget();

var PAUSED = true;

function render() {
  requestAnimationFrame(render);

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  if(!PAUSED){
    var cdist = dist(forwards(ARM), TARGET);

    if(cdist < 10){
      newTarget();
      cdist = dist(forwards(ARM), TARGET)
    }

    var derivs = [];
    var basePos = forwards(ARM);
    for(var i = 0; i < ARM.length; i++) {
      for(var c = 0; c < 3; c++) {
        var orig = ARM[i].angle[c];
        ARM[i].angle[c] += EPSILON;

        var newPos = forwards(ARM);
        var d = (dist(newPos, TARGET) - dist(basePos, TARGET)) / EPSILON;

        // limits are causing problems. My guess/hope is that the problem is due
        // to the random robot arms being very bad, and not due to the problem
        // being impossible without true inverses.

        //regardless, the arm shapes I'm planning to use should be much better for
        // an IK model than the truly random ones I'm doing here.

        // if(d < 0 && orig <= ARM[i].limits[c][0]){
        //   d = 0;
        // }else if(d > 0 && orig >= ARM[i].limits[c][1]){
        //   d = 0;
        // }

        derivs.push(d);
        ARM[i].angle[c] = orig;
      }
    }

    var maxClose = 0;
    for(var i = 0; i < derivs.length; i++) {
      derivs[i] *= ROT_SCALE;
      maxClose += Math.abs(derivs[i] * MAX_ROT_SPEED);
    }

    var approachScale = Math.max(1, maxClose / cdist);
    for(var i = 0; i < ARM.length; i++) {
      for(var c = 0; c < 3; c++) {
        var deltar = Math.min(Math.max(derivs[i * 3 + c], -MAX_ROT_SPEED / approachScale), MAX_ROT_SPEED / approachScale);
        ARM[i].angle[c] = ARM[i].angle[c] - deltar;
        // ARM[i].angle[c] = Math.min(Math.max(ARM[i].angle[c] - deltar, ARM[i].limits[c][0]), ARM[i].limits[c][1])
      }
    }
  }

  t += 0.01;
  var rScale = 3;
  var mat = [
    [Math.cos(t) * rScale, Math.sin(t) * PERSP * rScale],
    [0 * rScale, -1 * rScale],
    [-Math.sin(t) * rScale, Math.cos(t) * PERSP * rScale]
  ]
  var root = [WIDTH * 0.5, HEIGHT * 0.8];

  ctx.strokeStyle = "#f00";
  ctx.moveTo(root[0], root[1]);
  ctx.beginPath();
  forwards(ARM, (i, pos) => {
    var p = mult([pos], mat);
    ctx.lineTo(p[0][0] + root[0], p[0][1] + root[1]);
  });
  ctx.stroke();

  ctx.fillStyle = "#0f0";
  var tpos = mult([TARGET], mat);
  tpos = [tpos[0][0] + root[0], tpos[0][1] + root[1]];
  ctx.fillRect(tpos[0] - 5, tpos[1] - 5, 10, 10);
}

render();

function togglePause() {
  PAUSED = !PAUSED;
  document.getElementById("playpause").innerText = PAUSED ? "Play" : "Pause";
}
