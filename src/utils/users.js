const users = [];

const addUser = ({ id, username, room }) => {
    //clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    //validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }

    //check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    //validate username
    if(existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    //store user 
    const user = { id, username, room }
    users.push(user) // add user in users array 
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)// op = -1 if not found, op > = 1 if found

    if (index !== -1) {
        return users.splice(index, 1)[0]//splice will delete the user and return th deleted user in array so this-[0] will make it return object
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
