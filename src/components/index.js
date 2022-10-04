import { rgb2str, str2rgb, rgb2hsv, norm2PI, hsv2rgb, colorDist, } from '../lib'
import { TONE_NO_LIST } from '../data'

export function RGBView({ width, rgb, setRGB }) {
    const rgbstr = rgb2str(rgb);
    function onChange(e) {
        setRGB(str2rgb(e.target.value))
    }
    return (
        <div style={{ width: `${width}px`, height: "2em" }}>
            <span style={{ color: rgbstr }}>
                {"\u{25a0}"}
            </span>
            <span>{rgbstr}</span>
            <input type="color" value={rgbstr}
                onChange={onChange}></input>
        </div >
    )
}

export function RGBBar({ width, rgb, setRGB }) {
    const w = width - 10;

    const elemList = [0, 1, 2].map(i => {
        const rgbstr = "RGB".charAt(i);
        const c = "#" + ("ff0000,00ff00,0000ff".split(",")[i])

        return (<div key={i} style={{
            width: (w * rgb[i] / 255) + "px",
            background: c
        }}>
            {rgbstr}:{rgb[i]}
        </div>)
    });

    return <div className="container_rgbbar" style={{ width: width + "px", height: "6em" }}>
        {elemList}
    </div>
}
