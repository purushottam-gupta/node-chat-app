const socket = io()

const $msgForm = document.querySelector('#msg-form')
const $msgFormInput = $msgForm.querySelector('input')
const $msgFormButton = $msgForm.querySelector('button')
const $sendLoc = document.querySelector('#send-loc')
const $messages = document.querySelector('#messages')

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    //new message element
    const $newMessage = $messages.lastElementChild

    //height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height 
    const visibleHeight = $messages.offsetHeight

    //height of messags container
    const containerHeight = $messages.scrollHeight

    //how far have i scrolled
    //scrolTop gives the height from top of screen to top of scroll bar
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight //here we r setting scrollTop's value
    }

}
socket.on('message', (message) => {
    console.log(message)
    //mustache library is used to render dom .Its a type of dynamic html
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        //moment library is used to have time in whatever we nedded .Its input is timestamp 
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('sendData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$msgForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $msgFormButton.setAttribute('disabled', 'disabled')

    let message = e.target.elements.message.value
    socket.emit('sendMessage', message, (error) => {
        $msgFormButton.removeAttribute('disabled')
        $msgFormInput.value = ''
        $msgFormInput.focus()

        // this is event acknowledgement to filter profane msg
        if (error)
            return console.log(error)

        console.log('Message is delivered')
    })
})
$sendLoc.addEventListener('click', () => {
    if (!navigator.geolocation)
        return alert('Geolocation is not supported in your browser')

    $sendLoc.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLoc.removeAttribute('disabled')
            console.log('location sent')
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})
