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

export {
    addButton
}