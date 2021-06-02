const roomID = window.location.pathname.slice(
  window.location.pathname.lastIndexOf('/') + 1
)
const socket = new WebSocket(`ws://localhost:4000/${roomID}`)
const eventBar = document.getElementById('event_bar')
const clearEventBtn = document.querySelector('#event_title button')
clearEventBtn.onclick = () => {
  for (let i = eventBar.children.length - 1; i > 0; i--) {
    eventBar.removeChild(eventBar.children[i])
  }
}
socket.binaryType = 'arraybuffer'
socket.onopen = () => {
  console.log('Connnection is set')
}
socket.onmessage = (mes) => {
  if (mes.data == 'send-img') {
    let imageDataArr = ctx.getImageData(0, 0, canv.width, canv.height).data
    let byteArr = new Uint8Array(imageDataArr.length)
    for (let i = 0; i < imageDataArr.length; i++) {
      byteArr[i] = imageDataArr[i]
    }
    socket.send(byteArr)
  } else if (mes.data.slice(0, 2) == 'e:') {
    let [, user, total] = mes.data.split(':')
    createEvent(`${user} has entered. Now there are ${total} users in the room`)
  } else if (mes.data.slice(0, 2) == 'l:') {
    let [, user, total] = mes.data.split(':')
    if (total > 1)
      createEvent(`${user} has left. Now there are ${total} users in the room`)
    else createEvent(`${user} has left. Now you are the only user in the room`)
  } else if (mes.data.slice(0, 4) == 'f.d;') {
    let [, figure, author] = mes.data.split(';')
    figure = JSON.parse(figure)
    drawFigure(figure)
    figures.push(figure)
    createEvent(`${author} has drawed a ${figure.type}`)
  } else if (mes.data == 'c.u') {
    if (changes.length > 0) {
      let lastChange = changes.pop()
      lastChange.figure.fillStyle = lastChange.color
    } else figures.pop()
    ctx.clearRect(0, 0, canv.width, canv.height)
    drawFigures(figures)
  } else if (mes.data.slice(0, 4) == 'c.c;') {
    let [, author] = mes.data.split(';')
    ctx.clearRect(0, 0, canv.width, canv.height)
    ctx.fillStyle = canvasColor.value
    ctx.fillRect(0, 0, canv.width, canv.height)
    ctx.fillStyle = fillColor.value
    figures.length = 0
    createEvent(`${author} has cleared the canvas`)
  } else if (mes.data == 'save') {
    download()
  }
}
function createEvent(text) {
  let newEvent = document.createElement('div')
  newEvent.classList.add('event')
  let closeElem = document.createElement('div')
  closeElem.classList.add('popup_close')
  closeElem.innerHTML = 'X'
  closeElem.style.cursor = 'pointer'
  newEvent.append(closeElem)
  closeElem.onclick = (event) => {
    event.target.parentElement.remove()
  }
  newEvent.append(text + ` (${new Date().toTimeString().split(' ')[0]})`)
  eventBar.appendChild(newEvent)
}
