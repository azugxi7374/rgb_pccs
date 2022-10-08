
import Hammer from 'hammerjs';
import { useEffect, useRef } from 'react';
import { rgb2str, rgb2hsv, norm2PI, hsv2rgb } from '../lib'

export function ColorCircle({ width, rgb, setRGB, confirmedRGB, setConfirmedRGB }) {
    const canvas = useRef(null);

    const r1 = Math.floor(width / 2);
    const [x0, y0] = [r1, r1];
    const r2 = r1 * 3 / 4;
    const r3 = r2 * 0.95 / 1.41;

    const circle = createCircle(x0, y0, r1, r2, rgb);
    const rect = createRect(x0, y0, r3, rgb);

    function handleMouse(reactEv, confirmFlg) {
        const e = reactEv.nativeEvent
        e.preventDefault();
        const mx = e.offsetX, my = e.offsetY;
        handle(mx, my, confirmFlg);
    }
    function handlePanMove(ev) {
        window._ev = ev;
        console.log(ev.center.x, ev.center.y, ev.srcEvent.offsetX, ev.srcEvent.offsetY);
        // handle(ev.center.x, ev.center.y, false);
        handle(ev.srcEvent.offsetX, ev.srcEvent.offsetY, true);
    }
    function handle(mx, my, confirmFlg) {
        for (const elem of [circle, rect]) {
            if (elem.contains({ mx, my })) {
                const rgb2 = elem.changeColor({
                    mx, my, rgb
                });
                setRGB(rgb2);
                if (confirmFlg) {
                    setConfirmedRGB(rgb2);
                }
            }
        }
    }

    function render() {
        const ctx = canvas.current.getContext('2d')
        ctx.clearRect(0, 0, width, width);
        circle.render(ctx);
        rect.render(ctx);
    }
    function addHammer() {
        const mc = new Hammer(canvas.current);
        mc.get('pan').set({ direction: Hammer.DIRECTION_ALL });
        mc.on('panstart', handlePanMove);
        mc.on('panmove', handlePanMove);
        mc.on('panend', handlePanMove);
    }

    useEffect(() => {
        render();
        addHammer();
    })

    return (
        <canvas ref={canvas} width={width} height={width * 1}
            onClick={(ev) => handleMouse(ev, true)}
            onMouseMove={(ev) => handleMouse(ev, false)}
            onMouseLeave={() => setRGB(confirmedRGB)}
        />
    )
}

function createCircle(x0, y0, r1, r2, rgb) {
    const hsv = rgb2hsv(rgb);

    function render(ctx) {
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
        function drawPoint() {
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
        }
        drawPoint();
    }
    function contains({ mx, my }) {
        const dx = mx - x0;
        const dy = my - y0;
        const mr = Math.sqrt(dx * dx + dy * dy);
        return r2 <= mr && mr <= r1;
    }
    function changeColor({ mx, my }) {
        const dx = mx - x0;
        const dy = my - y0;
        const a = norm2PI(Math.atan2(dy, dx));
        const h = Math.round((a + 5 / 12 * 2 * Math.PI) / (2 * Math.PI) * 360) % 360;
        return hsv2rgb([h, hsv[1], hsv[2]]);
    }
    return { render, contains, changeColor }

}


function createRect(x0, y0, r3, rgb) {
    function render(ctx) {
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
        function drawPoint() {
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
        }
        drawPoint();
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
}
