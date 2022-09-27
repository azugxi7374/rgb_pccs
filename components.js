function createRGBBar(width, updateState) {
    const div = document.createElement('div');
    div.style = `width:${width}px; height: 6em;`
    div.className = "container_rgbbar"
    function render({ rgb }) {
        let s = "";
        const w = width - 10;
        for (let i = 0; i < 3; i++) {
            const rgbstr = "RGB".charAt(i);
            const c = "#" + ("ff0000,00ff00,0000ff".split(",")[i])
            s += `<div style="width:${w * rgb[i] / 255}px;
            background:${c};">
            ${rgbstr}:${rgb[i]}
            </div>`
        }
        div.innerHTML = s;
    }

    return {
        render,
        elem: div,
    }
}