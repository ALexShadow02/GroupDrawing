const genImage = require('../scripts/imgGenerator')
module.exports = (ws, req, clients) => {
    ws.broadcast = (mes) => {
        for(let client of clients){
            if(client.route == ws.route && client != ws) client.send(mes)
        }
    }
    ws.getPeers = () => {
        let counter = 0
        for(let client of clients){
            if(client.route == ws.route) counter++
        }
        return counter
    }
    ws.broadcast(`e:${req.user.name}:${ws.getPeers()}`)
    ws.on('message', (mes) => {
        if(mes == 'gen-img') {
            console.log('Got request on generating an image')
            ws.send('send-img')
        }
        else if(mes.slice(0, 4) == 'f.d;'){
            mes += ';' + req.user.name
            ws.broadcast(mes)
        }
        else if(mes == 'c.u'){
            ws.broadcast(mes)
        }
        else if(mes == 'c.c'){
            mes += ';' + req.user.name 
            ws.broadcast(mes)
        }
        else {
            genImage(mes, 'src/assets/image.png')
            ws.send('save')
        }
    })
    ws.on('close', () => {
        ws.broadcast(`l:${req.user.name}:${ws.getPeers()}`)
    })
}