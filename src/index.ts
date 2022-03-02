interface Drawable {
  draw(): void;
}

enum Facing {
  UP = "up",
  DOWN = "down",
  LEFT = "left",
  RIGHT = "right",
}

class Background {
  sprite: Sprite;
  bgId: string;
  parsedBgLoc: Chunk;
  constructor(bgId: string) {
    this.bgId = bgId;
    this.parsedBgLoc = parseBgId(bgId);
    this.sprite = createSprite(200, 200);
    this.sprite.setAnimation(bgId);
    this.sprite.visible = false;
  }
}

class GameSprite implements Drawable {
  sprite: Sprite;
  pos: Point;
  manager: SpriteManager;

  constructor(manager: SpriteManager, x: number, y: number, spriteId: string) {
    this.manager = manager;
    this.pos = { x, y };
    this.sprite = createSprite(x, y);
    this.sprite.setAnimation(spriteId);
  }

  draw() {
    if (mousePressedOver(this.sprite)) {
      this.onClick();
    }
  }

  onClick() {}
}

class Player implements Drawable {
  sprite: Sprite;
  pos: Point = { x: 200, y: 200 };
  lastDirection: Facing = Facing.DOWN;
  isAttacking = false;
  isDead = false;

  constructor(private game: Game) {
    this.sprite = createSprite(200, 200);
    this.sprite.setAnimation("player-down");
    this.sprite.scale = 1;
  }

  draw() {
    const newDirection = this.getNewDirection();
    if (newDirection !== this.lastDirection) {
      this.lastDirection = newDirection;
      if (this.isAttacking) {
        this.setAttackAnimation();
      } else {
        this.setWalkAnimation();
      }
    }
    if (keyWentDown("space")) {
      console.log("attack");

      this.attack();
    }

    if (this.isAttacking) {
      if (this.sprite.isTouching(this.game.enemy.sprite)) {
        this.game.enemy.die();
      }
    }

    if (this.sprite.isTouching(this.game.enemy.sprite)) {
      setTimeout(() => {
        if (this.sprite.isTouching(this.game.enemy.sprite)) {
          this.die();
        }
      }, 200);
    }
  }

  attack() {
    if (!this.isAttacking) {
      this.isAttacking = true;
      this.setAttackAnimation();
      setTimeout(() => {
        this.setWalkAnimation();
        this.isAttacking = false;
      }, 100);
    }
  }

  die() {
    this.isDead = true;
    this.sprite.visible = false;
    this.game.enemy.doFollow = false;
    this.game.lastScore = this.game.score;
    if(this.game.score > this.game.highScore) {
      this.game.highScore = this.game.score;
    }
    this.game.enemy.die();
    this.game.score = 0;
    this.pos.x = 200;
    this.pos.y = 200;
    setTimeout(() => {
      this.isDead = false;
      this.sprite.visible = true;
      this.game.enemy.doFollow = true;
    }, 1000);
  }

  setAttackAnimation() {
    this.sprite.setAnimation(`player-attack-${this.lastDirection}`);
  }

  setWalkAnimation() {
    this.sprite.setAnimation(`player-${this.lastDirection}`);
  }

  getNewDirection(): Facing {
    const pressedButtons = this.game.backgroundManager.pressedKeys;

    if (pressedButtons.up) {
      return Facing.UP;
    }
    if (pressedButtons.down) {
      return Facing.DOWN;
    }
    if (pressedButtons.left) {
      return Facing.LEFT;
    }
    if (pressedButtons.right) {
      return Facing.RIGHT;
    }

    return this.lastDirection;
  }
}

class Enemy extends GameSprite {
  doFollow = true;

  followSpeed = 0.03;
  maxSpeed = 3;

  constructor(manager: SpriteManager) {
    super(manager, 600, 600, "enemy");
    this.sprite.scale = 1;
  }

  draw() {
    super.draw();
    //If follow is enabled, follow the player
    if (this.doFollow) {
      const relativePos = subtract(this.manager.game.player.pos, this.pos);
      this.pos.x =
        this.pos.x + Math.min(relativePos.x * this.followSpeed, this.maxSpeed);
      this.pos.y =
        this.pos.y + Math.min(relativePos.y * this.followSpeed, this.maxSpeed);
    }
  }

  die() {
    const maxArea = this.manager.game.backgroundManager.maxArea;
    this.pos.x = randomNumber(0, maxArea.x);
    this.pos.y = randomNumber(0, maxArea.y);
    this.manager.game.score++;
  }
}
class SpriteManager {
  sprites: GameSprite[] = [];

  constructor(public game: Game) {}

  add(sprite: GameSprite) {
    this.sprites.push(sprite);
  }

  draw() {
    this.sprites.forEach((sprite) => {
      const playerPos = this.game.player.pos;
      sprite.sprite.x = sprite.pos.x - playerPos.x + 200;
      sprite.sprite.y = sprite.pos.y - playerPos.y + 200;
      sprite.draw();
    });
  }
}
type Sides = { left: number; right: number; top: number; bottom: number };
type Chunk = { c: number; r: number };
type Point = { x: number; y: number };
type Size = { w: number; h: number };
type Area = Point & Size;

function globalToChunk(pos: Point): Chunk {
  return { c: Math.floor(pos.x / 400) + 1, r: Math.floor(pos.y / 400) + 1 };
}

function globalToLocal(pos: Point): Point {
  const decimalPos: Point = { x: pos.x / 400, y: pos.y / 400 };
  const remainingPosDecimal: Point = {
    x: decimalPos.x % 1,
    y: decimalPos.y % 1,
  };
  const returnObj = {
    x: remainingPosDecimal.x * 400,
    y: remainingPosDecimal.y * 400,
  };
  // console.log(
  //   `Original pos: ${JSON.stringify(pos)}\nDecimal pos: ${JSON.stringify(
  //     decimalPos
  //   )}\nRemaining pos: ${JSON.stringify(returnObj)}`
  // );

  return returnObj;
}

function parseBgId(bgId: string): Chunk {
  try {
    const parsed = bgId.split("_");
    return { c: Number(parsed[0]), r: Number(parsed[1]) };
  } catch (e) {
    throw new Error(`Invalid background id: ${bgId}`);
  }
}
function stringifyBgId(chunk: Chunk): string {
  return `${chunk.c}_${chunk.r}`;
}

function subtract(a: Point, b: Point): Point {
  return { x: a.x - b.x, y: a.y - b.y };
}

abstract class UIWidget implements Drawable {
  visible: boolean = true;

  draw: () => void;

  constructor(public size: Area, public space: Area) {
    this.draw = function () {
      // console.log(this);

      if (this.visible) {
        this.drawWidget();
      }
    };
  }

  abstract drawWidget: () => void;
}

class TextWidget extends UIWidget {
  text: string = "";
  drawWidget: () => void;

  constructor(size: Area, space: Area, public margin: Sides) {
    super(size, space);
    this.drawWidget = function () {
      // console.log(
      //   `drawing text to ${this.size.x + this.space.x}, ${
      //     this.size.y + this.space.y
      //   }`
      // );
      fill("black");
      noStroke();
      text(
        this.text,
        this.size.x + this.space.x + this.margin.left,
        this.size.y + this.space.y + this.margin.top,
        this.size.w,
        this.size.h
      );
    };
  }
}

class ProgressWidget extends UIWidget {
  private _progress: number = 0.5;

  public get progress() {
    return this._progress;
  }
  public set progress(value: number) {
    if (value < 1 && value > 0) {
      this._progress = value;
    }
  }

  drawWidget: () => void;

  constructor(size: Area, space: Area) {
    super(size, space);
    // console.log(this.draw);
    this.drawWidget = function (): void {
      fill("gray");
      stroke("gray");
      rect(
        this.size.x + this.space.x,
        this.size.y + this.space.y,
        this.size.w,
        this.size.h
      );
      fill("green");
      rect(
        this.size.x + this.space.x,
        this.size.y + this.space.y,
        this.size.w * this.progress,
        this.size.h
      );
    };
  }
}

abstract class UIScreen implements Drawable {
  abstract readonly title: string;
  abstract readonly size: Area;
  private widgets: UIWidget[] = [];
  constructor() {}

  addWidget<T extends UIWidget>(widget: T): T {
    this.widgets.push(widget);
    return widget;
  }

  draw() {
    fill("gray");
    stroke("black");
    rect(this.size.x, this.size.y, this.size.w, this.size.h);

    for (let i = 0; i < this.widgets.length; i++) {
      // console.log(i);

      const e = this.widgets[i];
      // console.log(e.draw);

      e.draw();
    }
  }
}

class SkillsScreen extends UIScreen {
  title: string = "Skills";
  size: Area = { x: 200 - 50, y: 200 - 50, w: 100, h: 100 };
  testText: TextWidget;
  testProgress: ProgressWidget;
  constructor() {
    super();
    this.testText = this.addWidget(
      new TextWidget({ x: 0, y: 0, w: 100, h: 100 }, this.size, {
        left: 10,
        top: 10,
        right: 0,
        bottom: 0,
      })
    );
    this.testProgress = this.addWidget(
      new ProgressWidget({ x: 10, y: 50, w: 100, h: 20 }, this.size)
    );
    // console.log(this.testProgress.draw);

    this.testText.text = "Hello";
  }
}

class UIManager implements Drawable {
  screen: UIScreen | null = null;

  skillsScreen = new SkillsScreen();

  constructor(private game: Game) {}

  draw() {
    if (keyWentDown("e")) {
      if (this.screen == null) {
        this.screen = this.skillsScreen;
        console.log("Opened Skills screen");
      } else if (this.screen.title === this.skillsScreen.title) {
        this.screen = null;
        console.log("Closed Skills screen");
      }
    }

    if (this.screen) {
      this.screen.draw();
    }
  }
}

class BackgroundManager implements Drawable {
  readonly speed: number = 5;

  readonly maxArea: Point = { x: 0, y: 0 };

  readonly pressedKeys = { left: false, right: false, up: false, down: false };

  loc: Chunk;

  bgs: { [key: string]: Background } = {};

  toHide: Sprite[] = [];

  constructor(private game: Game, startingLoc: string, bgs: string[]) {
    for (let i = 0; i < bgs.length; i++) {
      const e = bgs[i];
      const bg = new Background(e);
      this.bgs[e] = bg;
      if (bg.parsedBgLoc.c * 400 > this.maxArea.x) {
        this.maxArea.x = bg.parsedBgLoc.c * 400;
      }
      if (bg.parsedBgLoc.r * 400 > this.maxArea.y) {
        this.maxArea.y = bg.parsedBgLoc.r * 400;
      }
    }
    // console.log(JSON.stringify(this.maxArea));

    this.loc = parseBgId(startingLoc);
  }
  draw() {
    this.toHide.forEach((v) => (v.visible = false));
    this.toHide = [];
    background("white");
    const pos = this.game.player.pos;
    if (!this.game.player.isDead) {
      if (keyDown("up")) {
        if (pos.y - this.speed > 0) {
          pos.y -= this.speed;
        }
        this.pressedKeys.up = true;
      } else {
        this.pressedKeys.up = false;
      }
      if (keyDown("down")) {
        if (pos.y + this.speed < this.maxArea.y) {
          pos.y += this.speed;
        }
        this.pressedKeys.down = true;
      } else {
        this.pressedKeys.down = false;
      }
      if (keyDown("left")) {
        if (pos.x - this.speed > 0) {
          pos.x -= this.speed;
        }
        this.pressedKeys.left = true;
      } else {
        this.pressedKeys.left = false;
      }
      if (keyDown("right")) {
        if (pos.x + this.speed < this.maxArea.x) {
          pos.x += this.speed;
        }
        this.pressedKeys.right = true;
      } else {
        this.pressedKeys.right = false;
      }
    }
    // this.bgs["1-1"].sprite.x = -this.pos.x + 400;
    // this.bgs["1-1"].sprite.y = -this.pos.y + 400;

    this.moveBackgrounds();
    // console.log(JSON.stringify(viewableBgs.map(v => this.stringifyBgId(v))));
  }

  getViewableBgs(pos: Point): Chunk[] {
    const chunks: Chunk[] = [];

    const localPos = globalToLocal(pos);
    const localChunk = globalToChunk(pos);

    chunks.push(localChunk);

    if (localPos.y < 200) {
      chunks.push({ c: localChunk.c, r: localChunk.r - 1 });
    }
    if (localPos.y > 200) {
      chunks.push({ c: localChunk.c, r: localChunk.r + 1 });
    }

    if (localPos.x < 200) {
      chunks.push({ c: localChunk.c - 1, r: localChunk.r });
    }
    if (localPos.x > 200) {
      chunks.push({ c: localChunk.c + 1, r: localChunk.r });
    }

    if (localPos.y < 200 && localPos.x < 200) {
      chunks.push({ c: localChunk.c - 1, r: localChunk.r - 1 });
    }
    if (localPos.y > 200 && localPos.x > 200) {
      chunks.push({ c: localChunk.c + 1, r: localChunk.r + 1 });
    }

    if (localPos.y < 200 && localPos.x > 200) {
      chunks.push({ c: localChunk.c + 1, r: localChunk.r - 1 });
    }
    if (localPos.y > 200 && localPos.x < 200) {
      chunks.push({ c: localChunk.c - 1, r: localChunk.r + 1 });
    }

    return chunks;
  }

  moveBackgrounds() {
    const pos = this.game.player.pos;
    const localPos = globalToLocal(pos);
    const viewableBgs = this.getViewableBgs(pos);

    const currentChunk = globalToChunk(pos);

    //console.log(JSON.stringify(pos))
    //console.log(JSON.stringify(viewableBgs))
    //console.log(Object.keys(this.bgs))
    // console.log(viewableBgs.map((v) => this.stringifyBgId(v)));

    viewableBgs.forEach((v) => {
      const diff = this.subtractChunks(v, currentChunk);
      const bgId = stringifyBgId(v);
      if (bgId in this.bgs) {
        // console.log("Moving bg " + bgId);

        const bg = this.bgs[bgId];
        this.toHide.push(bg.sprite);
        bg.sprite.visible = true;

        bg.sprite.x = 400 - localPos.x + 400 * diff.c;
        bg.sprite.y = 400 - localPos.y + 400 * diff.r;

        // console.log(`Diff: ${diff.c}, ${diff.r}`);

        // console.log(`Bg ${bgId} at ${bg.sprite.x}, ${bg.sprite.y}`);
      }
    });
  }

  /**
   *
   * @param a first chunk
   * @param b second chunk
   * @returns subtracts b from a
   */
  subtractChunks(a: Chunk, b: Chunk): Chunk {
    return { c: a.c - b.c, r: a.r - b.r };
  }
}

class Game {
  backgroundManager: BackgroundManager = new BackgroundManager(this, "1_1", [
    "1_1",
    "1_2",
    "1_3",
  ]);
  spriteManager: SpriteManager = new SpriteManager(this);
  uiManager: UIManager = new UIManager(this);

  player: Player = new Player(this);
  enemy = new Enemy(this.spriteManager);

  score = 0;
  lastScore = 0;
  highScore = 0;
  setup() {
    this.spriteManager.add(this.enemy);
    setInterval(this.backgroundLoop, 1000);
  }

  backgroundLoop() {}

  draw() {
    this.spriteManager.draw();
    this.backgroundManager.draw();
    this.player.draw();
    drawSprites();
    this.uiManager.draw();

    if(this.player.isDead){
      textSize(32);
      text("You died", 140, 180);
      text(`Score: ${this.lastScore}`, 140, 220);
      text(`High Score: ${this.highScore}`, 115, 260);
    }
    
    fill("gray");
    noStroke();
    textSize(12)
    text(`${this.player.pos.x} ${this.player.pos.y}`, 10, 10);
    const localPos = globalToLocal(this.player.pos);
    text(`${Math.round(localPos.x)} ${Math.round(localPos.y)}`, 10, 30);
    const chunk = globalToChunk(this.player.pos);
    text(`${chunk.c} ${chunk.r}`, 10, 50);
    textSize(30)
    text(`${this.score}`, 300, 30);
  }
}
const game = new Game();
game.setup();
function draw() {
  game.draw();
}
