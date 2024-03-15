const TRAIL_LENGTH = 100, TRAIL_GAP = 25, TRAIL_LOOPS = 5;
const trail = [];
const mouse = {x: -50, y: -50, l: false, r: false};

document.getElementById("age").innerText = new Date(Date.now() - new Date("2002-04-30T23:02:00.0006")).getUTCFullYear() - 1970;

function chainTrail(){
  for(var n = 1; n < trail.length; n++){
    let l = Math.hypot(trail[n].x - trail[n - 1].x, trail[n].y - trail[n - 1].y);

    if(l >= TRAIL_GAP){
      trail[n].active = true;
    }
    if(trail[n].active){
      trail[n].elem.style.display = "";
    }else{
      trail[n].elem.style.display = "none";
      continue;
    }

    let vec = [
      trail[n].x - trail[n - 1].x,
      trail[n].y - trail[n - 1].y
    ];
    let norm = [vec[0] / l, vec[1] / l];

    if(n > 1){
      // trail[n].x += norm[0] * (TRAIL_GAP - l) * 0.5;
      // trail[n].y += norm[1] * (TRAIL_GAP - l) * 0.5;
      //
      // trail[n - 1].x -= norm[0] * (TRAIL_GAP - l) * 0.5;
      // trail[n - 1].y -= norm[1] * (TRAIL_GAP - l) * 0.5;

      trail[n].x += norm[0] * (TRAIL_GAP - l);
      trail[n].y += norm[1] * (TRAIL_GAP - l);

      trail[n].xv += norm[0] * (TRAIL_GAP - l) * 0.5;
      trail[n].yv += norm[1] * (TRAIL_GAP - l) * 0.5;

      trail[n - 1].xv -= norm[0] * (TRAIL_GAP - l) * 0.5;
      trail[n - 1].yv -= norm[1] * (TRAIL_GAP - l) * 0.5;

      // let d0 = trail[n - 1].xv * norm[0] + trail[n - 1].yv * norm[1];
      // let d1 = trail[n].xv * norm[0] + trail[n].yv * norm[1];
      //
      // trail[n].xv += norm[0] * (d0 - d1) * 0.5;
      // trail[n].yv += norm[1] * (d0 - d1) * 0.5;
      //
      // trail[n - 1].xv -= norm[0] * (d0 - d1) * 0.5;
      // trail[n - 1].yv -= norm[1] * (d0 - d1) * 0.5;
    }else{
      trail[n].x += norm[0] * (TRAIL_GAP - l);
      trail[n].y += norm[1] * (TRAIL_GAP - l);

      trail[n].xv += norm[0] * (TRAIL_GAP - l);
      trail[n].yv += norm[1] * (TRAIL_GAP - l);

      // let d0 = trail[n - 1].xv * norm[0] + trail[n - 1].yv * norm[1];
      // let d1 = trail[n].xv * norm[0] + trail[n].yv * norm[1];
      //
      // trail[n].xv += norm[0] * (d0 - d1);
      // trail[n].yv += norm[1] * (d0 - d1);
    }
  }
}

window.onmousemove = (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  if(!mobile && trail.length == 0){
    let d = document.createElement("DIV");
    d.className = "cursor";
    document.body.appendChild(d);
    trail.push({x: mouse.x, y: mouse.y, xv: 0, yv: 0, fixed: true, elem: d, active: true});

    for(var i = 0; i < TRAIL_LENGTH; i++){
      let d = document.createElement("DIV");
      d.className = i ? "trail" : "trail first";
      document.body.appendChild(d);
      trail.push({x: mouse.x, y: mouse.y, xv: 0, yv: 0, fixed: false, elem: d, active: false});
    }
    update();
  }
  chainTrail();
  trail[0].elem.className = "cursor" + (e.target.classList.contains("clickable") ? " hover" : "");
}

function update(){
  requestAnimationFrame(update);
  if(!mobile){
    document.getElementById("articlecontrols").style.paddingTop = Math.max(5, 54 - document.getElementById("article").scrollTop) + "px";

    let dx = trail[0].x - mouse.x, dy = trail[0].y - mouse.y;

    trail[0].x = mouse.x;
    trail[0].y = mouse.y;

    trail[0].xv = dx * 0.5 + trail[0].xv * 0.5;
    trail[0].yv = dy * 0.5 + trail[0].yv * 0.5;

    for(var n = 1; n < trail.length; n++){
      trail[n].x += trail[n].xv;
      trail[n].y += trail[n].yv;

      trail[n].xv *= 0.995;
      trail[n].yv *= 0.995;
    }

    for(var i = 0; i < TRAIL_LOOPS; i++){
      chainTrail();
    }

    for(var n = 0; n < trail.length; n++){
      trail[n].elem.style.transform = `translate(calc(${trail[n].x}px - 50%), calc(${trail[n].y}px - 50%))${n ? `rotate(${Math.atan2(trail[n - 1].y - trail[n].y, trail[n - 1].x - trail[n].x)}rad)` : ""}`;
    }
  }
}

function resume(){
  window.open("resume_12_12_23.pdf");
}

function closeresume(){
  document.getElementById("resumecont").className = "";
  history.replaceState({}, "", "/");
}

function projects(){
  tagSearch = -1;
  renderProjects(tagSearch);
  document.getElementById("projects").className = "open";
  history.replaceState({}, "", "?projects");
}

function closeprojects(){
  document.getElementById("projects").className = "";
  history.replaceState({}, "", "/");
}

function toggleSkills(){
  document.getElementById("skillspanel").className = document.getElementById("skillspanel").className == "open" ? "" : "open";
}

document.getElementById("aclose").onclick = () => {
  document.getElementById("articlecont").className = "";
  history.replaceState({}, "", "?projects");
}

window.onresize = screen.orientation.onchange = () => {
  if(orient != window.innerWidth < window.innerHeight ? "portrait" : "landscape"){
    orient = window.innerWidth < window.innerHeight ? "portrait" : "landscape";
    renderProjects(tagSearch);
  }
}
