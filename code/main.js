import kaboom from "kaboom"
import { loadAssets } from './assets.js'

kaboom({
  global: true,
	scale: 5,
	clearColor: [0, 0, 0],
  background: [0, 0, 0],
})

loadAssets()

let CHEST_OPEN = false

let CHESTS_UNLOCKED_COUNT = 0
const CHESTS_UNLOCKED_STATUS = {
  "1": {
    unlocked: false,
  },
  "2": {
    unlocked: false,
  },
  "3": {
    unlocked: false,
  },
  "4": {
    unlocked: false,
  },
  "5": {
  unlocked: false,
  }
}
let MESSAGES_POOL_CURRENT = 0
const MESSAGES_POOL = {
  "1": {
    message: 	"Log4Shell is the name for the vulnerability within the popular Java logging framework Log4j. It was initially published as CVE-2021-44228 with the highest CVSS score of 10\n\n press m to learn more\npress space to close chest and proceed",
    link: "https://snyk.io/blog/log4j-rce-log4shell-vulnerability-cve-2021-4428"
  },
  "2": {
    message: 	"next one?",
    link: "https://",
  }
}

const BULLET_SPEED = 35
let BULLET_DIRECTION = RIGHT
// the player can sustain up to 100 damage points
// every time an enemy objects collides into the player
// an enemy point is deducte
let PLAYER_HEALTH = 100

layers([
  'floor',
  'game',
  'ui',
  'onscreentext'
], 'game')

// @TODO I think at this point I am going to need to add some health points
// like 60 / 100 as an update to the screen so you can see how it affects you "in real time"
const health = add([
    sprite("heart", { anim: 'healthy'}),
    layer("ui"),
    pos(7,28),
    fixed(),
])

const chestUnlockedStatus = add([
    text('chests unlocked: 0 / 10', {
      size: 6, 
      width: 320,
      font: 'sink'
    }),
    pos(2, 2),
    layer("ui"),
    fixed()
])

// objects
const map = addLevel([
  "┌─────┐     ┌──)────)──┐     ┌───────┐            ┌──────────────────┐",
  "│·····└─────┘··········└─────┘·······│            │··················│",
  "│··············m·····················│            │··················│",
  "│···1···2······m·····················└───}}───────┘··┌────────────┐··│",
  "│··············m·····································│            │··│",
  "│·····┌─────┐··········┌─────┐·······················│ ┌────────┐ │··│",
  "└─────┘     └──)────)──┘     └───────────}}───────┐··│ │········│ │··│",
  "                                                  │··│ │········│ │··│",
  " ┌───┐                                ┌───────────┘··│ │··┌──┐··│ │··│",
  "┌┘···└───────────────────────────┐    │··············│ │··│  │··│ │··│",
  "│································│    │··············│ │··│  │··│ │··│",
  "└┐···┌────────────────────────┐··│    │··┌───────────┘ │··│  │··└─┘··│",
  " └───┘                        │··│    │··│            ┌┘··└┐ │·······│",
  "                          ┌───┘··└────┘··└──────────┐ │····│ │·······│",
  "┌─────────────────────────┘·························│ │····│ └───────┘",
  "│···················································│ │····│          ",
  "│···················································│ └────┘          ",
  "│··┌──────────────────────┐·························│                 ",
  "│··│                      └───┐··┌────┐··┌──────────┘                 ",
  "│··│            ┌(─(──(─(┐    │··│    │··│            ┌──────────────┐",
  "│··│           ┌┘········└┐   │··│    │··│     ┌──────┘··············│",
  "│··│           │··········│   │··│    │··│     │·····················│",
  "│··│           │··········│   │··│    │··│     │··┌───────────────┐··│",
  "│··│ ┌───────┐ │··········└───┘··└┐  ┌┘··└┐    │··│               │··│",
  "│··│ │·······│ │··················│  │····└────┘··└─────────────┐ │··│",
  "│··│ │·······│ │··················│  │··························│ │··│",
  "│··│ │·······│ │··················│  │····┌────┐················│ │··│",
  "│··│ │·······│ │··········┌───┐··┌┘  └┐··┌┘    │················│ │··│",
  "│··│ │·······│ │··········│   │··│    │··│     │················│ │··│",
  "│··│ │·······│ │··········│   │··│    │··│     │················│ │··│",
  "│··│ └───────┘ └┐········┌┘   │··│    │··│     │················│ │··│",
  "│··│            └(─(──(─(┘    │··│    │··│     │················│ │··│",
  "│··│                          │··│    │··│     │················│ │··│",
  "│··│                          │··│    │··│     │················│ │··│",
  "│··│                          │··│    │··│     └────────────────┘ │··│",
  "│··│                          │··│    │··│                        │··│",
  "│··│ ┌─────────────┐   ┌──────┘··└────┘··└─────────────┐  ┌───────┘··│",
  "│··│ │·············│   │·······························│  │··········│",
  "│··│ │·············│   │·······························│  │··········│",
  "│··│ │··┌──────────┘   └────────────────────────────┐··│  │··········│",
  "│··│ │··│                                           │··└──┘····┌─────┘",
  "│··│ │··│                                           │··········│      ",
  "│··│ │··└──────────────────────────┐      ┌─┐       │··········│ ┌───┐",
  "│··│ │·····························│     ┌┘·└┐      │··┌──┐····│ │···│",
  "│··│ │·····························│    ┌┘···└┐     │··│  │····└─┘···│",
  "│··│ │···┌──┐······················│   ┌┘·····└┐    │··│  │··········│",
  "│··│ │···│  │······················│  ┌┘·······└┐   │··│  │··········│",
  "│··│ │···│  │······················│  │·········│   │··│  │····┌─┐···│",
  "│··│ │···│  │······················│  └┐·······┌┘   │··│  │····│ │···│",
  "│··│ │···│  │······················│   └┐·····┌┘    │··│  │····│ └───┘",
  "│··│ │···│  │······················│    └┐···┌┘     │··│  │····│      ",
  "│··│ │···│  │······················│     └┐·┌┘      │··│  │····└─────┐",
  "│··│ │···│  │······················│      └─┘       │··│  │··········│",
  "│··│ │···│  │······················│                │··│  │··········│",
  "│··│┌┘···└┐ │······················└────────────────┘··│  │····┌──┐··│",
  "│··││·····│ │··········································│  │····│  │··│",
  "│··││·····│ │··········································│  │····│  │··│",
  "│··││·····│ └──────────────────────────────────────────┘  │····│  │··│",
  "│··│└─────┘                                               │····│  │··│",
  "│··│               ┌──────────────────────────────────────┘····│  │··│",
  "│··└───────────────┘·········o············o····················│  │··│",
  "│··························o················o··················│  │··│",
  "│··························o················o··················│  │··│",
  "└───────────────────┐········o············o····················│  │··│",
  "                    └─────────────────────────────────┐··┌─────┘  │··│",
  "┌───┐                                                 │··│        │··│",
  "│···└─────────────────────────────────────────────────┘··└────────┘··│",
  "│····································································│",
  "│····································································│",
  "└────────────────────────────────────────────────────────────────────┘",


], {
	width: 16,
	height: 16,
  "·": () => [
    origin('center'),
		sprite("floor", { frame: ~~rand(0, 8) }),
    layer('floor'),
    'floor'
  ],
  "m": () => [
    origin('center'),
    sprite("milestone1"),
    area(),
    'milestone1'
  ],
  ")": () => [
    origin('center'),
		sprite("badge1"),
  ],
  "(": () => [
    origin('center'),
		sprite("badge3"),
  ],
  "}": () => [
    origin('center'),
		sprite("badge2"),
  ],
	"1": () => [
    origin('center'),
		sprite("chest"),
		area(),
		solid(),  
		{
      opened: false,
      chest_index: 1
    },
		"chest",
	],
  "2": () => [
    origin('center'),
		sprite("chest"),
		area(),
		solid(),  
		{
      opened: false,
      chest_index: 2
    },
		"chest",
	],
	"─": () => [
    origin('center'),
		sprite("wall"),
		area(),
		solid(),
	],
  "┌": () => [
    origin('center'),
		sprite("wall"),
		area(),
		solid(),
	],
  "┐": () => [
    origin('center'),
		sprite("wall"),
		area(),
		solid(),
	],
  "└": () => [
    origin('center'),
		sprite("wall"),
		area(),
		solid(),
	],
  "┘": () => [
    origin('center'),
		sprite("wall"),
		area(),
		solid(),
	],
  "│": () => [
    origin('center'),
		sprite("wall"),
		area(),
		solid(),
	],
})

const player = add([
	pos(map.getPos(2, 2)),
	sprite("hero", { anim: "idle" }),
	area({ width: 12, height: 12, offset: vec2(0, 6) }),
	solid(),
	origin("center"),
])

player.onCollide('milestone1', () => {
  const ogre = add([
    sprite("ogre"),
    pos(player.pos.sub(-100,0)),
    origin("center"),
    area(),
    solid(),
    scale(0.5),
    'ogre',
    'enemy'
  ])
})

player.onCollide('enemy', () => {
  // debug.log(PLAYER_HEALTH)

  shake(10)
  PLAYER_HEALTH--

  if (PLAYER_HEALTH < 1) {
    addKaboom()
    go('lose')
    return
  }

  if (PLAYER_HEALTH < 10) {
    addKaboom()
    shake(120)
    // @TODO add scene for losing
    go('lose')
    return
  }

  if (PLAYER_HEALTH < 35) {
    health.play('dying')
    shake(30)
    return
  }

  if (PLAYER_HEALTH < 75) {
    health.play('wounded')
    shake(30)
    return
  }
})

  // @TODO add other type of monsters
	// "t": () => [
  //   origin('center'),
	// 	sprite("monster1"),
	// 	// area({ height: 4, offset: vec2(0, 12) }),
  //   area(),
	// 	solid(),
	// ], 

const sword = add([
	pos(),
	sprite("sword"),
	origin("bot"),
	rotate(0),
  area(),
	follow(player, vec2(-4, 9)),
	spin(),
  'sword'
])

onUpdate(() => {
  every('ogre', (obj) => {
    obj.move(-15, 0)
    if (obj.pos.x < 0) {
      destroy(obj)
    }
  })
})

function spin() {
	let spinning = false
	return {
		id: "spin",
		update() {
			if (spinning) {
				this.angle += 800 * dt()
				if (this.angle >= 360) {
					this.angle = 0
					spinning = false
				}
			}
		},
		spin() {
			spinning = true
		},
	}
}

function updateChestCount(chestIndex) {
  if (!CHESTS_UNLOCKED_STATUS[chestIndex].unlocked) {
      CHESTS_UNLOCKED_COUNT++
      CHESTS_UNLOCKED_STATUS[chestIndex].unlocked = true
      chestUnlockedStatus.text = `chests unlocked ${CHESTS_UNLOCKED_COUNT} / 10`

    add([
      sprite("coin", {anim: 'idle'}),
      layer("ui"),
      pos(10 * CHESTS_UNLOCKED_COUNT, 12),
      fixed(),
    ])
  }
}

function showMessageText(chestPoolIndex) {
  const textBox = add([
    rect(width() - 30, 50, { radius: 16 }),
    origin("center"),
    color(255, 255, 255),
    pos(player.pos.x, (player.pos.y) - (height() / 4) )  ,
    outline(2),
    layer('onscreentext'),
    'messagebox'
  ])

  const textMessage = add([
    text("", { size: 6, width: width() - 40, font: 'apl386'}),
    pos(textBox.pos),
    // color(130, 72, 140),
    color(0, 0, 0),
    origin("center"),
    layer('onscreentext'),
    'messagebox'
  ])

  MESSAGES_POOL_CURRENT = chestPoolIndex
  textMessage.text = MESSAGES_POOL[MESSAGES_POOL_CURRENT].message
}

function spawnBullet(p) {
  add([
    rect(4, 2),
    area(),
    pos(player.pos.sub(0,2)),
    origin("center"),
    color(255, 255, 255),
    outline(1),
    move(BULLET_DIRECTION, BULLET_SPEED),
    cleanup(),
    // strings here means a tag
    "bullet",
  ])
}

onKeyPress("m", () => {
  if (CHEST_OPEN) {
    window.open(MESSAGES_POOL[MESSAGES_POOL_CURRENT].link, '_blank')
  }
})


onKeyPress("space", () => {
	let interacted = false
	every("chest", (c) => {
		if (player.isTouching(c)) {
			if (c.opened) {
        CHEST_OPEN = false
				c.play("close")
				c.opened = false
        
        destroyAll('messagebox')
			} else {
        destroyAll('messagebox')

        CHEST_OPEN = true
				c.play("open")
				c.opened = true
        showMessageText(c.chest_index)
        updateChestCount(c.chest_index)
			}
			interacted = true
		}
	})
	if (!interacted) {
		sword.spin()
    spawnBullet()
	}
})

	onCollide("bullet", "ogre", (b, e) => {
		destroy(b)
    destroy(e)

    // shake the screen for a bit of visual FX
    shake(2)
	})

const SPEED = 120

const dirs = {
	"left": LEFT,
	"right": RIGHT,
	"up": UP,
	"down": DOWN,
}

player.onUpdate(() => {
	camPos(player.pos)
})

onKeyDown("right", () => {
	player.flipX(false)
	sword.flipX(false)
	player.move(SPEED, 0)
	sword.follow.offset = vec2(-4, 9)
  BULLET_DIRECTION = RIGHT
})

onKeyDown("left", () => {
	player.flipX(true)
	sword.flipX(true)
	player.move(-SPEED, 0)
	sword.follow.offset = vec2(4, 9)
  BULLET_DIRECTION = LEFT
})

onKeyDown("up", () => {
	player.move(0, -SPEED)
})

onKeyDown("down", () => {
	player.move(0, SPEED)
})

onKeyPress(["left", "right", "up", "down"], () => {
	player.play("run")
})

onKeyRelease(["left", "right", "up", "down"], () => {
	if (
		!isKeyDown("left")
		&& !isKeyDown("right")
		&& !isKeyDown("up")
		&& !isKeyDown("down")
	) {
		player.play("idle")
	}
})

// making sure we clean up on resources if they leave the screen
onUpdate("enemy", (element) => {
  if (element.pos.x < 0) {
    destroy(element)
  }
})