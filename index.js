document.addEventListener('DOMContentLoaded', () => {
    init();
});
function init() {
    const container = document.getElementById('container');

    const components = [];
    let state = { rgb: [255, 255, 0] };
    const updateState = (updFunc) => {
        state = updFunc(state);
        components.forEach(render => render(state));
    }

    const { canvas, render: renderPCCS } = createPCCSToneView(400, updateState);
    const { elem: rgbView, render: renderCaption } = createRGBView(400, updateState);

    components.push(renderPCCS);
    components.push(renderCaption);

    updateState((s) => s);

    container.appendChild(rgbView);
    container.appendChild(canvas);
    /*
    canvas.addEventListener('mousemove', (e) => {
        const [x, y] = [e.offsetX, e.offsetY];
        const imgData = ctx.getImageData(x, y, 1, 1);
        const [r, g, b, a] = imgData.data;
        console.log(r, g, b);
    });

    canvas.addEventListener('mousemove', (e) => {
        const [x, y] = [e.offsetX, e.offsetY];
        const imgData = ctx.getImageData(x, y, 1, 1);
        const [r, g, b, a] = imgData.data;
        console.log(r, g, b);
    });
    */
};

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
            } else {
                ctx.fillStyle = toneMap[`${tones[i]}${hue}`];
            }
            ctx.fill();
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

function rgb2str(rgbArray) {
    return "#" + rgbArray.map(v => (v + 256).toString(16).slice(1)).join("")
}
function str2rgb(str) {
    function f(s2) {
        return parseInt(s2, 16)
    }
    return [1, 3, 5].map(i => f(str.slice(i, i + 2)))
}

function colorDist(rgb1, rgb2) {
    const d2 = [0, 1, 2].map(i => rgb1[i] - rgb2[i]).reduce((res, x) => res + x * x, 0);
    return Math.sqrt(d2);
}

function norm2PI(a) {
    const pi2 = Math.PI * 2;
    return ((a % pi2) + pi2) % pi2
}