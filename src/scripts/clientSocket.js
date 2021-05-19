const socket = new WebSocket('ws://localhost:4000')
socket.binaryType = 'arraybuffer'
socket.onopen = () => {
    console.log('Connnection is set')
}
socket.onmessage = (m) => {
    if(m.data == 'send-img') {
        let imageDataArr = ctx.getImageData(0, 0, canv.width, canv.height).data
        let byteArr = new Uint8Array(imageDataArr.length)
        for (let i = 0; i < imageDataArr.length; i++) {
            byteArr[i] = imageDataArr[i]
        }
        socket.send(byteArr)
    }
    else if(/c:\d+/.test(m.data)){
        let userNum = m.data.slice(2, m.data.length)
    }
    else if(m.data == 'save'){
        download()
    }
}