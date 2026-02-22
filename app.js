/*
  Dart Arena X 🎯
  Developer: Finn
  Version: 1.0
*/

let players=[];
let current=0;
let startPoints=501;
let legsToWin=3;
let botActive=false;
let botDifficulty="medium";

const checkout={
170:"T20 T20 Bull",167:"T20 T19 Bull",164:"T20 T18 Bull",
161:"T20 T17 Bull",160:"T20 T20 D20",158:"T20 T20 D19",
157:"T20 T19 D20",40:"D20",32:"D16",24:"D12",
16:"D8",8:"D4",4:"D2",2:"D1"
};

document.getElementById("playerCount").addEventListener("change",updateNames);
document.getElementById("botMode").addEventListener("change",function(){
  document.getElementById("botSettings").style.display=this.checked?"block":"none";
  if(this.checked){ document.getElementById("playerCount").value=1; updateNames(); }
});
window.onload=updateNames;

function updateNames(){
  const count=document.getElementById("playerCount").value;
  const div=document.getElementById("names");
  div.innerHTML="";
  for(let i=0;i<count;i++){
    div.innerHTML+=`<input id="name${i}" placeholder="Spieler ${i+1}"><input type="color" id="color${i}" value="#00ff99"><br>`;
  }
}

function startGame(){
  players=[]; current=0;
  startPoints=parseInt(document.getElementById("startPoints").value);
  legsToWin=parseInt(document.getElementById("legsToWin").value);
  botActive=document.getElementById("botMode").checked;
  botDifficulty=document.getElementById("botDifficulty").value;

  if(botActive){
    players.push(createPlayer(0));
    players.push({name:"Dart Bot 🤖",color:"#ff4b2b",points:startPoints,legs:0,darts:0,throws:[],bot:true});
  } else {
    const count=parseInt(document.getElementById("playerCount").value);
    for(let i=0;i<count;i++) players.push(createPlayer(i));
  }

  document.getElementById("setup").style.display="none";
  document.getElementById("game").style.display="block";
  render();
}

function createPlayer(i){
  return {name:document.getElementById(`name${i}`).value||`Spieler ${i+1}`,color:document.getElementById(`color${i}`).value,points:startPoints,legs:0,darts:0,throws:[]};
}

function submitTurn(){
  const score=parseInt(document.getElementById("scoreInput").value);
  const doubleOut=document.getElementById("doubleOut").checked;
  if(isNaN(score)) return;
  processTurn(players[current],score,doubleOut);
  document.getElementById("scoreInput").value="";
  nextPlayer();
}

function processTurn(player,score,doubleOut){
  let before=player.points;
  player.points-=score;
  player.darts+=3;
  player.throws.push(score);

  if(player.points<0 || (player.points===0 && !doubleOut) || player.points===1) player.points=before;

  if(player.points===0){
    player.legs++;
    confetti();
    alert(`${player.name} gewinnt ein Leg 🎉`);

    if(player.legs>=legsToWin){ alert(`${player.name} gewinnt das Match 🏆`); endGame(); return; }

    players.forEach(p=>{p.points=startPoints;p.throws=[];p.darts=0;});
  }

  render();
  animateBarGlow();
}

function nextPlayer(){
  if(players.some(p=>p.legs>=legsToWin)) return;
  current=(current+1)%players.length;
  render();
  if(players[current].bot) setTimeout(botTurn,800);
}

function botTurn(){
  let bot=players[current];
  let total=0;
  for(let i=0;i<3;i++){
    total+=Math.floor(Math.random()*60+1 * {easy:0.4,medium:0.65,hard:0.85}[botDifficulty]);
  }
  processTurn(bot,total,true);
  nextPlayer();
}

function render(){
  document.getElementById("current").innerText=players[current].name;
  const div=document.getElementById("players"); div.innerHTML="";
  players.forEach((p,i)=>{
    div.innerHTML+=`<div class="player ${i===current?'active':''}" style="border-left:6px solid ${p.color}"><b>${p.name}</b><br>Punkte: ${p.points} | Legs: ${p.legs}<br>${checkout[p.points]?`<div class="checkout">Checkout: ${checkout[p.points]}</div>`:""}</div>`;
  });
  renderDashboard();
}

function renderDashboard(){
  const div=document.getElementById("dashboard"); div.innerHTML="";
  players.forEach(p=>{
    let percent=((startPoints-p.points)/startPoints)*100;
    let color=p.points<50?"red":p.points<150?"yellow":"green";
    let avg=p.darts?((startPoints-p.points)/(p.darts/3)).toFixed(1):0;
    div.innerHTML+=`<div class="dashboard-player">
      <b>${p.name}</b><br>
      Darts: ${p.darts}<br>
      Punkte: ${startPoints-p.points}<br>
      Ø pro Dart: ${avg}<br>
      <div class="bar ${color}" style="width:${percent}%"></div>
      </div>`;
  });
}

function animateBarGlow(){
  document.querySelectorAll('.bar').forEach(bar=>{
    bar.classList.add('glow');
    setTimeout(()=>bar.classList.remove('glow'),300);
  });
}

function confetti(){
  for(let i=0;i<40;i++){
    const c=document.createElement("div");
    c.style.position="fixed"; c.style.width="8px"; c.style.height="8px";
    c.style.background=`hsl(${Math.random()*360},100%,50%)`;
    c.style.left=Math.random()*100+"vw"; c.style.top="-10px"; c.style.borderRadius="50%";
    document.body.appendChild(c);
    let fall=setInterval(()=>{c.style.top=parseInt(c.style.top)+5+"px"; if(parseInt(c.style.top)>window.innerHeight){clearInterval(fall);c.remove();}},20);
  }
}

function endGame(){ if(confirm("Spiel wirklich beenden?")) location.reload(); }
