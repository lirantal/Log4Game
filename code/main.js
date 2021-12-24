import kaboom from "kaboom"
import { loadAssets } from './assets.js'

kaboom({
  global: true,
	scale: 5,
	clearColor: [0, 0, 0],
  background: [0, 0, 0],
})

loadAssets()

// graphics from craftpix.net, license: https://craftpix.net/file-licenses/
loadSprite("snyk-dog", "sprites/Idle.png", {
  sliceX: 4,
  sliceY: 1,
  anims: {
    idle: {
      from: 0,
      to: 3,
      loop: true
    }
  }
});

// Music by <a href="/users/michaelkobrin-21039285/?tab=audio&amp;utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=audio&amp;utm_content=3781">MichaelKobrin</a> from <a href="https://pixabay.com/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=music&amp;utm_content=3781">Pixabay</a>
loadSound("sound-intro", "sounds/under-pressure-michael-kobrin-105bpm-3781.mp3");

// Music by <a href="/users/guilhermebernardes-24203804/?tab=audio&amp;utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=audio&amp;utm_content=10374">GuilhermeBernardes</a> from <a href="https://pixabay.com/music/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=music&amp;utm_content=10374">Pixabay</a>
loadSound("sound-game", "sounds/lone-wolf-10374.mp3");

// Music from <a href="https://pixabay.com/music/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=music&amp;utm_content=7017">Pixabay</a>
loadSound("knife-thrust", "sounds/knife-thrust-into-wall-7017.mp3");

const soundIntro = play('sound-intro', {loop: true});

scene('game', () => {
  soundIntro.stop();

  const soundGame = play('sound-game', {loop: true});
  soundGame.play();

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
      message: "Log4Shell is the name for the vulnerability within the popular Java logging framework Log4j. It was initially published as CVE-2021-44228 with the highest CVSS score of 10\n\n press m to learn more\npress space to close chest and proceed",
      link: "https://snyk.io/blog/log4j-rce-log4shell-vulnerability-cve-2021-4428"
    },
    "2": {
      message: "The impact of Log4Shell was not fully realized at first, at first glance it appeared to be a bug affecting Minecraft. Shortly after, security researchers caught on that the vulnerable component was the very widely used log4j. With Oracle reporting over 13 billion devices using java, the realization started to set in that this bug could have a much bigger impact than initially thought...",
      link: undefined,
    },
    "3": {
      message: "Did you know?\nIt would only require a malicious actor to craft a string that gets logged by a server running the vulnerable Log4j version, in order to run any Java code or system command remotely.\n\nWhat sort of data gets logged? find more chests to find out!",
      link: undefined,
    }
  }

  const BULLET_SPEED = 55
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
    "│·········m··························│            │··················│",
    "│···1·····m····2·····················└───}}───────┘··┌────────────┐··│",
    "│·········m··········································│            │··│",
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
    "│··│ │·······│ │··················│  │··························│ │··│",
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
    "│··│ │·············│   │·······························│  │··········│",
    "│··│ │·············│   │·······························│  │··········│",
    "│··│ │··┌──────────┘   └────────────────────────────┐··│  │··········│",
    "│··│ │··│                                           │··└──┘····┌─────┘",
    "│··│ │··│                                           │··········│      ",
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
    "                    └──────────────────────────────┐·····┌─────┘  │··│",
    "┌─────────┐                                        │·····│        │··│",
    "│·········└────────────────────────────────────────┘·····└────────┘··│",
    "│····································································│",
    "│····································································│",
    "│····································································│",
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
        chest_index: 3
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
    scale(0.5),
    origin("center"),
  ])

  player.onCollide('milestone1', () => {
    for (let x = 0; x <= 1; x++) {
      wait(x, () => {
        add([
          sprite("monster1", { flipX: true, anim: 'run'}),
          pos(player.pos.sub((-100),20)),
          origin("center"),
          area(),
          solid(),
          scale(0.5),
          'ogre',
          'enemy',
          cleanup()
        ])

        add([
          sprite("monster1", { flipX: true, anim: 'run'}),
          pos(player.pos.sub((-100),-20)),
          origin("center"),
          area(),
          solid(),
          scale(0.5),
          'ogre',
          'enemy',
          cleanup()
        ])
      })
    }
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
    scale(0.5),
    follow(player, vec2(-2, 4)),
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
    play('knife-thrust')
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
      if (MESSAGES_POOL[MESSAGES_POOL_CURRENT].link) {
        window.open(MESSAGES_POOL[MESSAGES_POOL_CURRENT].link, '_blank')
      }
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

  const SPEED = 45

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
    sword.follow.offset = vec2(-2, 4)
    BULLET_DIRECTION = RIGHT
  })

  onKeyDown("left", () => {
    player.flipX(true)
    sword.flipX(true)
    player.move(-SPEED, 0)
    sword.follow.offset = vec2(2, 4)
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
})

scene('intro-1', () => {
  wait(0, () => {
    add([
        text('Log4Game', {
          size: 6,
          font: 'apl386'
        }),
        pos(width()/2, height()/2),
        origin('center')
      ]);
  })

  wait(3, () => {
    add([
        text('\n\n\n\nAn educational role playing game that is based', {
          size: 6,
          font: 'apl386'
        }),
        pos(width()/2, height()/2),
        origin('center')
      ]);
  })

  wait(5, () => {
    add([
        text('\n\n\n\n\n\non the #LogShell security vulnerability that', {
          size: 6,
          font: 'apl386'
        }),
        pos(width()/2, height()/2),
        origin('center')
      ]);
  })

  wait(7, () => {
    add([
        text('\n\n\n\n\n\n\n\ntook the world into a spin...', {
          size: 6,
          font: 'apl386'
        }),
        pos(width()/2, height()/2),
        origin('center')
      ]);
  })

  wait(9, () => {
    add([
      text('press space to continue', {
        size: 4,
        font: 'apl386'
      }),
      pos(width()/2, height() - (height()*0.1)),
      origin('center')
    ]);
  })
  
  keyPress('space', () => {
    go('intro-2');
  });
})

scene('intro-2', () => {
  add([
    text('this game is based on true events...', {
      size: 6,
      font: 'apl386'
    }),
    pos(width()/2, height()/2),
    origin('center')
  ]);

  // transition to next scene after a few seconds
  wait(5, () => {
    go('intro-3');  
  })
})

scene('intro-3', () => {
  add([
    text('On Dec 10th, 2021, a new, critical Log4j vulnerability was disclosed: Log4Shell.\nThis vulnerability within the popular Java logging framework was published\nas CVE-2021-44228 and categorized as Critical with a CVSS score of 10\n(the highest score possible).\n', {
      size: 6,
      font: 'apl386'
    }),
    pos(width()/2, height()/2),
    origin('center')
  ]);

  wait(9, () => {
    add([
      text('press space to continue', {
        size: 4,
        font: 'apl386'
      }),
      pos(width()/2, height() - (height()*0.1)),
      origin('center')
    ]);
  })
  
  keyPress('space', () => {
    go('intro-4');
  });
})

scene('intro-4', () => {
  add([
    text('The situation is rapidly escalating', {
      size: 6,
      font: 'apl386'
    }),
    pos(width()/2, height()/2),
    origin('center')
  ]);

  wait(3, () => {
    add([
      text('\n\nnew vulnerabilities have been emerged in the form of CVE-2021-45046 and CVE-2021-45105', {
        size: 6,
        font: 'apl386'
      }),
      pos(width()/2, height()/2),
      origin('center')
    ]);
  })

  wait(6, () => {
    add([
      text('\n\n\n\nmalicious actors have been reported to be weaponizing exploits in the wild', {
        size: 6,
        font: 'apl386'
      }),
      pos(width()/2, height()/2),
      origin('center')
    ]);
  })

  let monster1
  let monster2
  let monster3
  wait(6.6, () => {
    monster1 = add([
      sprite("monster1", { anim: 'run'}),
      pos(10, (height() - (height()*0.3))),
      origin("center"),
      scale(0.3),
      area(),
      cleanup(),
    ])
  })

  wait(7, () => {
    monster2 = add([
      sprite("monster2", { anim: 'run'}),
      pos(width() - 10, (height() - (height()*0.35))),
      origin("center"),
      scale(0.3),
      area(),
      cleanup(),
    ])
  })

  wait(8.4, () => {
    monster3 = add([
      sprite("monster3", { anim: 'run'}),
      pos(width() - 10, (height() - (height()*0.25))),
      origin("center"),
      scale(0.3),
      area(),
      cleanup(),
    ])
  })

  onUpdate(() => {
    if (monster1) {
      monster1.move(16, 0)
    }

    if (monster2) {
      monster2.flipX(true)
      monster2.move(-10, 0)
    }

    if (monster3) {
      monster3.flipX(true)
      monster3.move(-13, 0)
    }
  })

  wait(9, () => {
    add([
      text('press space to continue', {
        size: 4,
        font: 'apl386'
      }),
      pos(width()/2, height() - (height()*0.1)),
      origin('center')
    ]);
  })
  
  keyPress('space', () => {
    go('intro-5');
  });
})

scene('intro-5', () => {

  const SPEED = 30
  const BULLET_SPEED = 55
  let BULLET_DIRECTION = RIGHT
  
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
    ])
  }

  add([
    text('You, Smithers,', {
      size: 6,
      font: 'apl386'
    }),
    pos(width()/2, height()/2),
    origin('center')
  ]);

  wait(2, () => {
    add([
      text('\n\nhave been tasked with mitigating the vulnerability', {
        size: 6,
        font: 'apl386'
      }),
      pos(width()/2, height()/2),
      origin('center')
    ]);
  })

  let player
  let sword
  wait(3, () => {
    player = add([
      sprite("hero", { anim: 'idle'}),
      pos(width()/2, (height() - (height()*0.6))),
      origin("center"),
      scale(0.5),
      area(),
      cleanup(),
    ])
  })

  wait(6, () => {
    player.play('run')

    add([
      text('\n\n\n\nuse your sword to shoot knives at malicious actors and stop attacks ', {
        size: 6,
        font: 'apl386'
      }),
      pos(width()/2, height()/2),
      origin('center')
    ]);
  })

  wait(8, () => {
    sword = add([
      pos(),
      sprite("sword"),
      origin("bot"),
      rotate(0),
      area(),
      scale(0.3),
      follow(player, vec2(-2, 4)),
      'sword'
    ])
  })

  wait(10, () => {

    add([
      text('\n\n\n\n\n\n\n\n[try to move around with arrow keys and hit space]', {
        size: 6,
        font: 'apl386'
      }),
      pos(width()/2, height()/2),
      origin('center')
    ]);

    onKeyDown("right", () => {
      player.flipX(false)
      sword.flipX(false)
      player.move(SPEED, 0)
      sword.follow.offset = vec2(-2, 4)
      BULLET_DIRECTION = RIGHT
    })

    onKeyDown("left", () => {
      player.flipX(true)
      sword.flipX(true)
      player.move(-SPEED, 0)
      sword.follow.offset = vec2(2, 4)
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

    onKeyPress("space", () => {
      spawnBullet()
    })
  })

  wait(17, () => {
    // soundIntro.detune(-100),
    soundIntro.volume(0.8)
    wait(1, () => {
      // soundIntro.detune(-300),
      soundIntro.volume(0.6)
    })
    wait(3, () => {
      // soundIntro.detune(-300),
      soundIntro.volume(0.4)
    })
    wait(5, () => {
      // soundIntro.detune(-500),
      soundIntro.volume(0.3)
    })
    wait(7, () => {
      // soundIntro.detune(-500),
      soundIntro.volume(0.2)
    })
    wait(9, () => {
      // soundIntro.detune(-500),
      soundIntro.volume(0.1)
    })
    wait(11, () => {
      go('intro-6')
    })
  })
})

scene('intro-6', () => {
  wait(2, () => {
    soundIntro.stop();
    add([
      text('Goodluck Smithers', {
        size: 6,
        font: 'apl386'
      }),
      pos(width()/2, height()/2),
      origin('center')
    ]);
  })

  wait(6, () => {
    go('game')
  })
})

scene('credits-1', () => {
  wait(4, () => {
    add([  
      text('a Snyk production', {
        size: 6,
        font: 'apl386'
      }),
      pos(width()/2, height()/2),
      origin('center')
    ]);
  })

  wait(7, () => {
    add([
      pos(width()/2, (height() - (height()*0.4))),
      sprite("snyk-dog", {anim: 'idle'}),
      rotate(0),
      area(),
      origin('center'),
      scale(0.5),
      cleanup()
    ])
  })

  wait(13, () => {
    go('intro-1')
  })
})

go('credits-1')
// shortcut to the game:
// go('game')