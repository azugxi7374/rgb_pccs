function createRGBView(width, updateState) {
    const div = document.createElement('div');
    div.style = `width:${width}px; height: 2em;`

    function render({ rgb }) {
        const rgbstr = rgb2str(rgb);
        div.innerHTML = `
            <span style="color:${rgbstr};">\u{25a0}</span>
            <span>${rgbstr}</span>
            <input type="color" value="${rgbstr}">
        `
        const input = div.querySelector('input');
        input.addEventListener('change', (e) => {
            updateState((s) => ({ ...s, rgb: str2rgb(e.target.value) }));
        });
    }
    return {
        elem: div,
        render,
    }
}

function createColorCircle(width, updateState) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = width * 1;
    const ctx = canvas.getContext('2d');

    const r1 = Math.floor(width / 2);
    const [x0, y0] = [r1, r1];
    const r2 = r1 * 3 / 4;

    const circle = (() => {
        function render({ rgb, tmpRGB }) {
            const hsv = rgb2hsv(rgb);

            (() => {
                ctx.beginPath();
                ctx.arc(x0, y0, r1, 0, Math.PI * 2, false);
                ctx.arc(x0, y0, r2, Math.PI * 2, 0, true);
                ctx.closePath();

                // ctx.fillStyle = "#ff0000";
                const grad = ctx.createConicGradient(7 / 12 * 2 * Math.PI, x0, y0)
                const RYGCBM = "ff0000 ffff00 00ff00 00ffff 0000ff ff00ff".split(" ").map(s => "#" + s);
                for (const i of [0, 1, 2, 3, 4, 5, 6]) {
                    grad.addColorStop(i / 6, RYGCBM[i % 6]);
                }
                ctx.fillStyle = grad;
                ctx.fill();

                // point
                (() => {
                    const a = (hsv[0] / 360 * 2 * Math.PI) + (7 / 12 * 2 * Math.PI);
                    const dxx = Math.cos(a) * (r1 + r2) / 2;;
                    const dyy = Math.sin(a) * (r1 + r2) / 2;;
                    const xx = x0 + dxx;
                    const yy = y0 + dyy;
                    ctx.beginPath();
                    ctx.arc(xx, yy, 10, 0, Math.PI * 2, false);
                    ctx.arc(xx, yy, 5, Math.PI * 2, 0, true);
                    ctx.closePath();
                    ctx.fillStyle = "#ffffff";
                    ctx.fill();
                })();

            })();
        }
        function contains({ mx, my }) {
            const dx = mx - x0;
            const dy = my - y0;
            const mr = Math.sqrt(dx * dx + dy * dy);
            return r2 <= mr && mr <= r1;
        }
        function changeColor({ mx, my, rgb }) {
            const hsv = rgb2hsv(rgb);
            const dx = mx - x0;
            const dy = my - y0;
            const a = norm2PI(Math.atan2(dy, dx));
            const h = Math.round((a + 5 / 12 * 2 * Math.PI) / (2 * Math.PI) * 360) % 360;
            return hsv2rgb([h, hsv[1], hsv[2]]);
        }
        return { render, contains, changeColor }
    })();

    // rect
    const r3 = r2 * 0.95 / 1.41;
    const rect = (() => {
        function render({ rgb }) {
            const div = 100;
            const hsv = rgb2hsv(rgb);
            for (let yi = 0; yi < div; yi++) {
                const [x03, y03] = [x0 - r3, y0 - r3];
                const [x330, y330] = [x03, Math.floor(y03 + (r3 * 2 * yi / div))]
                const [x331, y331] = [x03 + r3 * 2, Math.floor(y03 + (r3 * 2 * (yi + 1) / div))]

                const hh = hsv[0];
                const ss = [0, 1]; // x: 0 -> 1
                const vv = [1 - yi / div, 1 - (yi + 1) / div]; // y: 1 -> 0
                const grad = ctx.createLinearGradient(x330, y330, x331, y331);
                grad.addColorStop(0, rgb2str(hsv2rgb([hh, ss[0], vv[0]])));
                grad.addColorStop(1, rgb2str(hsv2rgb([hh, ss[1], vv[1]])));

                ctx.fillStyle = grad;
                ctx.fillRect(x330, y330, x331 - x330, y331 - y330);
            }

            // point
            (() => {
                const s = hsv[1];
                const v = hsv[2];
                const xx = x0 - r3 + (2 * r3 * s);
                const yy = y0 - r3 + (2 * r3 * (1 - v));
                ctx.beginPath();
                ctx.arc(xx, yy, 10, 0, Math.PI * 2, false);
                ctx.arc(xx, yy, 5, Math.PI * 2, 0, true);
                ctx.closePath();
                ctx.fillStyle = "#ffffff";
                ctx.fill();
            })();
        }
        function contains({ mx, my }) {
            return x0 - r3 <= mx && mx <= x0 + r3 && y0 - r3 <= my && my <= y0 + r3;
        }
        function changeColor({ mx, my, rgb }) {
            const hsv = rgb2hsv(rgb);
            const _x1 = x0 - r3, _y1 = y0 - r3;
            const _x2 = x0 + r3, _y2 = y0 + r3;
            const dx = (mx - _x1) / (_x2 - _x1);
            const dy = (my - _y1) / (_y2 - _y1);
            const ss = dx;
            const vv = 1 - dy;
            return hsv2rgb([hsv[0], ss, vv]);
        }
        return { render, contains, changeColor };
    })();

    let handlerArg = { rgb: [0, 0, 0] }
    function render({ rgb }) {
        handlerArg = { rgb };
        ctx.clearRect(0, 0, width, width);
        circle.render({ rgb });
        rect.render({ rgb });
    }
    canvas.addEventListener('click', (e) => {
        (({ rgb }) => {
            const mx = e.offsetX, my = e.offsetY;
            for (const elem of [circle, rect]) {
                if (elem.contains({ mx, my })) {
                    const rgb2 = elem.changeColor({
                        mx, my, rgb
                    });
                    updateState(s => ({ ...s, rgb: rgb2 }));
                }
            }
        })(handlerArg);
    });

    return {
        elem: canvas,
        render,
    }
}

function createPCCSToneView(width, updateState) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = width * 1;

    const ctx = canvas.getContext('2d');

    const elemList = [];

    const r1 = Math.floor(width / 2);
    const [x0, y0] = [r1, r1];
    const r2 = Math.floor(r1 * 3 / 4)
    for (let i = 0; i < 24; i++) {
        const clr = toneMap['v' + (i + 1)]
        const a0_24 = (i + 1 - 14 + 24)
        const a_delta = 0.4;
        const a1_24 = a0_24 - a_delta;
        const a2_24 = a0_24 + a_delta;
        const a1 = a1_24 * (2 * Math.PI / 24);
        const a2 = a2_24 * (2 * Math.PI / 24);

        const render = ({ hue }) => {
            ctx.beginPath();
            ctx.arc(x0, y0, r1, a1, a2, false);
            ctx.arc(x0, y0, r2, a2, a1, true);

            ctx.closePath();
            ctx.fillStyle = clr;

            ctx.fill();
            if (parseInt(hue) == i + 1) {
                ctx.strokeStyle = "#222222";
                ctx.lineWidth = 3;
                ctx.stroke();
            }

            {
                ctx.fillStyle = "#ffffff";
                const xx = x0 + (r1 + r2) / 2 * Math.cos((a1 + a2) / 2);
                const yy = y0 + (r1 + r2) / 2 * Math.sin((a1 + a2) / 2);
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(i + 1, xx, yy);
            }
        }
        const contains = ({ mx, my, tone, hue }) => {
            const dx = mx - x0;
            const dy = my - y0;
            const mr = Math.sqrt(dx * dx + dy * dy);
            const a = norm2PI(Math.atan2(dy, dx));
            // ↓ norm(a1 -> a) + norm(a -> a2) <= 2PI
            const a1_a_a2 = norm2PI(a - a1) + norm2PI(a2 - a);
            // console.log({ a, a1, a2, a1_a_a2 })
            // console.log({ i }, r2 <= mr && mr <= r1 && a1 <= a && a <= a2)
            return r2 <= mr && mr <= r1 && a1_a_a2 <= Math.PI * 2;
        }
        const changeToneHue = (tone, hue) => {
            return {
                tone: (i + 1) % 2 === 1 ? 'v' : tone,
                hue: i + 1
            }
        }
        elemList.push({ render, contains, changeToneHue });
    }

    const tones = 'p ltg g dkg lt sf d dk b s dp v'.split(" ");
    const dx_4 = [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 3];
    const dy_4 = [0, 1, 2, 3, 0, 1, 2, 3, 0.5, 1.5, 2.5, 1.5];
    for (let i = 0; i < tones.length; i++) {
        // r, d, l, u = r5,r3,r4,r3
        const r3 = r2 * 0.75;
        const r4 = r2 * 0.75;
        const r5 = r2;
        const r6 = r2 / 6;
        const x3 = x0 - r4;
        const y3 = y0 - r3;
        const xx = x3 + (r4 + r5) * (dx_4[i] + 0.5) / 4;
        const yy = y3 + (r3 + r3) * (dy_4[i] + 0.5) / 4;

        function isDeactive(hue) { return hue % 2 === 1 && tones[i] !== 'v' }
        const render = ({ hue, tone }) => {
            ctx.beginPath();
            ctx.arc(xx, yy, r6, 0, 2 * Math.PI);
            ctx.closePath();

            if (isDeactive(hue)) {
                ctx.fillStyle = "#dddddd";
                ctx.fill();
            } else {
                ctx.fillStyle = toneMap[`${tones[i]}${hue}`];
                ctx.fill();
                if ("p lt ltg sf b".split(" ").includes(tones[i])) {
                    ctx.fillStyle = "#000000";
                } else {
                    ctx.fillStyle = "#ffffff";
                }
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(tones[i], xx, yy);
            }
            if (tone === tones[i]) {
                ctx.strokeStyle = "#222222";
                ctx.lineWidth = 3;
                ctx.stroke();
            }

        }
        const contains = ({ mx, my, tone: currentTone, hue }) => {
            if (isDeactive(hue)) {
                return false;
            } else {
                const dx = mx - xx;
                const dy = my - yy;
                const mr = Math.sqrt(dx * dx + dy * dy);
                return mr <= r6;
            }
        }
        const changeToneHue = (tone, hue) => {
            return { tone: tones[i], hue: hue }
        }
        elemList.push({ render, contains, changeToneHue });
    }

    let handlerArg = { tone: 8, hue: 'v' }
    canvas.addEventListener('click', (e) => {
        (({ tone: tone0, hue: hue0 }) => {
            const mx = e.offsetX;
            const my = e.offsetY
            for (const { contains, changeToneHue } of elemList) {
                if (contains({ mx, my, tone: tone0, hue: hue0 })) {
                    const { tone, hue } = changeToneHue(tone0, hue0);
                    // console.log({ tone0, hue0, tone, hue });
                    updateState((s) => ({
                        ...s,
                        rgb: str2rgb(toneMap[`${tone}${hue}`])
                    }));
                }
            }
        })(handlerArg);
    });

    function render({ rgb }) {
        function rgb2PCCSHT(rgb) {
            let toneHue = 'v2'
            let dMin = 1e+9;
            for (const tn of TONE_NO_LIST) {
                const d = colorDist(rgb, str2rgb(toneMap[tn]))
                if (d < dMin) {
                    toneHue = tn;
                    dMin = d;
                }
            };
            return toneHue;
        }

        const toneHue = rgb2PCCSHT(rgb);
        const hue = toneHue.replace(/[a-z]+/, "")
        const tone = toneHue.replace(/[0-9]+/, "")
        handlerArg = { tone, hue }
        // console.log(toneHue, hue, tone);
        ctx.clearRect(0, 0, width, width);
        for (const { render: r } of elemList) {
            r({ hue, tone });
        }
    }

    return {
        canvas,
        render,
    }
}

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