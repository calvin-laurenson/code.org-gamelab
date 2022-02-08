
//var sprite = createSprite()
declare function createSprite(x?: number, y?: number, w?: number, h?: number): Sprite

//createEdgeSprites()


declare class Sprite {
    
    //sprite.setSpeedAndDirection()
    //sprite.getDirection()
    //sprite.getSpeed()
    //sprite.isTouching()
    isTouching(sprite: Sprite): boolean
    //sprite.destroy()
    //sprite.pointTo()
    //sprite.bounce()
    //sprite.bounceOff()
    //sprite.collide()
    //sprite.displace()
    //sprite.overlap()
    //sprite.setAnimation()
    setAnimation(animation: string): void
    //sprite.mirrorX()
    //sprite.mirrorY()
    //sprite.nextFrame()
    //sprite.pause()
    //sprite.play()
    //sprite.setCollider()
    //sprite.setFrame()
    //sprite.setVelocity()
    //sprite.height
    height: number
    //sprite.width
    width: number
    //sprite.getScaledWidth()
    //sprite.getScaledHeight()
    //sprite.debug
    debug: boolean
    //sprite.depth
    //sprite.lifetime
    //sprite.bounciness
    //sprite.rotateToDirection
    //sprite.rotation
    rotation: number
    //sprite.rotationSpeed
    rotationSpeed: number
    //sprite.scale
    scale: number
    //sprite.shapeColor
    //sprite.tint
    //sprite.velocityX
    velocityX: number
    //sprite.velocityY
    velocityY: number
    //sprite.visible
    visible: boolean
    //sprite.x
    x: number
    //sprite.y
    y: number
    //sprite.alpha
}


//var group = createGroup()

class Group {

//group.add()
//group.remove()
//group.clear()
//group.contains()
//group.get()
//group.isTouching()
//group.bounce()
//group.bounceOff()
//group.collide()
//group.displace()
//group.overlap()
//group.maxDepth()
//group.minDepth()
//group.destroyEach()
//group.pointToEach()
//group.setAnimationEach()
//group.setColorEach()
//group.setTintEach()
//group.setColliderEach()
//group.setDepthEach()
//group.setHeightEach()
//group.setLifetimeEach()
//group.setMirrorXEach()
//group.setMirrorYEach()
//group.setRotateToDirectionEach()
//group.setRotationEach()
//group.setRotationSpeedEach()
//group.setScaleEach()
//group.setSpeedAndDirectionEach()
//group.setVelocityEach()
//group.setVelocityXEach()
//group.setVelocityYEach()
//group.setVisibleEach()
//group.setWidthEach()

}

//background()
declare function background(color: string): void
//fill()
//noFill()
//stroke()
//strokeWeight()
//rgb()
//noStroke()
//arc()
//ellipse()
//line()
//point()
//rect()
declare function rect (x: number, y: number, w?: number, h?: number): void
//regularPolygon()
//shape()
//text()
declare function text(str: string, x: number, y: number, w?: number, h?: number): void
//textAlign()
//textFont()
//textSize()


//drawSprites()
declare function drawSprites(): void
//World.allSprites
//World.width
//World.height
//World.mouseX
//World.mouseY
//World.frameRate
//World.frameCount
//playSound()
//stopSound()
//playSpeech()
//keyDown()
declare function keyDown(key: string): boolean  
//keyWentDown()
declare function keyWentDown(key: string): boolean  
//keyWentUp()
declare function keyWentUp(key: string): boolean  
//mouseDidMove()
//mouseDown()
//mouseIsOver()
//mouseWentDown()
//mouseWentUp()
//mousePressedOver()
declare function mousePressedOver(sprite: Sprite): boolean
//camera.on()
//camera.off()
//camera.isActive
//camera.mouseX
//camera.mouseY
//camera.x
//camera.y
//camera.zoom
//comment
//World.seconds