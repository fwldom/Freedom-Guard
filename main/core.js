const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const { Module, wrap } = require('module');
const execAsync = promisify(exec);
const axios = require('axios');
//#region Functions public
function fileExits(path) {
    return fs.existsSync(path);
};
async function Download(url,path) {
    const fileName = path.basename(url);
    const filePath = path.join(path, fileName);
    const writer = fs.createWriteStream(filePath);
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}
//#endregion3
//#region links&&vars
var links = {
    mci: {
        vibe:"https://raw.githubusercontent.com/yebekhe/TVC/main/subscriptions/xray/normal/mix",
        vibe:"https://raw.githubusercontent.com/ALIILAPRO/v2rayNG-Config/main/sub.txt",
        vibe:"https://raw.githubusercontent.com/AzadNetCH/Clash/main/AzadNet_META_IRAN-Direct.yml",
        vibe:"https://raw.githubusercontent.com/ircfspace/warpsub/main/export/warp",
        vibe:"https://raw.githubusercontent.com/yebekhe/TelegramV2rayCollector/main/sub/base64/mix",
        vibe:"https://raw.githubusercontent.com/yebekhe/TVC/main/subscriptions/xray/base64/vless"
    },
    irancell:{
        warp:"auto",
        warp:"gool",
        warp:"scan"
    },
    other: {
        warp:"auto",
        warp:"gool",
        vibe:"https://raw.githubusercontent.com/yebekhe/TVC/main/subscriptions/xray/normal/mix",
        vibe:"https://raw.githubusercontent.com/AzadNetCH/Clash/main/AzadNet_META_IRAN-Direct.yml",
        vibe:"https://raw.githubusercontent.com/ircfspace/warpsub/main/export/warp",
    }
}
__dirname = __dirname.replace("app.asar","");
var process_warp = null;
//#endregion
// #region Connection
function connect(core='auto',config='auto',argsVibe,os=process.platform) {
    if (core == "warp") connectWarp(config,os);
    else if (core == "vibe") connectVibe(config,args);
    else connectAuto();
}
function KillWarp() {
    if (process_warp != null) {
        if (process.platform === 'win32') {
            spawn('taskkill', ['/PID', process_warp.pid, '/F', '/T']); // Windows
        } else {
            process_warp.kill('SIGTERM'); // POSIX systems
        };
        process_warp.kill();
        process_warp = null;
    }
}
async function connectWarp(argsWarp,os) {
    if (fileExits(path.join(__dirname,"/cores/warp/warp-plus"+os == "windows"?".exe":""))) {
        var process_warp = spawn(path.join(__dirname,"/cores/warp/warp-plus"+os == "windows"?".exe":""), argsWarp, { shell: true, runAsAdmin: true })
    }
    else {
        await Download("")
    }
};
function connectVibe(config,args) {

};
function connectAuto() {

}

// #endregion
module.exports = {
    connect,
    connectWarp

}
