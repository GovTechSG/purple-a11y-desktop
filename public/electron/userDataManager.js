const fs = require("fs");
const {
    userDataFilePath 
} = require("./constants"); 
const { ipcMain } = require("electron");

const setData = async (userDataEvent) => {
    const userDataExists = fs.existsSync(userDataFilePath);
    if (!userDataExists) {
        const userData = new Promise((resolve) => {
            userDataEvent.emit("userDataDoesNotExist", resolve);
        })

        const userDataReceived = await userData;
        fs.writeFileSync(userDataFilePath, JSON.stringify(userDataReceived));
    }
} 

const run = () => {
    ipcMain.handle("getUserData", (_event) => {
        const data = JSON.parse(fs.readFileSync(userDataFilePath));
        return data;
    })

    ipcMain.handle("getToggleStatus", (_event) => {
        const data = JSON.parse(fs.readFileSync(userDataFilePath));
        return data.autoSubmit; 
    }) 

    ipcMain.on("setToggleStatus", (_event, status) => {
        const data = JSON.parse(fs.readFileSync(userDataFilePath));
        data.autoSubmit = status; 
        fs.writeFileSync(userDataFilePath, JSON.stringify(data));
    })
}

module.exports = {
    setData, 
    run
}