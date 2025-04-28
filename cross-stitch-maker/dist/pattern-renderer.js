import { PixelColor } from "./color.js";
const bg1 = new PixelColor(255, 255, 255, 255);
const bg2 = new PixelColor(220, 220, 220, 255);
const lineWhite = "#f8f8f8";
const lineBlack = "#080808";
export class PatternRenderer {
    constructor(canvas, image, palette, options) {
        this.canvas = canvas;
        this.image = image;
        this.palette = palette;
        this.options = options;
        // set up canvas with size:
        this.ctx = this.canvas.getContext("2d");
        // TODO extract
        const { width, height } = options;
        this.canvas.setAttribute("width", width.toString());
        this.canvas.setAttribute("height", height.toString());
        this.canvas.style.width = width.toString();
        this.canvas.style.height = height.toString();
        // preprocess for rendering:
        this.centerX = Math.floor(this.image.width / 2);
        this.centerY = Math.floor(this.image.height / 2);
        const screenPx = Math.min(this.canvas.width, this.canvas.height);
        this.pixelDim = screenPx / Math.max(this.image.width, this.image.height);
        const imageWidthPx = this.pixelDim * this.image.width;
        const imageHeightPx = this.pixelDim * this.image.height;
        this.x0 = screenPx / 2 - imageWidthPx / 2;
        this.y0 = screenPx / 2 - imageHeightPx / 2;
    }
    static fromId(id, image, palette, options) {
        const canvas = document.getElementById(id);
        return new PatternRenderer(canvas, image, palette, options);
    }
    drawText(text, color, x, y, w, h) {
        this.ctx.fillStyle = color;
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.font = `${w * 2 / 3}px Verdana`;
        this.ctx.fillText(text, x + w / 2, y + h / 2);
    }
    getX(x) { return this.x0 + x * this.pixelDim; }
    getY(y) { return this.y0 + y * this.pixelDim; }
    getSymbolAt(x, y, symbolStyle = "none") {
        var _a, _b;
        return (_b = (_a = this.image.getPaletteColor(this.palette, x, y)) === null || _a === void 0 ? void 0 : _a.getSymbol(symbolStyle)) !== null && _b !== void 0 ? _b : "!";
    }
    static getLineWidthFor(offset, modulo = 10) {
        const modded = (offset + modulo * 100) % modulo;
        if (offset === 0)
            return 1.2;
        if (modded === 0)
            return 1;
        return 0.2;
    }
    getBgAt(x, y) {
        const x5 = Math.floor((x - this.centerX) / 5);
        const y5 = Math.floor((y - this.centerY) / 5);
        return (x5 + y5) % 2 === 0 ? bg1 : bg2;
    }
    getColorAt(x, y) {
        var _a;
        const paletteColor = this.image.getPaletteColor(this.palette, x, y);
        return (_a = paletteColor === null || paletteColor === void 0 ? void 0 : paletteColor.threadColor.raw) !== null && _a !== void 0 ? _a : this.getBgAt(x, y);
    }
    getLineColorOn(x, y) {
        if (this.getColorAt(x, y).isBright())
            return lineBlack;
        return lineWhite;
    }
    strokeLine(fromX, fromY, offsetX, offsetY) {
        // figure out line width
        const vertical = offsetX === 0, horizontal = offsetY === 0;
        if (vertical)
            this.ctx.lineWidth = PatternRenderer.getLineWidthFor(fromX - this.centerX);
        if (horizontal)
            this.ctx.lineWidth = PatternRenderer.getLineWidthFor(fromY - this.centerY);
        // figure out color
        const color1 = this.getColorAt(fromX, fromY);
        const color2 = this.getColorAt(fromX - offsetY, fromY - offsetX);
        const isLineWhite = !color1.isBright() && !color2.isBright();
        this.ctx.strokeStyle = isLineWhite ? lineWhite : lineBlack;
        this.ctx.beginPath();
        this.ctx.moveTo(this.getX(fromX), this.getY(fromY));
        this.ctx.lineTo(this.getX(fromX + offsetX), this.getY(fromY + offsetY));
        this.ctx.stroke();
    }
    drawCenterBox(dx, dy) {
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = this.getLineColorOn(this.centerX + dx, this.centerY + dy);
        const size = 0.2;
        this.ctx.strokeRect(this.getX(this.centerX + dx * size), this.getY(this.centerY + dy * size), this.pixelDim * size, this.pixelDim * size);
    }
    render() {
        for (var x = 0; x < this.image.width; x++) {
            for (var y = 0; y < this.image.height; y++) {
                const color = this.getColorAt(x, y);
                this.ctx.fillStyle = color.toString();
                this.ctx.fillRect(this.getX(x) - 0.5, this.getY(y) - 0.5, this.pixelDim + 1, this.pixelDim + 1);
                // maybe draw text
                if (this.options.symbolStyle !== "none" && !this.image.colors[x][y].isEmpty()) {
                    this.drawText(this.getSymbolAt(x, y, this.options.symbolStyle), color.getOverlayColor(), this.getX(x), this.getY(y), this.pixelDim, this.pixelDim);
                }
                // maybe draw lines
                if (this.options.showLines) {
                    this.strokeLine(x, y, 0, 1);
                    this.strokeLine(x, y, 1, 0);
                }
            }
        }
        // maybe draw center boxes
        if (this.options.showCenter) {
            for (var i = -1; i <= 0; i++) {
                for (var j = -1; j <= 0; j++) {
                    this.drawCenterBox(i, j);
                }
            }
        }
        // if (this.options.showLines) {
        //     ctx.lineWidth = 1;
        //     strokeLineAtX(centerX);
        //     strokeLineAtY(centerY);
        //     ctx.strokeRect(getX(centerX) - 3, getY(centerY) - 3, 6, 6);
        //     for (var x = 1; x < image.width; x++) {
        //         ctx.lineWidth = getLineWidth(x - centerX);
        //         strokeLineAtX(x);
        //     }
        //     for (var y = 1; y < image.height; y++) {
        //         ctx.lineWidth = getLineWidth(y - centerY);
        //         strokeLineAtY(y);
        //     }
        // }
    }
}
