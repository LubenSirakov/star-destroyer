// Input handling and basic player movement

// Start kaboom
kaboom({
    global: true,
    fullscreen: true,
})

// Load assets
loadSprite("xwing", "/images/x-wing.png")
loadSprite("laser", "/images/laser.png")
loadSprite("dslaser", "/images/dslaser.png")
loadSprite("bg", "/images/spacebg.png")
loadSprite("boss", "/images/deathstar.png")
loadSprite("explosion", "/images/explosion.png")
loadSprite("fireball", "/images/fireball.png")
//Load music assets
loadSound('bg', '/music/bg.mp3')
loadSound('battleMusic', '/music/battle.mp3')

//Common functions
function addButton(txt, p, f) {

    const btn = add([
        text(txt),
        pos(p),
        area({ cursor: 'pointer' }),
        scale(1),
        origin('center')
    ])

    btn.onClick(f)

    btn.onUpdate(() => {
        if (btn.isHovering()) {
            const t = time() * 10
            // btn.color = rgb(
            //     wave(0, 255, t),
            //     wave(0, 255, t + 2),
            //     wave(0, 255, t + 4),
            // )
            btn.color = rgb(255, 255, 102)
            btn.scale = vec2(1.2)
        } else {
            btn.scale = vec2(1)
            btn.color = rgb()
        }
    })
}

//Menu scene
scene('menu', () => {

    const music = play('bg', {
        loop: true
    })

    add([
        sprite('bg'),
        pos(0, 0),
        scale(1.3),
    ])

    addButton('Start Game', center(), () => {
        music.stop()
        go('battle')
    })
    
})
//Battle scene
scene('battle', () => {

    const music = play('battleMusic', {
        loop: true
    })

    // Define player movement speed (pixels per second)
    const SPEED = 650
    const BOSS_SPEED = 48
    const BOSS_HEALTH = 100
    const BULLET_SPEED = 800
    const OBJ_HEALTH = 4
    const FIREBALL_SPEED = 60

    layers([
        "game",
        "ui",
    ], "game")

    add([
        sprite('bg'),
        pos(0, 0),
        scale(1.3)
    ])

    // Add player game object
    const player = add([
        sprite("xwing"),
        area(),
        scale(0.3),
        rotate(270),
        pos(50, height() / 2),
    ])

    
    onKeyDown("left", () => {
        player.move(-SPEED, 0)
    })
    
    onKeyDown("right", () => {
        player.move(SPEED, 0)
    })

    onKeyDown("up", () => {
        player.move(0, -SPEED)
    })
    
    onKeyDown("down", () => {
        player.move(0, SPEED)
    })
    
    onKeyPress("space", () => {
        spawnBullet(player.pos.sub(-150, 195))
        spawnBullet(player.pos.sub(-150, 10))
    })

    player.onCollide('enemy', (e) => {
        destroy(e)
        destroy(player)
        addExplode((e.pos), 10, 10, 10)
        wait(1, () => {
            music.stop()
            go('menu')
        })
    })

    // onCollide("enemy", (e) => {
    //     destroy(e)
    //     destroy(player)
    //     addExplode(boss.pos, 5, 5, 5)
    // })
    
    //Boss object
    const boss = add([
        sprite('boss'),
        area(),
        pos(width(), height() / 2),
        health(BOSS_HEALTH),
        origin('right'),
        'enemy',
        {
            dir: 1,
        },
        state("move", ["idle", "attack", "move",]),
    ])

    boss.onStateEnter("idle", () => {
        wait(0.5, () => boss.enterState("attack"))
    })

    boss.onStateEnter("attack", () => {

        // wait(1, () => boss.enterState("move"))

        // Don't do anything if player doesn't exist anymore
        if (!player.exists()) return

        const dir = player.pos.sub(boss.pos).unit()

        add([
            pos(boss.pos),
            move(dir, BULLET_SPEED),
            rect(12, 12),
            area(),
            cleanup(),
            origin("center"),
            color(BLUE),
            "bullet",
        ])

    })

    on("hurt", "enemy", (e) => {
        shake(0.5)
    })

    // onKeyDown() registers an event that runs every frame as long as user is holding a certain key
    

    onCollide("bullet", "enemy", (b, e) => {
        e.hurt()
        destroy(b)
        addExplode(b.pos, 1, 24, 1)
    })

    onCollide("bullet", "trash", (b, e) => {
        e.hurt(2)
        destroy(b)
        addExplode(b.pos, 1, 24, 1)
    })

    onCollide('enemy', 'player', (e, p) => {
        destroy(p)
        destroy(player)
        shake(120)
        addExplode(center(), 12, 120, 30)
    })

    boss.onUpdate((p) => {
        boss.move(-10, BOSS_SPEED * boss.dir)
        if (boss.dir === 1 && boss.pos.y >= height() - 200) {
            boss.dir = -1
        }
        if (boss.dir === -1 && boss.pos.y <= 200) {
            boss.dir = 1
        }
    })

    boss.onHurt(() => {
        healthbar.set(boss.hp())
    })

    boss.onDeath(() => {
        music.stop()
        go("win")
    })

    const healthbar = add([
        rect(width(), 24),
        pos(0, 0),
        color(127, 255, 127),
        fixed(),
        layer("ui"),
        {
            max: BOSS_HEALTH,
            set(hp) {
                this.width = width() * hp / this.max
                this.flash = true
            },
        },
    ])

    healthbar.onUpdate(() => {
        if (healthbar.flash) {
            healthbar.color = rgb(255, 255, 255)
            healthbar.flash = false
        } else {
            healthbar.color = rgb(127, 255, 127)
        }
    })

    function addExplode(p, n, rad, size) {
        for (let i = 0; i < n; i++) {
            wait(rand(n * 0.1), () => {
                for (let i = 0; i < 2; i++) {
                    add([
                        sprite('explosion'),
                        pos(p.add(rand(vec2(-rad), vec2(rad)))),
                        scale(0.2 * size, 0.2 * size),
                        lifespan(0.2),
                        origin("center"),
                    ])
                }
            })
        }
    }

    function spawnBullet(p) {
        add([
            sprite('laser'),
            scale(0.5),
            rotate(90),
            area(),
            pos(p),
            origin('center'),
            move(RIGHT, 700),
            cleanup(),
            'bullet'
        ])
    }

    function spawnTrash() {

		add([
			sprite('fireball'),
			area(),
			pos(boss.pos),
            move(player.pos.angle(boss.pos), 600),
			health(OBJ_HEALTH),
			origin("bot"),
			"trash",
			"enemy",
			{ speed: (FIREBALL_SPEED * 0.5, FIREBALL_SPEED * 0.5) },
		])
        wait(2, spawnTrash)
	}

    onUpdate("trash", (t) => {
		t.move(player.pos.angle(boss.pos), t.speed)
		if (t.pos.y + t.height > height()) {
            console.log(t.pos.y);
            destroy(t)
		}
	})

    add([
        text("Defeat the Empire!", { width: width() / 2 }),
        pos(12, 12),
    ])

    spawnTrash()
})

scene("win", () => {

    add([
        sprite('bg'),
        pos(0, 0),
        scale(1.3)
    ])

    add([
        sprite('boss'),
        origin("center"),
        scale(1),
        pos(width() / 2, height() / 2),
    ])

    add([
        text('You won!'),
        origin("center"),
        pos(width() / 2, height() / 2 - 100),
    ])
    
    addButton('Play again', center(), () => {
        music.stop()
        go('battle')
    })

    const music = play('bg', {
        loop: true,
        seek: 6.25
    })

})

go('menu')