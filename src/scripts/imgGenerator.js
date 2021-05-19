const Jimp = require('jimp')
module.exports = (m, path) => {
    let pixels = []
    for(let i = 1;i <= m.length;i += 4) {
        pixels.push(Jimp.rgbaToInt(m[i-1], m[i], m[i+1], m[i+2]))
    }
    //-----Setting pixels to created .png image-----
    let counter = 0
    new Jimp(800, 600, (err, image) => {
        if (err) throw err
        for(let y = 0;y < 600;y++){
            for(let x = 0;x < 800;x++){
                image.setPixelColor(pixels[counter], x, y)
                counter++
            }
        }
        image.write(path, (err) => {
            if (err) throw err
        })
    })
}