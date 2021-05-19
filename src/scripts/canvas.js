let mouseDown = false
let draggingFigure = null
let ctxFigure = null
window.onkeypress = (event) => {
    let keyCode = event.code.slice(event.code.length-1, event.code.length)
    if(keyCode == 'S') {
        socket.send('gen-img')
    }
    else if(keyCode == 'F'){
        if(figures.length == 1) alert('There is only one figure on the canvas')  
        else alert(`There are ${figures.length} figures on the canvas`)    
    }
    else if(keyCode == 'C'){
        ctx.clearRect(0, 0, canv.width, canv.height)
        ctx.fillStyle = canvasColor.value
        ctx.fillRect(0, 0, canv.width, canv.height)
        ctx.fillStyle = fillColor.value
        figures.length = 0 
    }
    else if(keyCode == 'G'){
        alert(`Canv: x - ${canvPos.left};y - ${canvPos.top}`)
    }
    else if(keyCode == 'W'){
        alert(`The widht of the line is ${ctx.lineWidth}`)
    }
    else if(keyCode == 'U'){
        if(changes.length > 0){
            let lastChange = changes.pop()
            lastChange.figure.fillStyle = lastChange.color
        }
        else figures.pop()
        ctx.clearRect(0, 0, canv.width, canv.height)
        drawFigures(figures)
    } 
}
const points = []
const figures = []
const changes = []
const canv = document.getElementById('canvas')
const canvPos = canv.getBoundingClientRect()
const ctxMenu = document.getElementById('figure_ctx_menu')
canv.addEventListener('contextmenu', (event) => {
    event.preventDefault()
    let x0 = event.clientX - canvPos.left
    let y0 = event.clientY - canvPos.top
    ctxFigure = locateFigure([x0, y0])
    if(!ctxFigure) return
    ctxMenu.style.top = `${event.clientY}px`
    ctxMenu.style.left = `${event.clientX}px`
    ctxMenu.style.display = 'block'
})
ctxMenu.addEventListener('click', (event) => {
    event.stopPropagation()
})
window.addEventListener('scroll', () => {
    ctxMenu.style.display = ''
})
document.getElementById('dup_option').addEventListener('click', () => {
    if(ctxFigure.type == 'rect'){
        let clonedRect = clone(ctxFigure)
        clonedRect.points[0][0] += 20
        clonedRect.points[0][1] += 20
        drawRectangle(clonedRect.points[0], ctxFigure.width, ctxFigure.height, ctxFigure.fillStyle, ctxFigure.strokeStyle)
        figures.push(clonedRect)
    }
    else if(ctxFigure.type == 'circle'){
        let clonedCircle = clone(ctxFigure)
        clonedCircle.centre[0] += 20
        clonedCircle.centre[1] += 20
        drawCircle(clonedCircle.centre, ctxFigure.radius, ctxFigure.fillStyle, ctxFigure.strokeStyle)
        figures.push(clonedCircle)
    }
    else if(ctxFigure.type == 'triangle'){
        let clonedTriangle = clone(ctxFigure)
        clonedTriangle.topPoint[0] += 20
        clonedTriangle.topPoint[1] += 20
        drawTriangle(clonedTriagle.topPoint, ctxFigure.topFlag, ctxFigure.width, ctxFigure.height, ctxFigure.fillStyle, ctxFigure.strokeStyle)
        figures.push(clonedTriangle)
    }
    ctxFigure = null
    ctxMenu.style.display = ''
})
document.getElementById('del_option').addEventListener('click', () => {
    ctx.clearRect(0, 0, canv.width, canv.height)
    for(let i = 0;i < figures.length;i++){
        if(figures[i] == ctxFigure) {
            figures.splice(i, 1)
            break
        }
    }
    drawFigures(figures)
    ctxFigure = null
    ctxMenu.style.display = ''
})
canv.onmousedown = customMouseDown
canv.onmousemove = customMouseMove
canv.onmouseup = customMouseUp
const ctx = canv.getContext('2d')
ctx.lineJoin = ctx.lineCap = 'round'
function customMouseDown(event){
    if(event.button == 2) return
    ctxMenu.style.display = ''
    let x0 = event.clientX - canvPos.left
    let y0 = event.clientY - canvPos.top
    let mode = curMode
    if(mode == 'fill') return
    mouseDown = true
    if(mode == 'spray') return
    points.push([x0, y0])
    if(mode == 'move'){
        draggingFigure = locateFigure([x0, y0])
        return
    }
    console.log('Figure drawing started')
    if(mode != 'pencil' && mode != 'line') return
    ctx.beginPath()
    ctx.moveTo(x0, y0)
}
function customMouseMove(event){
    if(event.button == 2) return
    let x1 = event.clientX - canvPos.left
    let y1 = event.clientY - canvPos.top
    let mode = curMode
    if(mouseDown && mode == 'pencil'){
        points.push([x1, y1])
        ctx.lineTo(x1, y1)
        ctx.closePath()
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(x1, y1)
    }
    else if(mouseDown && mode == 'spray'){
        for (let i = 50; i--; ) {
            let radius = 20
            let x2 = x1 + randomInt(-radius, radius)
            let y2 = y1 + randomInt(-radius, radius)
            ctx.fillRect(x2, y2, 1, 1)
            points.push([x2, y2])
        }
    }
    else if(mouseDown && mode == 'rect'){
        let [x0, y0] = points[0]
        if(points[1] != undefined) {
            points.pop()
            figures.pop()
            ctx.clearRect(0, 0, canv.width, canv.height)
            drawFigures(figures)
        }
        points.push([x1, y1])
        ctx.strokeRect(x0, y0, Math.floor(x1-x0), Math.floor(y1-y0))
        let figure = {}
        figure.type = 'rect'
        figures.push(figure)
    }
    else if(mouseDown && mode == 'triangle'){
        let [x0, y0] = points[0]
        if(points[1] != undefined) {
            points.pop()
            figures.pop()
            ctx.clearRect(0, 0, canv.width, canv.height)
            drawFigures(figures)
        }
        points.push([x1, y1])
        ctx.beginPath()
        let width = Math.abs(x1 - x0) * 2
        ctx.moveTo(x0, y0)
        ctx.lineTo(x1, y1)
        if(x0 > x1){
            ctx.lineTo(x1 + width, y1)
        }
        else{
            ctx.lineTo(x1 - width, y1)
        }
        ctx.closePath()
        ctx.stroke()
        let figure = {}
        figure.type = 'triangle'
        figures.push(figure)
    }
    else if(mouseDown && mode == 'circle'){
        let [x0, y0] = points[0]
        if(points[1] != undefined) {
            points.pop()
            figures.pop()
            ctx.clearRect(0, 0, canv.width, canv.height)
            drawFigures(figures)
        }
        points.push([x1, y1])
        ctx.beginPath()
        ctx.arc(...points[0], Math.abs(x1-x0), 0, Math.PI * 2)
        ctx.closePath()
        ctx.stroke()
        let figure = {}
        figure.type = 'circle'
        figures.push(figure)
    }
    else if(mouseDown && mode == 'move'){
        if(!draggingFigure) return
        let [x0, y0] = points[0]
        let dx = x1 - x0
        let dy = y1 - y0
        if(draggingFigure.type == 'rect'){
            draggingFigure.points[0][0] += dx
            draggingFigure.points[0][1] += dy
        }
        else if(draggingFigure.type == 'triangle'){
            draggingFigure.topPoint[0] += dx
            draggingFigure.topPoint[1] += dy
        }
        else if(draggingFigure.type == 'circle'){
            draggingFigure.centre[0] += dx
            draggingFigure.centre[1] += dy
        }
        if(draggingFigure.type == 'pencil'){
            for(let point of draggingFigure.points){
                point[0] += dx
                point[1] += dy
            }
        }
        ctx.clearRect(0, 0, canv.width, canv.height)
        drawFigures(figures)
        points[0] = [x1, y1]
    }
}
function customMouseUp(event){
    if(event.button == 2) return
    mouseDown = false
    let mode = curMode
    let x1 = event.clientX - canvPos.left
    let y1 = event.clientY - canvPos.top
    if(mode == 'rect'){
        let [x0, y0] = points[0]
        points.pop()
        figures.pop()
        let smallerX = x0 < x1? x0 : x1
        let smallerY = y0 < y1? y0 : y1
        ctx.strokeRect(smallerX, smallerY, Math.abs(x1-x0), Math.abs(y1-y0))
        ctx.fillRect(smallerX, smallerY, Math.abs(x1-x0), Math.abs(y1-y0))
    }
    else if(mode == 'triangle'){
        let [x0, y0] = points[0]
        points.pop()
        figures.pop()
        ctx.beginPath()
        let width = Math.abs(x1 - x0) * 2
        ctx.moveTo(x0, y0)
        ctx.lineTo(x1, y1)
        if(x0 > x1){
            ctx.lineTo(x1 + width, y1)
        }
        else{
            ctx.lineTo(x1 - width, y1)
        }
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
    }
    else if(mode == 'circle'){
        points.pop()
        figures.pop()
        ctx.beginPath()
        ctx.arc(...points[0], Math.abs(Math.floor(x1-points[0][0])), 0, Math.PI * 2)
        ctx.closePath()
        ctx.stroke()
        ctx.fill()
    }
    else if(mode == 'pencil' || mode == 'line'){
        ctx.lineTo(x1, y1)
        ctx.closePath()
        ctx.stroke()
    }
    else if(mode == 'move'){
        points.length = 0 
        draggingFigure = null
        return
    }
    else if(mode == 'fill'){
        let locatedFigure = locateFigure([x1, y1])
        changes.push({figure : locatedFigure, color : locatedFigure.fillStyle})
        fillFigure(locatedFigure)
        locatedFigure.fillStyle = ctx.fillStyle
        return
    }
    let figure = {}
    if(mode != 'spray') {
        points.push([x1, y1])
        figure.strokeStyle = ctx.strokeStyle
    }
    else figure.fillStyle = ctx.fillStyle
    figure.type = mode
    if(figure.type != 'circle' && figure.type != 'triangle') figure.points = clone(points)
    if(mode == 'rect') {
        figure.width = Math.floor(x1-points[0][0])
        figure.height = Math.floor(y1-points[0][1])
        figure.fillStyle = ctx.fillStyle
    } 
    else if(mode == 'circle'){
        figure.centre = points[0]
        figure.radius = Math.abs(Math.floor(x1-points[0][0]))
        figure.fillStyle = ctx.fillStyle
    }
    else if(mode == 'triangle'){
        figure.topPoint = points[0]
        figure.width = Math.abs(x1 - points[0][0]) * 2
        figure.height = Math.abs(y1 - points[0][1])
        if(y1 >= points[0][1]) figure.topFlag = true 
        else figure.topFlag = false
        figure.fillStyle = ctx.fillStyle
    }
    else if(mode == 'pencil'){
        let minX = figure.points[0][0]
        let minY = figure.points[0][1]
        let maxX = figure.points[0][0]
        let maxY = figure.points[0][1]
        for(let point of figure.points){
            if(point[0] < minX) minX = point[0]
            if(point[1] < minY) minY = point[1]
            if(point[0] > maxX) maxX = point[0]
            if(point[1] > maxY) maxY = point[1]
        }
        figure.topPoint = [minX, minY]
        figure.width =  maxX - minX
        figure.height = maxY - minY
        figure.inOutline = (point) => {
            let [x0, y0] = point
            return (x0 <= figure.topPoint[0] + figure.width
                && x0 >= figure.topPoint[0]
                && y0 <= figure.topPoint[1] + figure.height
                && y0 >= figure.topPoint[1]
            ) 
        }
        figure.drawOutline = () => {
            ctx.strokeRect(figure.topPoint[0], figure.topPoint[1], figure.width, figure.height)
        }
    }
    figures.push(figure)
    points.length = 0 
}
function drawByPoints(points){
    for(let i = 0; i < points.length-1; i++){
        ctx.beginPath()
        ctx.moveTo(...points[i])
        ctx.lineTo(...points[i+1])
        ctx.closePath()
        ctx.stroke()
    }
}
function drawRectangle(topPoint, width, height, fillColor, strokeColor){
    let [x0, y0] = topPoint
    ctx.fillStyle = fillColor
    ctx.strokeStyle = strokeColor
    ctx.strokeRect(x0, y0, width, height)
    ctx.fillRect(x0, y0, width, height)
    ctx.fillStyle = document.forms[0]['f-color'].value
    ctx.strokeStyle = document.forms[0]['s-color'].value
}
function drawTriangle(topPoint, topFlag, width, height, fillColor, strokeColor){
    ctx.beginPath()
    let [x0, y0] = topPoint
    ctx.fillStyle = fillColor
    ctx.strokeStyle = strokeColor
    let x1 = x0 - (width / 2)
    let y1 = 0 
    if(topFlag) y1 = y0 + height
    else y1 = y0 - height
    ctx.moveTo(x0, y0)
    ctx.lineTo(x1, y1)
    ctx.lineTo(x1 + width, y1)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = document.forms[0]['f-color'].value
    ctx.strokeStyle = document.forms[0]['s-color'].value
}
function drawCircle(centre, radius, fillColor, strokeColor){
    ctx.beginPath()
    ctx.arc(...centre, radius, 0, Math.PI * 2)
    ctx.closePath()
    ctx.fillStyle = fillColor
    ctx.strokeStyle = strokeColor
    ctx.stroke()
    ctx.fill()
    ctx.fillStyle = document.forms[0]['f-color'].value
    ctx.strokeStyle = document.forms[0]['s-color'].value
}
function drawFigures(figures){
    ctx.fillStyle = canvasColor.value
    ctx.fillRect(0, 0, canv.width, canv.height)
    ctx.fillStyle = fillColor.value
    for(let figure of figures){
        if(figure.type == 'rect'){
            drawRectangle(figure.points[0], figure.width, figure.height, figure.fillStyle, figure.strokeStyle)
        }
        else if(figure.type == 'triangle'){
            drawTriangle(figure.topPoint, figure.topFlag, figure.width, figure.height, figure.fillStyle, figure.strokeStyle)
        }
        else if(figure.type == 'circle'){
            drawCircle(figure.centre, figure.radius, figure.fillStyle, figure.strokeStyle)
        }
        else if(figure.type == 'spray'){
            for(let point of figure.points){
                ctx.fillStyle = figure.fillStyle
                ctx.fillRect(...point, 1, 1)
                ctx.fillStyle = document.forms[0]['f-color'].value
            }
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
    let [x0, y0] = point
    for(let i = figures.length - 1;i >= 0;i--){
        let figure = figures[i]
        if(figure.type == 'rect'){
            if(x0 <= figure.points[0][0] + figure.width
            && x0 >= figure.points[0][0]
            && y0 <= figure.points[0][1] + figure.height
            && y0 >= figure.points[0][1]
            ) {
                return figure
            }
        }
        else if(figure.type == 'circle'){
            if(Math.abs(x0 - figure.centre[0]) <= figure.radius 
            && Math.abs(y0 - figure.centre[1]) <= figure.radius ) {
                return figure
            }
        }
        else if(figure.type == 'triangle'){
            let [x1, y1] = figure.topPoint
            let x2 = x1 - figure.width / 2
            let x3 = x1 + figure.width / 2
            let y2 = y1 + figure.height
            let y3 = y1 + figure.height
            let A = calcArea([x1, y1], [x2, y2], [x3, y3])
            let A1 = calcArea([x0, y0], [x2, y2], [x3, y3])
            let A2 = calcArea([x1, y1], [x0, y0], [x3, y3])
            let A3 = calcArea([x1, y1], [x2, y2], [x0, y0])
            if(A == A1 + A2 + A3) return figure
        }
        else if(figure.type == 'pencil'){
            if(figure.inOutline(point)) {
                figure.drawOutline()
                return figure
            }
        }
    }
    return null
}
function fillFigure(figure){
    if(figure.type == 'rect') ctx.fillRect(...figure.points[0], figure.width, figure.height)
    if(figure.type == 'triangle'){
        ctx.beginPath()
        let [x0, y0] = figure.topPoint
        let x1 = x0 - (figure.width / 2)
        let y1 = y0 + figure.height
        ctx.moveTo(x0, y0)
        ctx.lineTo(x1, y1)
        ctx.lineTo(x1 + figure.width, y1)
        ctx.closePath()
        ctx.fill()
    }
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
function calcArea(p1, p2, p3){
    let [x1, y1] = p1
    let [x2, y2] = p2
    let [x3, y3] = p3
    return Math.abs((x1*(y2-y3) + x2*(y3-y1)+ x3*(y1-y2))/2.0)
}
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}
function clone(obj){
    return JSON.parse(JSON.stringify(obj))
}