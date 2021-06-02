class Pixel {
  constructor(red, green, blue) {
    this.red = red
    this.green = green
    this.blue = blue
  }
}
function componentToHex(comp) {
  let hex = comp.toString(16)
  return hex.length == 1 ? '0' + hex : hex
}
module.exports.rgbToHex = (r, g, b) => {
  return '0x' + componentToHex(r) + componentToHex(g) + componentToHex(b)
}
