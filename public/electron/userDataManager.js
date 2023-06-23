const fs = require("fs");
const {
    userDataFilePath,
    defaultExportDir, 
} = require("./constants"); 
const { ipcMain, dialog, shell } = require("electron");

const readUserDataFromFile = () => {
    return JSON.parse(fs.readFileSync(userDataFilePath));
}

const writeUserDetailsToFile = (userDetails) => {
    const data = readUserDataFromFile();
    data.name = userDetails.name; 
    data.email = userDetails.email;
    fs.writeFileSync(userDataFilePath, JSON.stringify(data));
}

const createExportDir = () => {
    const exportDir = readUserDataFromFile().exportDir;
    if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
    }
}

const init = async () => {
    const userDataExists = fs.existsSync(userDataFilePath);
    if (!userDataExists) {
        const defaultSettings = {
            name: "", 
            email: "",
            autoSubmit: true, 
            event: false, 
            browser: "chrome", 
            autoUpdate: true,
            exportDir: defaultExportDir
        }; 
        fs.writeFileSync(userDataFilePath, JSON.stringify(defaultSettings));
    }

    ipcMain.handle("getUserData", (_event) => { 
        const data = readUserDataFromFile();
        return data;
    })

    ipcMain.on("editUserDetails", (_event, data) => {
        writeUserDetailsToFile(data);
    })

    ipcMain.handle("setExportDir", (_event) => {
        const data = readUserDataFromFile();
        const results = dialog.showOpenDialogSync({
            properties: ['openDirectory'],
            defaultPath: data.exportDir
        }); 
        if (results) {
            data.exportDir = results[0] + "/Purple HATS"; 
        }    
        fs.writeFileSync(userDataFilePath, JSON.stringify(data));
        return data.exportDir;
    })

    ipcMain.on("openResultsFolder", (_event, resultsPath) => {
        shell.openPath(resultsPath);
    })
}

const setData = async (userDataEvent) => {
    const data = readUserDataFromFile();

    if (data.name === "" || data.email === "") {
        const userData = new Promise((resolve) => {
           userDataEvent.emit("userDetailsDoNotExist", resolve);
        })
        const userDetailsReceived = await userData; 
        writeUserDetailsToFile(userDetailsReceived);
        createExportDir(); 
    } else {
        userDataEvent.emit("userDetailsDoExist");
    }
}

module.exports = {
    init,
    setData, 
    readUserDataFromFile
}