let mouseDown = false
window.onkeypress = (event) => {
    let keyCode = event.code.slice(event.code.length-1, event.code.length)
    if(keyCode == 'S') {
        const socket = new WebSocket('ws://localhost:3000')
        socket.binaryType = 'arraybuffer'
        socket.onopen = () => {
            console.log('Connnection is set')
            socket.send('gen-img')
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
            else if(m.data == 'save'){
                download()
            }
        }
    }
    else if(keyCode == 'F'){
        if(figures.length == 1) alert('There is only one figure on the canvas')  
        else alert(`There are ${figures.length} figures on the canvas`)    
    }
    else if(keyCode == 'C'){
        ctx.clearRect(0, 0, canv.width, canv.height)
        figures.length = 0 
    }
    else if(keyCode == 'G'){
        alert(`Canv: x - ${canvPos.left};y - ${canvPos.top}`)
    }
    else if(keyCode == 'U'){
        ctx.clearRect(0, 0, canv.width, canv.height)
        figures.pop()
        drawFigures(figures)
    } 
}
const points = []
const figures = []
const canv = document.getElementById('canvas')
const canvPos = canv.getBoundingClientRect()
canv.onmouseover = () => {
    canv.style.border = '3px black dashed'
}
canv.onmouseout = () => {
    canv.style.border = '5px black solid'
}
canv.onmousedown = (event) => {
    let x0 = event.clientX - canvPos.left
    let y0 = event.clientY - canvPos.top
    let mode = document.forms[0].mode.value
    if(mode == 'fill' || mode == 'move') return
    console.log('Figure drawing started')
    mouseDown = true
    points.push([x0, y0])
    if(mode != 'pencil' && mode != 'line') return
    ctx.beginPath()
    ctx.moveTo(x0, y0)
}
canv.onmouseup = (event) => {
    mouseDown = false
    let mode = document.forms[0].mode.value
    let x1 = event.clientX - canvPos.left
    let y1 = event.clientY - canvPos.top
    if(mode == 'rect'){
        let [x0, y0] = points[0]
        ctx.clearRect(x0, y0, Math.floor(points[1][0]-x0), Math.floor(points[1][1]-y0))
        points.pop()
        if(x0 < x1 && y0 < y1){
            ctx.strokeRect(x0, y0, Math.floor(x1-x0), Math.floor(y1-y0))
            setTimeout(() => {
                ctx.fillRect(x0, y0, Math.floor(x1-x0), Math.floor(y1-y0))
            }, 300)
        }
        else {
            alert('Not possible to draw a rect')
            points.length = 0 
            return
        }
    }
    else if(mode == 'circle'){
        ctx.beginPath()
        ctx.arc(...points[0], Math.abs(Math.floor(x1-points[0][0])), 0, Math.PI * 2)
        ctx.closePath()
        ctx.stroke()
        setTimeout(() => {
            ctx.fill()
        }, 300)
    }
    else if(mode == 'pencil' || mode == 'line'){
        ctx.lineTo(x1, y1)
        ctx.closePath()
        ctx.stroke()
    }
    else if(mode == 'move'){
        locateFigure([x1, y1])
        return
    }
    else {
        let locatedFigure = locateFigure([x1, y1])
        fillFigure(locatedFigure)
        return
    }
    /*for(let i = 0; i < points.length;i++){
        points[i][0] += 150
    } 
    drawByPoints(points)*/
    points.push([x1, y1])
    let figure = {}
    figure.type = mode
    figure.strokeStyle = ctx.strokeStyle
    if(figure.type != 'circle') figure.points = clone(points)
    if(mode == 'rect') {
        figure.width = Math.floor(x1-points[0][0])
        figure.height = Math.floor(y1-points[0][1])
        figure.fillStyle = ctx.fillStyle
    } 
    if(mode == 'circle'){
        figure.centre = points[0]
        figure.radius = Math.abs(Math.floor(x1-points[0][0]))
        figure.fillStyle = ctx.fillStyle
    }
    figures.push(figure)
    points.length = 0 
}
canv.onmousemove = (event) => {
    let x1 = event.clientX - canvPos.left
    let y1 = event.clientY - canvPos.top
    let mode = document.forms[0].elements[0].value
    if(mouseDown && mode == 'pencil'){
        points.push([x1, y1])
        ctx.lineTo(x1, y1)
        ctx.closePath()
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(x1, y1)
    }
    else if(mouseDown && mode == 'rect'){
        let [x0, y0] = points[0]
        if(points[1] != undefined) {
            ctx.clearRect(x0, y0, Math.floor(points[1][0]-x0), Math.floor(points[1][1]-y0))
            points.pop()
        }
        points.push([x1, y1])
        ctx.strokeRect(x0, y0, Math.floor(x1-x0), Math.floor(y1-y0))
    }
}
document.getElementById('clearBtn').onclick = () => {
    ctx.clearRect(0, 0, canv.width, canv.height)
    figures.length = 0 
}
const ctx = canv.getContext('2d')
function drawByPoints(points){
    for(let i = 0; i < points.length-1; i++){
        ctx.beginPath()
        ctx.moveTo(...points[i])
        ctx.lineTo(...points[i+1])
        ctx.closePath()
        ctx.stroke()
    }
}
function drawFigures(figures){
    for(let figure of figures){
        if(figure.type == 'rect'){
            let [x0, y0] = figure.points[0]
            ctx.fillStyle = figure.fillStyle
            ctx.strokeStyle = figure.strokeStyle
            ctx.strokeRect(x0, y0, figure.width, figure.height)
            ctx.fillRect(x0, y0, figure.width, figure.height)
        }
        else if(figure.type == 'circle'){
            ctx.beginPath()
            ctx.arc(...figure.centre, figure.radius, 0, Math.PI * 2)
            ctx.closePath()
            ctx.fillStyle = figure.fillStyle
            ctx.strokeStyle = figure.strokeStyle
            ctx.stroke()
            ctx.fill()
        }
        else if(figure.type == 'pencil' || figure.type == 'line'){
            ctx.strokeStyle = figure.strokeStyle
            ctx.beginPath()
            ctx.moveTo(...figure.points[0])
            if(figure.type == 'line') ctx.lineTo(...figure.points[1])
            else {
                for(let i = 1; i < figure.points.length; i++){
                    ctx.lineTo(...figure.points[i])
                    ctx.closePath()
                    ctx.stroke()
                    ctx.beginPath()
                    ctx.moveTo(...figure.points[i])
                }
                ctx.lineTo(...figure.points[figure.points.length-1])
            }
            ctx.closePath()
            ctx.stroke()
        }
    }
}
function locateFigure(point){
    let [x1, y1] = point
    for(let figure of figures){
        if(figure.type == 'rect'){
            if(x1 <= figure.points[0][0] + figure.width
            && x1 >= figure.points[0][0]
            && y1 <= figure.points[0][1] + figure.height
            && y1 >= figure.points[0][1]
            ) {
                return figure
            }
        }
        else if(figure.type == 'circle'){
            if(Math.abs(x1 - figure.centre[0]) <= figure.radius 
            && Math.abs(y1 - figure.centre[1]) <= figure.radius ) {
                return figure
            }
        }
        else if(figure.type == 'line' || figure.type == 'pencil'){
            for(let point of figure.points){
                if(point[0] == x1 && point[1] == y1) {
                    return figure
                }
            }
        }
    }
    return null
}
function fillFigure(figure){
    if(figure.type == 'rect') ctx.fillRect(...figure.points[0], figure.width, figure.height)
    else {
        ctx.beginPath()
        ctx.arc(...figure.centre, figure.radius, 0, Math.PI * 2)
        ctx.closePath()
        ctx.fill()
    }
}
function download() {
    var element = document.createElement('a')
    element.setAttribute('href', '/assets/image.png')
    element.setAttribute('download', '')
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
}
function cutCircle(x, y, radius){
    ctx.globalCompositeOperation = 'destination-out'
    ctx.arc(x, y, radius, 0, Math.PI*2, true)
    ctx.fill()
}
function clone(obj){
    return JSON.parse(JSON.stringify(obj))
}