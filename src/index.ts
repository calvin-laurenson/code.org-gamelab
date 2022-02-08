interface Drawable {
  draw(): void;
}

class Background {
  sprite: Sprite;

  constructor(bgId: string) {
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

class BackgroundManager implements Drawable {
  readonly speed: number = 5;

  loc: Chunk;

  bgs: { [key: string]: Background } = {};

  pos: Point = { x: 200, y: 200 };

  toHide: Sprite[] = []

  constructor(startingLoc: string, bgs: string[]) {
    for (let i = 0; i < bgs.length; i++) {
      const e = bgs[i];
      const bg = new Background(e);
      this.bgs[e] = bg;
    }
    this.loc = this.parseBgId(startingLoc);

   
  }
  draw() {
    this.toHide.forEach(v => v.visible = false)
    this.toHide = []
    background("white");
    if (keyDown("up")) {
      this.pos.y -= this.speed;
    }
    if (keyDown("down")) {
      this.pos.y += this.speed;
    }
    if (keyDown("left")) {
      this.pos.x -= this.speed;
    }
    if (keyDown("right")) {
      this.pos.x += this.speed;
    }
    // this.bgs["1-1"].sprite.x = -this.pos.x + 400;
    // this.bgs["1-1"].sprite.y = -this.pos.y + 400;

    this.moveBackgrounds();
    // console.log(JSON.stringify(viewableBgs.map(v => this.stringifyBgId(v))));
  }

  private parseBgId(bgId: string): Chunk {
    try {
      const parsed = bgId.split("_");
      return { c: Number(parsed[0]), r: Number(parsed[1]) };
    } catch (e) {
      throw new Error(`Invalid background id: ${bgId}`);
    }
  }
  stringifyBgId(chunk: Chunk): string {
    return `${chunk.c}_${chunk.r}`;
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
    const localPos = globalToLocal(pos)
    const viewableBgs = this.getViewableBgs(pos);

    const currentChunk = globalToChunk(pos);

    //console.log(JSON.stringify(pos))
    //console.log(JSON.stringify(viewableBgs))
    //console.log(Object.keys(this.bgs))
    console.log(viewableBgs.map((v) => this.stringifyBgId(v))); 

    viewableBgs.forEach((v) => {
      const diff = this.subtractChunks(v, currentChunk);
      const bgId = this.stringifyBgId(v);
      if (bgId in this.bgs) {
        // console.log("Moving bg " + bgId);
        
        const bg = this.bgs[bgId];
        this.toHide.push(bg.sprite);
        bg.sprite.visible = true

        bg.sprite.x = ((localPos.x) + (400 * diff.c));
        bg.sprite.y = ((localPos.y) + (400 * diff.r));  

        console.log(`Diff: ${diff.c}, ${diff.r}`);
        
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
  RIGHT = 3
}

class Game {
  spriteManager: SpriteManager = new SpriteManager();
  backgroundManager: BackgroundManager = new BackgroundManager("1_1", [
    "1_1",
    "1_2",
  ]);

  setup() {
    this.spriteManager.add(new Player());
  }

  draw() {
    this.spriteManager.draw();
    this.backgroundManager.draw();
    drawSprites();
    text(
      `${this.backgroundManager.pos.x} ${this.backgroundManager.pos.y}`,
      10,
      10
    );
  }
}
const game = new Game();
game.setup();
function draw() {
  game.draw();
}
