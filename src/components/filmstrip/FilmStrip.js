/*
MIT License

Copyright (c) 2009 - 2026 [Codrops](https://codrops.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// A strip of film drawn in WebGL: the frames, rolling, bent round a large drum
// like film round a projector's sprocket wheel (flat and facing the viewer in
// the middle of the page, turning away into depth towards both edges, and
// darker as it turns).
//
// render(view) draws it as view describes: reveal, how far it has opened from
// the line through its middle (0 to 1); offset, how far the film has run, in
// px. The canvas is the page's width and
// the strip's height, inside the strip, at its left edge.

const compile = (gl, type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
    return shader;
};

// The program made from a vertex and a fragment shader, in use
const programOf = (gl, vertex, fragment) => {
    const program = gl.createProgram();
    const vertexShader = compile(gl, gl.VERTEX_SHADER, vertex);
    const fragmentShader = compile(gl, gl.FRAGMENT_SHADER, fragment);
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);
    return program;
};

// The positions the program draws, two numbers each, into its aPosition
const positionsOf = (gl, program, positions) => {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    return buffer;
};

// A texture for a picture, bound, smoothed and stopping at its edges
const textureOf = gl => {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return texture;
};


const settings = {
    // the drum's radius and the camera's distance from the page, as parts of the page's width: the
    // smaller the radius, the stronger the bend; the further the camera, the flatter the perspective.
    // The strip reaches the page's edges while radius × distance / (radius + distance) is at least 0.5
    radius: 0.62,
    distance: 3,
    // how dark the film gets where it has turned furthest away (1 for not at all)
    shade: 0.35,
    // how bright the frames are, so the text over them stays readable
    brightness: 0.5,
    // the gap between frames, in px
    gap: 15,
    // columns of the strip's mesh, along the drum
    columns: 240,
};

const VERTEX = /* glsl */ `
attribute vec2 aPosition;

uniform vec2 uSize;
uniform float uLength;
uniform float uRadius;
uniform float uDistance;
uniform float uHeight;

varying float vAlong;
varying float vAcross;
varying float vLight;

void main() {
    // along the strip, in px from the middle of the page, and across it, 0 at the top
    float along = (aPosition.x - 0.5) * uLength;
    float across = aPosition.y;

    // round the drum: facing the viewer in the middle, turning away towards the ends
    float angle = along / uRadius;
    float x = uRadius * sin(angle);
    float z = uRadius * (cos(angle) - 1.0);
    float scale = uDistance / (uDistance - z);

    vec2 page = vec2(uSize.x * 0.5 + x * scale, uSize.y * 0.5 + (across - 0.5) * uHeight * scale);
    vAlong = along;
    vAcross = across;
    vLight = cos(angle);
    gl_Position = vec4(page.x / uSize.x * 2.0 - 1.0, 1.0 - page.y / uSize.y * 2.0, 0.0, 1.0);
}
`;

const FRAGMENT = /* glsl */ `
precision highp float;

uniform sampler2D uFrames;
uniform float uCount;
uniform float uFrameWidth;
uniform float uStride;
uniform float uOffset;
uniform float uReveal;
uniform float uShade;
uniform float uBrightness;
varying float vAlong;
varying float vAcross;
varying float vLight;

void main() {
    // open from the line through its middle
    if (abs(vAcross - 0.5) * 2.0 > uReveal) discard;

    // which frame, and where in it; nothing in the gaps between frames
    float film = vAlong + uOffset;
    float index = floor(film / uStride);
    float inFrame = film - index * uStride;
    if (inFrame > uFrameWidth) discard;
    index = mod(index, uCount);
    float u = (index + clamp(inFrame / uFrameWidth, 0.002, 0.998)) / uCount;
    vec3 colour = texture2D(uFrames, vec2(u, 1.0 - vAcross)).rgb;
    colour *= uBrightness * mix(uShade, 1.0, max(vLight, 0.0));

    gl_FragColor = vec4(colour, 1.0);
}
`;

// The strip's mesh: columns along it, one row across, x and y from 0 to 1
const mesh = columns => {
    const positions = [];
    for (let i = 0; i <= columns; i++) positions.push(i / columns, 0, i / columns, 1);
    const indices = [];
    for (let i = 0; i < columns; i++) {
        const a = i * 2;
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
    return {positions: new Float32Array(positions), indices: new Uint16Array(indices)};
};

export class FilmStrip {
    // the length of film one round of its frames takes, in px, once sized
    loop = 0;

    constructor(strip, sources) {
        this.strip = strip;
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'film-strip';
        const gl = this.canvas.getContext('webgl', {antialias: true});
        if (!gl) return;
        this.gl = gl;
        this.count = sources.length;

        try {
            this.program = programOf(gl, VERTEX, FRAGMENT);
        } catch {
            gl.getExtension('WEBGL_lose_context')?.loseContext();
            this.gl = undefined;
            return;
        }
        const program = this.program;

        const {positions, indices} = mesh(settings.columns);
        this.elements = indices.length;
        this.vertexBuffer = positionsOf(gl, program, positions);
        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

        this.uniforms = {};
        const names = [
            'uSize',
            'uLength',
            'uRadius',
            'uDistance',
            'uHeight',
            'uFrameWidth',
            'uStride',
            'uOffset',
            'uReveal',
        ];
        names.forEach(name => (this.uniforms[name] = gl.getUniformLocation(program, name)));
        const set = (name, value) => gl.uniform1f(gl.getUniformLocation(program, name), value);
        set('uCount', this.count);
        set('uShade', settings.shade);
        set('uBrightness', settings.brightness);
        gl.clearColor(0, 0, 0, 0);

        // the frames side by side in one picture, a power of two wide and high so it can be mipmapped
        this.ready = Promise.all(
            sources.map(src => {
                const image = new Image();
                image.src = src;
                return image.decode().then(() => image);
            }),
        ).then(images => {
            if (this.disposed) return;
            const max = gl.getParameter(gl.MAX_TEXTURE_SIZE);
            const atlas = document.createElement('canvas');
            atlas.width = Math.min(4096, max);
            atlas.height = atlas.width / 8;
            const context = atlas.getContext('2d');
            const slot = atlas.width / images.length;
            images.forEach((image, i) => {
                const size = Math.min(image.naturalWidth, image.naturalHeight);
                context.drawImage(image,
                    (image.naturalWidth - size) / 2, (image.naturalHeight - size) / 2,
                    size, size, i * slot, 0, slot, atlas.height);
            });
            this.texture = textureOf(gl);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            this.isReady = true;
        });

        this.canvas.hidden = true;
        strip.append(this.canvas);
    }

    get works() {
        return Boolean(this.gl) && !this.gl.isContextLost() && this.isReady === true;
    }

    // the page's width and the strip's height; square frames at that height
    resize() {
        const {gl, canvas, uniforms} = this;
        const width = this.strip.clientWidth;
        const height = this.strip.offsetHeight;
        const ratio = Math.min(window.devicePixelRatio, 2);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        gl.viewport(0, 0, canvas.width, canvas.height);

        const radius = settings.radius * width;
        const frameWidth = height;
        const stride = frameWidth + settings.gap;
        this.loop = stride * this.count;
        gl.uniform2f(uniforms.uSize, width, height);
        // half round the drum each way, more than the page ever shows
        gl.uniform1f(uniforms.uLength, Math.PI * radius);
        gl.uniform1f(uniforms.uRadius, radius);
        gl.uniform1f(uniforms.uDistance, settings.distance * width);
        gl.uniform1f(uniforms.uHeight, height);
        gl.uniform1f(uniforms.uFrameWidth, frameWidth);
        gl.uniform1f(uniforms.uStride, stride);
    }

    render({reveal, offset}) {
        const {gl, uniforms} = this;
        gl.clear(gl.COLOR_BUFFER_BIT);
        if (!this.isReady || reveal <= 0) return;
        gl.uniform1f(uniforms.uReveal, reveal);
        gl.uniform1f(uniforms.uOffset, offset);
        gl.drawElements(gl.TRIANGLES, this.elements, gl.UNSIGNED_SHORT, 0);
    }
    dispose() {
        this.disposed = true;
        const {gl} = this;
        if (gl) {
            gl.deleteTexture(this.texture ?? null);
            gl.deleteBuffer(this.vertexBuffer ?? null);
            gl.deleteBuffer(this.indexBuffer ?? null);
            gl.deleteProgram(this.program ?? null);
        }
        this.canvas.remove();
    }
}
