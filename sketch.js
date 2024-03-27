let sx = 0;
let sy = 0;
let sw = 80;
let sh = 80;
let u = 0, v = 0;
let animationLength = 8;
let currentFrame = 0;
let x = 200;
let moving = 0;
let xDirection = 1;
let walkingAnimation;
let spriteSheetFilenames = ["BugFella.png", "BugFellaBlue.png", "BugFellaPink.png", "DeadBugFella.png"];
let spriteSheets = [];
let totalAnimations = 25;
let animations = [];
let bugsSquished = 0; 
let remainingTime = 35; 
let gameOver = false;
let maxSquishedSprites = 10; 
let speedIncrement = 1; 
let baseSpeed = 5;
let synth;
let loop;
let squishSynth;
let missSynth;
let victorySynth;
let victoryPlayed = false;
let dingSynth;
let initialTempo;
let tempoMultiplier = 1.3;

function setupSoundtrack() {
  synth = new Tone.PolySynth({
    oscillator: {
      type: "square"
    },
    envelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.3,
      release: 0.1
    }
  }).toDestination();
  const melody = [
    { time: "0:0", note: "C4" },
    { time: "0:1", note: "D4" },
    { time: "0:2", note: "E4" },
    { time: "0:3", note: "G4" },
    { time: "1:0", note: "E4" },
    { time: "1:1", note: "D4" },
    { time: "1:2", note: "C4" },
    { time: "1:3", note: "G4" }
  ];

  loop = new Tone.Loop((time) => {
    melody.forEach((note) => {
      synth.triggerAttackRelease(note.note, "8n", time + Tone.Time(note.time));
    });
  }, "2m").start(0); 

  Tone.Transport.start();

  squishSynth = new Tone.Synth({
    oscillator: {
      type: "sine" 
    },
    envelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0,
      release: 0.1
    }
  }).toDestination();

  missSynth = new Tone.Synth({
    oscillator: {
      type: "square" 
    },
    envelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0,
      release: 0.1
    }
  }).toDestination();

  victorySynth = new Tone.PolySynth().toDestination();

    dingSynth = new Tone.Synth({
    oscillator: {
      type: "triangle" 
    },
    envelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0,
      release: 0.1
    }
  }).toDestination();
}



function preload() {
  for (let i = 0; i < spriteSheetFilenames.length; i++) {
    spriteSheets[i] = loadImage("assets/" + spriteSheetFilenames[i]);
  }
  stoneFloor = loadImage("assets/stonefloor.png");
}

function setup() {
  createCanvas(800, 800);
  imageMode(CENTER);

  
  setInterval(updateTimer, 1000);

  for (let i = 0; i < totalAnimations; i++) {
    animations[i] = walkingAnimation = new WalkingAnimation(random(spriteSheets.filter(sprite => sprite !== spriteSheets[spriteSheetFilenames.indexOf("DeadBugFella.png")])), 80, 80, random(100, 300), random(100, 300), 8, baseSpeed, 7);
  }

  playAgainButton = createButton('Play Again');
  playAgainButton.position(width / 2 - 50, height / 2 + 60);
  playAgainButton.hide();
  playAgainButton.mousePressed(restartGame);

  setupSoundtrack();
}

function draw() {
  image(stoneFloor, width / 2, height / 2, width, height);

  
  fill(0);
  textSize(16);
  textAlign(RIGHT, TOP);
  text("Bugs Squished: " + bugsSquished, width - 10, 10);
  fill(0);
  textSize(16);
  textAlign(LEFT, TOP);
  text("Time: " + remainingTime, 10, 10);

  
  for (let i = 0; i < animations.length; i++) {
    animations[i].draw();
    animations[i].move(); 
  }
  
  
  if (remainingTime === 0 && gameOver) { 
    
    for (let i = 0; i < animations.length; i++) {
      animations[i].stop();
    }

    
    if (!victoryPlayed) {
      playVictoryMelody();
      victoryPlayed = true;
    }

    
    textAlign(CENTER, CENTER);
    textSize(48);
    fill(0, 255, 0); 
    rect(width / 2 - 150, height / 2 - 100, 300, 200);
    fill(0);
    text("GAME OVER", width / 2, height / 2 - 20);
    textSize(24);
    text("Bugs Squished: " + bugsSquished, width / 2, height / 2 + 20);

    
    playAgainButton.show();
    
    
    gameOver = true;
  } else if (remainingTime > 0) {
    
    playAgainButton.hide();
  }
}



  function playVictoryMelody() {
    const initialVictoryTempo = 120; 
  
    
    Tone.Transport.bpm.value = initialVictoryTempo;
  
    const victoryMelody = [
      { note: "G5", duration: "8n" },
      { note: "E5", duration: "8n" },
      { note: "C5", duration: "8n" },
      { note: "D5", duration: "8n" },
      { note: "E5", duration: "8n" },
      { note: "G5", duration: "8n" },
    ];
  
    let timeOffset = 0;
    victoryMelody.forEach(note => {
      synth.triggerAttackRelease(note.note, note.duration, `+${timeOffset}`);
      timeOffset += Tone.Time(note.duration).toSeconds();
    });
  
    
    Tone.Transport.bpm.value = initialTempo;
  }
  
  

  function playSquishSound() {
    squishSynth.triggerAttackRelease("A4", "8n"); 
  }

  function playMissSound() {
    missSynth.triggerAttackRelease("G3", "8n"); 
  }

  function playDingSound() {
    dingSynth.triggerAttackRelease("C5", "16n"); 
  }

  function restartGame() {
    playDingSound();
    
    bugsSquished = 0;
    remainingTime = 35;
    gameOver = false;
    squishedSprites = [];
    victoryPlayed = false; 
    
    
    loop.stop();
    Tone.Transport.stop();
    Tone.Transport.cancel();
  
    
    initialTempo = 120; 
    Tone.Transport.bpm.value = initialTempo;
  
    
    Tone.Transport.cancel();
  
    
    for (let i = 0; i < animations.length; i++) {
      animations[i].restart();
    }
  
    
    loop.start(0);
    Tone.Transport.start();
  }
  

let squishedSprites = [];
// This portion deals with the players inputs on the game and how it affects gameplay, such as squishing, counting the amount of squishes, and also dealing with incrementing speed increase
function mousePressed() {
  let bugHit = false;
  if (!gameOver) {
    for (let i = 0; i < animations.length; i++) {
      let contains = animations[i].contains(mouseX, mouseY);
      if (contains && !squishedSprites.includes(animations[i])) { 
        animations[i].stop();
        animations[i].changeToDeadBug(); 
        squishedSprites.push(animations[i]); 
        bugsSquished++; 
        
        playSquishSound();
        
        for (let j = 0; j < squishedSprites.length; j++) {
          squishedSprites[j].incrementSpeed(speedIncrement);
        }
        
        if (bugsSquished > maxSquishedSprites) {
          let removedSprite = squishedSprites.shift();
          removedSprite.restart();
          for (let j = 0; j < squishedSprites.length; j++) {
            squishedSprites[j].incrementSpeed(speedIncrement);
          }
        }
        bugHit = true;
        break;
      }
    }
    if (!bugHit) {
      playMissSound();
    }
  }
}

function updateTimer() {
  if (!gameOver && remainingTime > 0) {
    remainingTime--;

    
    if (remainingTime % 5 === 0) {
      initialTempo *= tempoMultiplier;
      Tone.Transport.bpm.value *= tempoMultiplier;
    }
  } else if (remainingTime === 0 && !gameOver) {
    Tone.Transport.stop(); 
    Tone.Transport.cancel();
    gameOver = true; 
    
    
    tempoMultiplier = 1.3;
    initialTempo = 2;
    Tone.Transport.bpm.value = initialTempo * 60; 
  }
}


//the class for everything having to do with how the sprite moves and interacts on the sketch
class WalkingAnimation {
  constructor(character, sw, sh, dx, dy, animationLength, speed, framerate) {
    this.character = character;
    this.sw = sw;
    this.sh = sh;
    this.dx = dx;
    this.dy = dy;
    this.u = 0;
    this.v = 0;
    this.animationLength = animationLength;
    this.currentFrame = 0;
    this.speed = speed;
    this.originalSpeed = speed; 
    this.framerate = framerate * speed;
    this.angle = random(TWO_PI); 
    this.moving = true; 
  }

  draw() {
    if (this.character !== spriteSheets[spriteSheetFilenames.indexOf("DeadBugFella.png")]) {
      this.u = this.currentFrame % this.animationLength;
      push();
      translate(this.dx, this.dy);
      scale(1, 1);

      // This portion of the code is for calcuating rotation whenever a sprite reaches the edge of the sketch border
      let rotation = atan2(this.dy - this.previous_dy, this.dx - this.previous_dx);
      rotate(rotation);

      image(this.character, 0, 0, this.sw, this.sh, this.u * this.sw, this.v * this.sh, this.sw, this.sh);
      pop();
      let proportionalFramerate = round(frameRate() / this.framerate);
      if (frameCount % proportionalFramerate == 0) {
        this.currentFrame++;
      }
    } else {
      
      image(this.character, this.dx, this.dy, this.sw, this.sh, 0, 0, this.sw, this.sh);
    }
  }


  move() {
    if (this.moving) {
      this.previous_dx = this.dx; 
      this.previous_dy = this.dy; 

      let velocity = p5.Vector.fromAngle(this.angle).mult(this.speed);
      let new_dx = this.dx + velocity.x;
      let new_dy = this.dy + velocity.y;

     
      if (
        new_dx > this.sw / 2 &&
        new_dx < width - this.sw / 2 &&
        new_dy > this.sh / 2 &&
        new_dy < height - this.sh / 2
      ) {
        this.dx = new_dx;
        this.dy = new_dy;
      } else {
        
        this.angle = random(TWO_PI);
      }
    }
  }


  contains(x, y) {
    let insideX = x >= this.dx - 26 && x <= this.dx + 25;
    let insideY = y >= this.dy - 35 && y <= this.dy + 35;
    return insideX && insideY;
  }

  stop() {
    // This portion is the logic for stopping the movement of the sprite once it has been squished
    this.moving = false;
    this.currentFrame = 0;
  }

  changeToDeadBug() {
    // Causes the sprites that are squished to have their sprite changed to the "DeadBugFella.png"
    this.character = spriteSheets[spriteSheetFilenames.indexOf("DeadBugFella.png")];
  }
  
  // This portion causes new sprites to spawn after the max number of squished sprites is reached, allowing for the player to get more points
  restart() {
    let randomIndex = Math.floor(random(spriteSheets.length - 1)); // Exclude DeadBugFella.png
    this.character = spriteSheets[randomIndex];
    this.dx = random(100, 300);
    this.dy = random(100, 300);
    this.angle = random(TWO_PI);
    this.currentFrame = 0;
    this.moving = true;
    this.speed = this.originalSpeed; 
  }
  
  // This portion makes the bugs slightly faster with each squish. not super noticable unless you get higher squish numbers.
  incrementSpeed(amount) {
    this.speed += amount;
  }
}
