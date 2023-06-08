const fs = require("fs");
const {
    userDataFilePath 
} = require("./constants"); 
const { ipcMain } = require("electron");

const init = async () => {
    const userDataExists = fs.existsSync(userDataFilePath);
    if (!userDataExists) {
        const defaultSettings = {
            name: "", 
            email: "",
            autoSubmit: true, 
            event: false, 
            browserBased: "chrome", 
            autoUpdate: true
        }; 
        fs.writeFileSync(userDataFilePath, JSON.stringify(defaultSettings));
    }
}

const setData = async (userDataEvent) => {
    const data = JSON.parse(fs.readFileSync(userDataFilePath));

    if (data.name === "" || data.email === "") {
        const userData = new Promise((resolve) => {
           userDataEvent.emit("userDataDoesNotExist", resolve);
        })
        const userDataReceived = await userData; 
        data.name = userDataReceived.name; 
        data.email = userDataReceived.email;
        fs.writeFileSync(userDataFilePath, JSON.stringify(data));
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
    init,
    setData, 
    getData
}