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

  constructor(x: number, y: number, spriteId: string) {
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

class Player extends GameSprite {
  constructor() {
    super(200, 200, "player");
    this.sprite.scale = 0.3;
  }

  override draw() {
    super.draw();
  }
}

class SpriteManager {
  sprites: GameSprite[] = [];

  constructor() {}

  add(sprite: GameSprite) {
    this.sprites.push(sprite);
  }

  draw() {
    this.sprites.forEach((sprite) => {
      sprite.draw();
    });
  }
}

type Chunk = { c: number; r: number };
type Point = { x: number; y: number };

function globalToChunk(pos: Point): Chunk {
  return { c: Math.floor(pos.x / 400) + 1, r: Math.floor(pos.y / 400) + 1 };
}

function globalToLocal(pos: Point): Point {
  const decimalPos: Point = { x: pos.x / 400, y: pos.y / 400 };
  const remainingPosDecimal: Point = {
    x: decimalPos.x % 1,
    y: decimalPos.y % 1,
  };

  return { x: remainingPosDecimal.x * 400, y: remainingPosDecimal.y * 400 };
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

class UIWidget implements Drawable {
  draw() {
      
  }
}

class UIScreen implements Drawable {
  widgets: UIWidget[] = [];
  constructor() {
    this.widgets.push(new UIWidget());
  }

  draw() {
    this.widgets.forEach((widget) => {
      widget.draw();
    });
  }
}

class UIManager implements Drawable {
  screen: UIScreen | null = null;


  draw() {
      if(this.screen){
        this.screen.draw();
      }
  }
}


class BackgroundManager implements Drawable {
  readonly speed: number = 5;

  readonly maxArea: Point = { x: 0, y: 0 };

  loc: Chunk;

  bgs: { [key: string]: Background } = {};

  pos: Point = { x: 200, y: 200 };

  toHide: Sprite[] = [];

  constructor(startingLoc: string, bgs: string[]) {
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
    console.log(JSON.stringify(this.maxArea));

    this.loc = parseBgId(startingLoc);
  }
  draw() {
    this.toHide.forEach((v) => (v.visible = false));
    this.toHide = [];
    background("white");
    if (keyDown("up")) {
      if (this.pos.y - this.speed > 0) {
        this.pos.y -= this.speed;
      }
    }
    if (keyDown("down")) {
      if (this.pos.y + this.speed < this.maxArea.y) {
        this.pos.y += this.speed;
      }
    }
    if (keyDown("left")) {
      if (this.pos.x - this.speed > 0) {
        this.pos.x -= this.speed;
      }
    }
    if (keyDown("right")) {
      if (this.pos.x + this.speed < this.maxArea.x) {
        this.pos.x += this.speed;
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
    const pos = this.pos;
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

        bg.sprite.x = 400 - localPos.x + (400 * diff.c);
        bg.sprite.y = 400 - localPos.y + (400 * diff.r);

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

enum Side {
  UP = 0,
  DOWN = 1,
  LEFT = 2,
  RIGHT = 3,
}

class Game {
  spriteManager: SpriteManager = new SpriteManager();
  backgroundManager: BackgroundManager = new BackgroundManager("1_1", [
    "1_1",
    "1_2",
  ]);
  uiManager: UIManager = new UIManager();

  setup() {
    this.spriteManager.add(new Player());
  }

  draw() {
    this.spriteManager.draw();
    this.backgroundManager.draw();
    drawSprites();
    this.uiManager.draw()
    text(
      `${this.backgroundManager.pos.x} ${this.backgroundManager.pos.y}`,
      10,
      10
    );
    const localPos = globalToLocal(this.backgroundManager.pos);
    text(`${Math.round(localPos.x)} ${Math.round(localPos.y)}`, 10, 30);
  }
}
const game = new Game();
game.setup();
function draw() {
  game.draw();
}
