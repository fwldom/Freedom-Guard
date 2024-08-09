const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { Module, wrap } = require('module');
const axios = require('axios');
const { execFile, spawn, exec } = require("child_process");
const { platform } = require('os');
//#region Functions public
function fileExits(path) {
    return fs.existsSync(path);
};
async function Download(url, path, fileName) {
    const writer = fs.createWriteStream(path);
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });
    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}
function SetProxy(address, port) {
    if (process.platform == "linux") {
        exec("bash " + path.join(__dirname, "assets", "bash", "set_proxy.sh") + ` ${address} ${port}`);
    }
    else if (process.platform == "win32") {
        exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyEnable /t REG_DWORD /d 1 /F');
        exec(`reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyServer /t REG_SZ /d ${address + ":" + port} /F`);
    }
}
function OffProxy() {
    if (process.platform == "linux") {
        exec("bash " + path.join(__dirname, "assets", "bash", "reset_proxy.sh"));
    }
    else if (process.platform == "win32") {
        exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyEnable /t REG_DWORD /d 0 /F');
    }
}
function KillWarp() {
    try {
        if (process.platform == 'win32') {
            exec('taskkill /IM warp-plus.exe /F /T'); // Windows
        } else {
            process_warp.kill('SIGTERM'); // POSIX systems
        };
        process_warp.kill();
        process_warp = null;
    }
    catch { }

}
//#endregion
//#region links&&vars
var links = {
    MCI: {
        vibe: "https://raw.githubusercontent.com/yebekhe/TVC/main/subscriptions/xray/normal/mix",
        vibe: "https://raw.githubusercontent.com/ALIILAPRO/v2rayNG-Config/main/sub.txt",
        vibe: "https://raw.githubusercontent.com/AzadNetCH/Clash/main/AzadNet_META_IRAN-Direct.yml",
        vibe: "https://raw.githubusercontent.com/ircfspace/warpsub/main/export/warp",
        vibe: "https://raw.githubusercontent.com/yebekhe/TelegramV2rayCollector/main/sub/base64/mix",
        vibe: "https://raw.githubusercontent.com/yebekhe/TVC/main/subscriptions/xray/base64/vless"
    },
    IRANCELL: {
        0: "warp,auto",
        1: "warp,gool",
        2: "warp,scan"
    },
    other: {
        warp: "auto",
        warp: "gool",
        vibe: "https://raw.githubusercontent.com/yebekhe/TVC/main/subscriptions/xray/normal/mix",
        vibe: "https://raw.githubusercontent.com/AzadNetCH/Clash/main/AzadNet_META_IRAN-Direct.yml",
        vibe: "https://raw.githubusercontent.com/ircfspace/warpsub/main/export/warp",
    }
}
__dirname = __dirname.replace("app.asar", "");
var process_warp = null;
var settings = {
    warp: {

    },
    vibe: {

    },
    public: {

    }
}
// #endregion
// #region Connection
function connect(core = 'auto', config = 'auto', args = [], settingWarp = "", os = process.platform) {
    if (settingWarp = "") settingWarp = { proxy: "127.0.0.1", port: "8085" }
    if (core == "warp") ConnectWarp(args, os, settingWarp);
    else if (core == "vibe") connectVibe(config, args, os);
    else connectAuto();
}
async function ConnectWarp(argsWarp, os = process.platform, settingWarp) {
    disconnectWarp();
    if (fileExits(path.join(__dirname, "/cores/warp/warp-plus" + (os == "win32" ? ".exe" : "")))) {
        const {connectWarp} = require("../connect");
        connectWarp();
        // var process_warp = spawn(path.join(__dirname, "/cores/warp/warp-plus" + (os == "win32" ? ".exe" : "")), argsWarp, { shell: false, runAsAdmin: true })
        // process_warp.on("close", () => {
        //     console.log("Closed Warp");
        //     disconnectWarp();
        // });
        // process_warp.stdout.on('data', (data) => {
        //     console.log(data.toString().includes("serving proxy") ? ConnectedWarp() : "" + data);
        // });
        // process_warp.stderr.on('data', (data) => {
        //     if (data instanceof Buffer) {
        //         data = data.toString(); // Convert Buffer to string
        //     }
        //     console.error(`stderr: ${data}`);
        // });
        // await testProxy();
    }
    else {
        alert("Core warp was deleted!");
    }
};
function disconnectWarp() {
    KillWarp();
    OffProxy();
}
function ConnectedWarp() {
    SetProxy(settingWarp["proxy"], settingWarp["port"]);
    console.log("Connected to warp");
}
function connectVibe(config, args) {

};
function connectAuto() {
    // استفاده از ip-api برای دریافت اطلاعات IP
    fetch('http://ip-api.com/json/')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            const isp = data.org;
            console.log('ISP:', isp);
            if (isp.includes('IRANCELL')) {
                connect(links["IRANCELL"][0].split(",")[0],args=[links["IRANCELL"][0].split(",")[1] !== "auto" ? "--"+links["IRANCELL"][0].split(",")[1]:""])
            } else if (isp.includes("MCI")) {
                connect(links["MCI"][0].split(",")[0],["--"+links["MCI"][0].split(",")[1]],)
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

// #endregion
module.exports = {
    connect,
    connectWarp: ConnectWarp,
    Download,
    SetProxy,
    connectVibe,
    connectAuto,
    disconnectWarp,
    links
}
