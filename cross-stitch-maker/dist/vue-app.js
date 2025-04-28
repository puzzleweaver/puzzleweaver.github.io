import { Palette } from "./color.js";
import { UrlHandler } from "./image.js";
import { PatternRenderer } from "./pattern-renderer.js";
import { createPatternImage } from "./run.js";
export function mountApp() {
    // @ts-ignore
    const { createApp, ref, watch, onUpdated, onMounted } = Vue;
    const app = createApp({
        setup() {
            const image = ref(undefined);
            const imgUrl = UrlHandler.getQueryParam("img");
            onMounted(async () => {
                createPatternImage(imgUrl)
                    .then((newImage) => {
                    palette.value = Palette.fromImageMatches(newImage);
                    image.value = newImage;
                }).catch((e) => {
                    failed.value = true;
                    error.value = [
                        "The most common reasons this happens are:",
                        "1) this website cannot use the specified image because of the Cross-Origin Resource Sharing (CORS) policy of whoever owns the image",
                        "2) the url does not point to a valid image",
                        "One solution is to download the image and then upload it as a file (instead of using a URL).",
                    ].join("\n\n");
                });
            });
            // settings
            const palette = ref(undefined);
            const showLines = ref(true);
            const showCenter = ref(true);
            const symbolStyle = ref("none");
            const pageOrientation = ref("landscape");
            // calculated/derived:
            const valid = ref(true);
            const error = ref(undefined);
            const failed = ref(false);
            const resultURL = ref(undefined);
            // re-render if parameters change.
            watch(palette, () => invalidate());
            watch(showLines, () => invalidate());
            watch(showCenter, () => invalidate());
            watch(symbolStyle, () => invalidate());
            watch(pageOrientation, () => invalidate());
            const invalidate = () => valid.value = false;
            const render = async () => {
                setTimeout(async () => {
                    // draw the image on the canvas,
                    PatternRenderer.fromId("result-canvas", image.value, palette.value, {
                        width: 1200,
                        height: 1200,
                        showCenter: showCenter.value,
                        showLines: showLines.value,
                        symbolStyle: symbolStyle.value,
                    }).render();
                    // then update the low-res previews
                    // @ts-ignore
                    const canvas = await html2canvas(document.getElementById("pattern"), { allowTaint: false });
                    resultURL.value = canvas.toDataURL();
                    valid.value = true;
                }, 100);
            };
            onUpdated(() => {
                if (image.value === undefined || palette.value === undefined)
                    return;
                if (!valid.value)
                    render();
            });
            return {
                imgUrl,
                showLines,
                showCenter,
                symbolStyle,
                pageOrientation,
                failed,
                error,
                valid,
                resultURL,
                // functions for processing state variables at render
                getColors: () => {
                    if (palette.value === undefined)
                        return [];
                    return palette.value.colors;
                },
                getDescription: () => {
                    const img = image.value;
                    if (img === undefined)
                        return "loading...";
                    const width = img.width;
                    const height = img.height;
                    const totalStitches = img.countStitches();
                    return `${width} x ${height}, ${totalStitches} stitches`;
                },
            };
        },
    });
    /**
     * Describes an entry in the final pattern's color key.
     */
    app.component('color-key', {
        props: ['color', 'symbolStyle'],
        template: "#color-key-template",
        setup(props) {
            const { color, symbolStyle } = props;
            console.log(`ColorKey symbolstyle = ${symbolStyle}`);
            const rawColors = color.rawColors;
            const threadColor = color.threadColor;
            const overlay = color.getSymbol(symbolStyle);
            const description = `DMC ${threadColor.dmcNumber}`;
            return {
                threadColor: threadColor.raw,
                rawColors,
                overlay,
                description,
            };
        },
    });
    /**
     * Describes an entry in the color palette, shown when configuring.
     */
    app.component('palette-color', {
        props: ['color', 'symbolStyle'],
        template: "#palette-color-template",
        setup(props) {
            const { color, symbolStyle } = props;
            console.log(`PaletteColor symbolstyle = ${symbolStyle}`);
            const threadColor = color.threadColor;
            const rawColors = color.rawColors;
            const overlay = color.getSymbol(symbolStyle);
            const description = `DMC ${threadColor.dmcNumber}`;
            const longDescription = threadColor.name;
            return {
                threadColor: threadColor.raw,
                rawColors,
                overlay,
                description,
                longDescription,
            };
        },
    });
    /**
     * Describes a little square filled with a raw color, maybe with a nice overlay.
     */
    app.component('color-tile', {
        props: ['color', 'overlay'],
        template: "#color-tile-template",
        setup(props) {
            const color = props.color;
            const overlayColor = props.color.getOverlayColor();
            const overlay = props.overlay;
            return {
                color,
                overlayColor,
                overlay,
            };
        },
    });
    app.component('spinner', {
        template: "#spinner-template",
    });
    app.mount("#vue-app");
}
