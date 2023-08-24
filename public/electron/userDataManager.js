const fs = require("fs");
const {
    userDataFilePath,
    defaultExportDir, 
    proxy
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

const createExportDir = (path) => {
    try {
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true });
        }

        return true;
    } catch (error) {
        console.error(error);
        return false;
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
            browser: proxy ? "edge" : "chrome",
            autoUpdate: true,
            exportDir: defaultExportDir
        }; 
        fs.writeFileSync(userDataFilePath, JSON.stringify(defaultSettings));
    } else {
        // check if mandatory fields are set 
        const userData = JSON.parse(fs.readFileSync(userDataFilePath));
        if (!userData.exportDir) {
            userData.exportDir = defaultExportDir;
        }
        if (!userData.name) {
            userData.name = "";
        }
        if (!userData.email) {
            userData.email = "";
        }
        if (!userData.browser) {
            userData.browser = proxy ? "edge" : "chrome";
        }
        fs.writeFileSync(userDataFilePath, JSON.stringify(userData));
    }


    ipcMain.handle("getUserData", (_event) => { 
        const data = readUserDataFromFile();
        return data;
    })

    ipcMain.on("editUserData", (_event, data) => {
        writeUserDetailsToFile(data);
    })

    ipcMain.handle("setExportDir", (_event) => {
        const data = readUserDataFromFile();
        const results = dialog.showOpenDialogSync({
            properties: ['openDirectory'],
            defaultPath: data.exportDir
        }); 
        if (results) {
            data.exportDir = results[0]; 
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
           userDataEvent.emit("userDataDoesNotExist", resolve);
        })
        const userDetailsReceived = await userData; 
        writeUserDetailsToFile(userDetailsReceived);
        createExportDir(data.exportDir); 
    } else {
        userDataEvent.emit("userDataDoesExist");
    }
}

module.exports = {
    init,
    setData, 
    readUserDataFromFile,
    createExportDir,
}