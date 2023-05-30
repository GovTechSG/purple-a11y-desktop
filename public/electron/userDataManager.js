const fs = require("fs");
const {
    userDataFilePath 
} = require("./constants"); 
const { ipcMain } = require("electron");

const setData = async (userDataEvent) => {
    const userDataExists = fs.existsSync(userDataFilePath);
    console.log(userDataExists);
    if (!userDataExists) {
        const userData = new Promise((resolve) => {
           userDataEvent.emit("userDataDoesNotExist", resolve);
        })
        const userDataReceived = await userData; 
        fs.writeFileSync(userDataFilePath, JSON.stringify(userDataReceived));
    } else {
        userDataEvent.emit("userDataDoesExist");
    }
}

const getData = () => {
    ipcMain.handle("getUserData", (_event) => { 
        const data = JSON.parse(fs.readFileSync(userDataFilePath));
        return data;
    })
}

module.exports = {
    setData, 
    getData
}