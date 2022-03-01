interface Drawable {
  draw(): void;
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

  constructor(x: number, y: number, spriteId: string) {
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
  pos: Point = { x: 200, y: 200 }

  constructor() {
    this.sprite = createSprite(200, 200);
    this.sprite.setAnimation("player");
    this.sprite.scale = 0.3;
  }

  draw() {}
}

class Enemy extends GameSprite {
  constructor() {
    super(200, 200, "enemy");
    this.sprite.scale = 0.4;
  }
}
class SpriteManager {
  sprites: GameSprite[] = [];

  constructor(private game: Game) {}

  add(sprite: GameSprite) {
    this.sprites.push(sprite);
  }

  draw() {
    this.sprites.forEach((sprite) => {
      const playerPos = this.game.player.pos;
      sprite.sprite.x = (sprite.pos.x - playerPos.x) + 200;
      sprite.sprite.y = (sprite.pos.y - playerPos.y) + 200;
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
    if (keyDown("up")) {
      if (pos.y - this.speed > 0) {
        pos.y -= this.speed;
      }
    }
    if (keyDown("down")) {
      if (pos.y + this.speed < this.maxArea.y) {
        pos.y += this.speed;
      }
    }
    if (keyDown("left")) {
      if (pos.x - this.speed > 0) {
        pos.x -= this.speed;
      }
    }
    if (keyDown("right")) {
      if (pos.x + this.speed < this.maxArea.x) {
        pos.x += this.speed;
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
    "1_3"
  ]);
  spriteManager: SpriteManager = new SpriteManager(this);
  uiManager: UIManager = new UIManager(this);

  player: Player = new Player();
  setup() {
    this.spriteManager.add(new Enemy());
    setInterval(this.backgroundLoop, 1000);
  }

  backgroundLoop() {}

  draw() {
    this.spriteManager.draw();
    this.backgroundManager.draw();
    drawSprites();
    this.uiManager.draw();
    fill("gray");
    noStroke();
    text(
      `${this.player.pos.x} ${this.player.pos.y}`,
      10,
      10
    );
    const localPos = globalToLocal(this.player.pos);
    text(`${Math.round(localPos.x)} ${Math.round(localPos.y)}`, 10, 30);
    const chunk = globalToChunk(this.player.pos);
    text(`${chunk.c} ${chunk.r}`, 10, 50);
  }
}
const game = new Game();
game.setup();
function draw() {
  game.draw();
}
