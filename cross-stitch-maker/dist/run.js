import { PixelImage } from "./image.js";
import { mountApp } from "./vue-app.js";
// temporary function to test my work as I go.
export async function createPatternImage(imgUrl) {
    console.log("Getting pattern data...");
    const image = await PixelImage.fromUrl(decodeURIComponent(imgUrl));
    return image;
}
mountApp();
