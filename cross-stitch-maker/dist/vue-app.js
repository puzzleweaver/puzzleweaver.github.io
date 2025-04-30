import { Palette, PixelColor, ThreadColor } from "./color.js";
import { PreviewPopulator, UrlHandler } from "./image.js";
import { PatternRenderer, PatternRendererColorGetter } from "./pattern-renderer.js";
import { createPatternImage } from "./run.js";
export function mountApp() {
    // @ts-ignore
    const { createApp, ref, watch, onUpdated, onMounted, computed } = Vue;
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
            // user-selected settings
            const palette = ref(undefined);
            const showLines = ref(true);
            const symbolStyle = ref("numbers");
            const pageOrientation = ref("landscape");
            const saveInk = ref(true);
            const tweak1 = ref(0);
            const tweak2 = ref(0);
            const tweak3 = ref(0);
            // calculated/derived:
            const valid = ref(true);
            const error = ref(undefined);
            const failed = ref(false);
            const resultURL = ref(undefined);
            // re-render if parameters change.
            watch(palette, () => invalidate());
            watch(showLines, () => invalidate());
            watch(symbolStyle, () => invalidate());
            watch(pageOrientation, () => invalidate());
            watch(saveInk, () => invalidate());
            watch(tweak1, () => { invalidate(true); });
            watch(tweak2, () => { invalidate(true); });
            watch(tweak3, () => { invalidate(true); });
            const adjustedImage = () => {
                if (tweak1.value === 0 && tweak2.value === 0 && tweak3.value === 0) {
                    return image.value;
                }
                return image.value.adjust(tweak1.value, tweak2.value, tweak3.value);
            };
            const invalidate = (resetPalette = false) => {
                valid.value = false;
                if (resetPalette)
                    palette.value = undefined;
            };
            const render = async () => {
                if (image.value === undefined)
                    return;
                console.log("Rendering!");
                setTimeout(async () => {
                    if (palette.value === undefined)
                        palette.value = Palette.fromImageMatches(adjustedImage());
                    const adjustedImg = adjustedImage();
                    // draw the image on the canvas,
                    PatternRenderer.fromId("result-canvas", adjustedImg, palette.value, {
                        canvasWidth: 1200,
                        canvasHeight: 1200,
                        colorGetter: PatternRendererColorGetter.fromPalette(adjustedImg, palette.value),
                        showCenter: showLines.value,
                        showLines: showLines.value,
                        symbolStyle: symbolStyle.value,
                        saveInk: saveInk.value,
                    }).render();
                    // uses the original image no matter what.
                    PatternRenderer.fromId("original-image-canvas", image.value, palette.value, {
                        canvasWidth: 600,
                        canvasHeight: 600,
                        colorGetter: PatternRendererColorGetter.fromImage(image.value),
                        showCenter: false,
                        showLines: false,
                        symbolStyle: "none",
                        saveInk: false,
                    }).render();
                    PreviewPopulator.applyCanvas("original-image");
                    PatternRenderer.fromId("color-preview-canvas", adjustedImg, palette.value, {
                        canvasWidth: 600,
                        canvasHeight: 600,
                        colorGetter: PatternRendererColorGetter.fromPalette(adjustedImg, palette.value),
                        showCenter: false,
                        showLines: false,
                        symbolStyle: "none",
                        saveInk: false,
                    }).render();
                    PreviewPopulator.applyCanvas("color-preview");
                    resultURL.value = await UrlHandler.elementToUrl("pattern");
                    valid.value = true;
                }, 100);
            };
            onUpdated(() => {
                if (!valid.value)
                    render();
            });
            return {
                imgUrl,
                showLines,
                symbolStyle,
                pageOrientation,
                saveInk,
                tweak1,
                tweak2,
                tweak3,
                resetTweaks: () => {
                    tweak1.value = tweak2.value = tweak3.value = 0;
                },
                failed,
                error,
                valid,
                resultURL,
                colors: computed(() => {
                    if (palette.value === undefined)
                        return [];
                    return palette.value.colors;
                }),
                description: computed(() => {
                    const img = image.value;
                    if (img === undefined)
                        return "loading...";
                    const width = img.width;
                    const height = img.height;
                    const totalStitches = img.countStitches();
                    return `${width} x ${height}, ${totalStitches} stitches`;
                }),
                threads: ThreadColor.allByDistanceFrom(new PixelColor(200, 248, 64, 255)).map((threadColor) => threadColor.raw),
            };
        },
    });
    /**
     * Describes an entry in the final pattern's color key.
     */
    app.component('color-key', {
        props: ['color', 'symbolStyle', 'saveInk'],
        template: "#color-key-template",
        setup(props) {
            return {
                threadColor: computed(() => props.color.threadColor.raw),
                rawColors: computed(() => props.color.rawColors),
                overlay: computed(() => props.color.getSymbol(props.symbolStyle)),
                description: computed(() => `DMC ${props.color.threadColor.dmcNumber}`),
                longDescription: computed(() => props.color.threadColor.name),
            };
        },
    });
    /**
     * Describes an entry in the color palette, shown when configuring.
     */
    app.component('palette-color', {
        props: ['color', 'symbolStyle', 'saveInk'],
        template: "#palette-color-template",
        setup(props) {
            const expanded = ref(false);
            const toggleExpanded = () => expanded.value = !expanded.value;
            return {
                expanded,
                toggleExpanded,
                threadColor: computed(() => props.color.threadColor.raw),
                rawColors: computed(() => props.color.rawColors),
                overlay: computed(() => props.color.getSymbol(props.symbolStyle)),
                description: computed(() => `DMC ${props.color.threadColor.dmcNumber}`),
                longDescription: computed(() => props.color.threadColor.name),
            };
        },
    });
    /**
     * Describes a little square filled with a raw color, maybe with a nice overlay.
     */
    app.component('color-tile', {
        props: ['color', 'overlay', 'saveInk'],
        template: "#color-tile-template",
        setup(props) {
            return {
                overlayColor: computed(() => {
                    var _a, _b;
                    return (_b = (_a = props.color) === null || _a === void 0 ? void 0 : _a.getOverlayColor()) !== null && _b !== void 0 ? _b : "#f0f";
                }),
            };
        },
    });
    app.component('spinner', {
        template: "#spinner-template",
    });
    app.mount("#vue-app");
}
