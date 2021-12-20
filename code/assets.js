export function loadAssets() {
  // https://0x72.itch.io/dungeontileset-ii
  loadSpriteAtlas("sprites/dungeon.png", {
  "coin": {
		"x": 286,
		"y": 272,
		"width": 32,
		"height": 32,
		"sliceX": 3,
		"sliceY": 3,
    anims: {
      idle: {
        from: 0,
        to: 0,
        loop: false
      },
      spin: {
        from: 0,
        to: 3,
        loop: true
      }
    }
	},
  "heart": {
		"x": 286,
		"y": 256,
		"width": 48,
		"height": 48,
		"sliceX": 3,
		"sliceY": 3,
    anims: {
      healthy: {
        from: 0,
        to: 0,
        loop: false
      },
      wounded: {
        from: 0,
        to: 1,
      },
      dying: {
        from: 1,
        to: 2,
      }
    }
	},
	"hero": {
		"x": 128,
		"y": 196,
		"width": 144,
		"height": 28,
		"sliceX": 9,
		"anims": {
			"idle": {
				"from": 0,
				"to": 3,
				"speed": 3,
				"loop": true
			},
			"run": {
				"from": 4,
				"to": 7,
				"speed": 10,
				"loop": true
			},
			"hit": 8
		}
	},
	"ogre": {
		"x": 16,
		"y": 320,
		"width": 256,
		"height": 32,
		"sliceX": 8,
		"anims": {
			"idle": {
				"from": 0,
				"to": 3,
				"speed": 3,
				"loop": true
			},
			"run": {
				"from": 4,
				"to": 7,
				"speed": 10,
				"loop": true
			}
		}
	},
	"floor": {
		"x": 16,
		"y": 64,
		"width": 48,
		"height": 48,
		"sliceX": 3,
		"sliceY": 3
	},
   "milestone1": {
		"x": 48,
		"y": 96,
		"width": 48,
		"height": 48,
		"sliceX": 3,
		"sliceY": 3
	},
  "badge1": {
		"x": 16,
		"y": 32,
		"width": 48,
		"height": 48,
		"sliceX": 3,
		"sliceY": 3
	},
  "badge2": {
		"x": 32,
		"y": 32,
		"width": 48,
		"height": 48,
		"sliceX": 3,
		"sliceY": 3
	},
  "badge3": {
		"x": 16,
		"y": 48,
		"width": 48,
		"height": 48,
		"sliceX": 3,
		"sliceY": 3
	},
  "badge4": {
		"x": 32,
		"y": 48,
		"width": 48,
		"height": 48,
		"sliceX": 3,
		"sliceY": 3
	},
  "monster1": {
		"x": 370,
		"y": 36,
		"width": 48,
		"height": 48,
		"sliceX": 3,
		"sliceY": 3
	},
	"chest": {
		"x": 304,
		"y": 304,
		"width": 48,
		"height": 16,
		"sliceX": 3,
		"anims": {
			"open": {
				"from": 0,
				"to": 2,
				"speed": 20,
				"loop": false
			},
			"close": {
				"from": 2,
				"to": 0,
				"speed": 20,
				"loop": false
			}
		}
	},
	"sword": {
		"x": 322,
		"y": 81,
		"width": 12,
		"height": 30
	},
	"wall": {
		"x": 16,
		"y": 16,
		"width": 16,
		"height": 16
	},
	"wall_top": {
		"x": 16,
		"y": 0,
		"width": 16,
		"height": 16
	},
	"wall_left": {
		"x": 16,
		"y": 128,
		"width": 16,
		"height": 16
	},
	"wall_right": {
		"x": 0,
		"y": 128,
		"width": 16,
		"height": 16
	},
	"wall_topleft": {
		"x": 32,
		"y": 128,
		"width": 16,
		"height": 16
	},
	"wall_topright": {
		"x": 48,
		"y": 128,
		"width": 16,
		"height": 16
	},
	"wall_botleft": {
		"x": 32,
		"y": 144,
		"width": 16,
		"height": 16
	},
	"wall_botright": {
		"x": 48,
		"y": 144,
		"width": 16,
		"height": 16
	},
})
}