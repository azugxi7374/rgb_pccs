import { useEffect, useRef } from 'react';
import { colorDist, norm2PI, str2rgb } from "../lib";
import { TONE_NO_LIST } from '../data';

const toneMap = window.toneMap;

export function PCCSToneView({ width, rgb, setRGB }) {
    const canvas = useRef(null);
    const r1 = Math.floor(width / 2);
    const [x0, y0] = [r1, r1];
    const r2 = Math.floor(r1 * 3 / 4)

    // elems...
    const hueTone = rgb2PCCSHT(rgb);
    const hue = getHue(hueTone);
    const tone = getTone(hueTone);

    const elemList = []
    elemList.push(...createHues(x0, y0, r1, r2, hue, tone));
    elemList.push(...createTones(x0, y0, r2, hue, tone));

    function handle(reactEv) {
        const e = reactEv.nativeEvent;
        const mx = e.offsetX;
        const my = e.offsetY
        for (const { contains, changeToneHue } of elemList) {
            if (contains(mx, my)) {
                const { tone: tone2, hue: hue2 } = changeToneHue();
                const rgb2 = str2rgb(toneMap[`${tone2}${hue2}`])
                setRGB(rgb2);
            }
        }
    }
    function render() {
        const ctx = canvas.current.getContext('2d')
        ctx.clearRect(0, 0, width, width);
        for (const elm of elemList) {
            elm.render(ctx);
        }
    }
    useEffect(render);
    return (
        <canvas ref={canvas} width={width} height={width * 1}
            onClick={handle}
        />)
}

function createHues(x0, y0, r1, r2, hue, tone) {
    const elemList = [];
    for (let i = 0; i < 24; i++) {
        const clr = toneMap['v' + (i + 1)]
        const a0_24 = (i + 1 - 14 + 24)
        const a_delta = 0.4;
        const a1_24 = a0_24 - a_delta;
        const a2_24 = a0_24 + a_delta;
        const a1 = a1_24 * (2 * Math.PI / 24);
        const a2 = a2_24 * (2 * Math.PI / 24);

        function render(ctx) {
            ctx.beginPath();
            ctx.arc(x0, y0, r1, a1, a2, false);
            ctx.arc(x0, y0, r2, a2, a1, true);

            ctx.closePath();
            ctx.fillStyle = clr;

            ctx.fill();
            if (parseInt(hue) === i + 1) {
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
        function contains(mx, my) {
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
        function changeToneHue() {
            return {
                tone: (i + 1) % 2 === 1 ? 'v' : tone,
                hue: i + 1
            }
        }
        elemList.push({ render, contains, changeToneHue });
    }
    return elemList;
}

function createTones(x0, y0, r2, hue, tone) {
    const tones = 'p ltg g dkg lt sf d dk b s dp v'.split(" ");
    const dx_4 = [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 3];
    const dy_4 = [0, 1, 2, 3, 0, 1, 2, 3, 0.5, 1.5, 2.5, 1.5];
    const elemList = []
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

        function render(ctx) {
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
        function contains(mx, my) {
            if (isDeactive(hue)) {
                return false;
            } else {
                const dx = mx - xx;
                const dy = my - yy;
                const mr = Math.sqrt(dx * dx + dy * dy);
                return mr <= r6;
            }
        }
        function changeToneHue() {
            return { tone: tones[i], hue: hue }
        }
        elemList.push({ render, contains, changeToneHue });
    }
    return elemList;
}


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
function getHue(toneHue) {
    return toneHue.replace(/[a-z]+/, "")
}
function getTone(toneHue) {
    return toneHue.replace(/[0-9]+/, "")
}