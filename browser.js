// #region Libraries 
const ipc = require('electron').ipcRenderer;
const axios = require('axios');
const { execFile, spawn, exec } = require("child_process");
var fs = require("fs");
const path = require("path");
const { trackEvent } = require('@aptabase/electron/renderer');
// #endregion
// #region functions for public 
var childProcess = null;
function KillProcess() {
    if (childProcess != null) {
        if (process.platform === 'win32') {
            spawn('taskkill', ['/PID', childProcess.pid, '/F', '/T']); // Windows
        } else {
            childProcess.kill('SIGTERM'); // POSIX systems
        };
        childProcess.kill();
        childProcess = null;
    }
}
function Run(nameFile, args, runa = "user") {
    KillProcess();
    var exePath = `"${path.join(__dirname, "assets", "bin", nameFile)}"`; // Adjust the path to your .exe file
    if (process.platform == "linux") {
        exePath = `"${path.join(__dirname, "assets", "bin", nameFile.replace(".exe", ""))}"`; // Adjust the path to your .exe file
        exec("chmod +x " + exePath);
        if (runa == "admin") {
            childProcess = spawn(exePath, args, { shell: true, runAsAdmin: true });
        } else childProcess = spawn(exePath, args, { shell: true, runAsAdmin: true });
    }
    else {
        if (runa == "admin") {
            childProcess = spawn(exePath, args, { shell: true, runAsAdmin: true });
        } else childProcess = spawn(exePath, args, { shell: true, runAsAdmin: true });
    }
    childProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    childProcess.stderr.on('data', (data) => {
        if (data instanceof Buffer) {
            data = data.toString(); // Convert Buffer to string
        }
        console.error(`stderr: ${data}`);
    });

    childProcess.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// #endregion
// #region functions 
function TabClose(idtab) {
    document.getElementById("tab-" + idtab).remove();
    tabCount--;
    TabSelect(tabCount);
};
function TabSelect(idtab) {
    document.getElementById("url-input").value = tabURLs[idtab];
    document.getElementById("search-btn-header").click();
    document.getElementById("tab-" + idtab).classList.add("active");
    try {
        document.getElementById("tab-" + currentTab).classList.remove("active");
    }
    catch (e) { };
    currentTab = idtab;
};
var CurrentHistory = 0;
var BackTab = false;
async function Back() {
    if (CurrentHistory == 0) {
        CurrentHistory = HistoryTabs[currentTab].length - 2;
        tabURLs[currentTab] = HistoryTabs[currentTab][HistoryTabs[currentTab].length - 2];
        TabSelect(currentTab);
    }
    else {
        tabURLs[currentTab] = HistoryTabs[currentTab][CurrentHistory - 1];
        BackTab = true;
        TabSelect(currentTab);
    }
}
async function Forward() {
    if (CurrentHistory < HistoryTabs[currentTab].length - 1) {
        CurrentHistory++;
        tabURLs[currentTab] = HistoryTabs[currentTab][CurrentHistory];
        BackTab = true;
        TabSelect(currentTab);
    };
};
function isValidURL(url) {
    const regex = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,})(\/[^\s]*)?$/;
    return regex.test(url);
}
async function testProxy() {
    var startTime = Date.now();
    try {
        const testConnection = await axios.get('https://api.ipify.org?format=json', {
            timeout: 5000, // Timeout in ms
        });
        console.log('IP :', testConnection.data.ip);
        var endTime = Date.now(); // Capture the end time
        var pingTime = endTime - startTime; // Calculate the ping time
        if (pingTime < 1500) { pingTime = `<font color='green'>${pingTime}ms</font>`; } else { pingTime = `<font color='red'>${pingTime}ms</font>` };
        function getCountryFromIP(ip) {
            var geo = geoip.lookup(ip);
            if (geo) {
                countryIP = geo.country;
                return `<img src="${path.join(__dirname, "svgs", countryIP.toLowerCase() + ".svg")}" width="40rem" style='margin:1rem'>`
            } else {
                return '❓';
            }
        }
        var countryEmoji = getCountryFromIP(testConnection.data.ip);
        try {
            const testBypass = await axios.get('https://ircf.space', {
                timeout: 5000, // Timeout in ms
            });
            document.getElementById("vpn-btn-header").classList.add("active")
            console.log("sss");
            return true;
        }
        catch {
            return false;
        }
    } catch (error) {
        return false;
    }
}
async function ConnectVPN() {
    if (settingBrowser["core"] == "warp") {
        if (settingBrowser["status"] == false) {
            console.log("Starting VPN Browser ...");
            document.getElementById("vpn-btn-header").style.animation = "Connect 1s infinite";
            Run("warp-plus.exe", [], "admin");
            // Set System Proxy
            if (process.platform == "linux") {
                exec("bash " + path.join(__dirname, "assets", "bash", "set_proxy.sh") + ` ${settingBrowser["proxy"].replace(":", " ")}`);
            }
            else if (process.platform == "win32") {
                exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyEnable /t REG_DWORD /d 1 /F');
                exec(`reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyServer /t REG_SZ /d ${settingBrowser["proxy"]} /F`);
            }
            settingBrowser["status"] = true;
            await sleep(15000);
            testProxy();
            await sleep(10000);
            if (testProxy()) {
                document.getElementById("vpn-btn-header").style.animation = "Co";
                document.getElementById("vpn-btn-header").classList.add("active");
            }
            else {
                if (settingBrowser["status"] == true) {
                    document.getElementById("vpn-btn-header").classList.remove("active");
                }
            }
        } else {
            KillProcess();
            document.getElementById("vpn-btn-header").classList.remove("active");
            if (process.platform == "linux") {
                exec("bash " + path.join(__dirname, "assets", "bash", "reset_proxy.sh"));
            }
            else {
                exec("pkill warp-plus");
                exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyEnable /t REG_DWORD /d 0 /F');
            }
            settingBrowser["status"] = false;
        }
    }
    else {

    }
};
// #endregion
// #region define events 
document.getElementById("url-input").addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        document.getElementById("search-btn-header").click();
    };
});
document.getElementById("home-btn-header").addEventListener('click', (event) => {
    document.getElementById("url-input").value = "https://fwldom.github.io/freedom-site-browser/index.html";
    document.getElementById("search-btn-header").click();
});
document.getElementById("add-tab").addEventListener("click", function () {
    tabCount += 1;
    var idTab = tabCount;
    tabs.push(idTab);
    document.getElementById("tab-list").innerHTML += `
    <div class='tab' id='tab-${idTab}' onclick='TabSelect(${idTab})'>
    <div class='tab-title' id='tab-title-${idTab}'>New Tab</div>
    <div class='tab-icon' id='tab-icon-${idTab}'></div>
    <div class='tab-close' id='tab-close-${idTab}' onclick='TabClose(${idTab})'><i class="bi bi-x"></i></div>`;
    HistoryTabs.push([]);
    tabURLs[idTab] = "https://fwldom.github.io/freedom-site-browser/";
    TabSelect(idTab);
});
function isValidURL(url) {
    const regex = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,})(\/[^\s]*)?$/;
    return regex.test(url) || /^https?:\/\/[^\s]+$/.test(url);
}
document.getElementById('url-input').addEventListener('click', function () {
    this.select();
});
document.getElementById("search-btn-header").addEventListener("click", function () {
    if (isValidURL(document.getElementById("url-input").value)) {
        urlInput = "https://" + document.getElementById("url-input").value.replace("https://", "").replace("http://", "");
    }
    else {
        urlInput = "https://google.com/search?q=" + document.getElementById("url-input").value;
    }
    document.getElementById("refresh-btn-header").style.animation = "spin 1s linear infinite";
    ipc.send("load-url-browser", urlInput)
});
document.getElementById("vpn-btn-header").addEventListener("click", function () {
    ConnectVPN();
});
document.getElementById("refresh-btn-header").addEventListener("click", function () {
    urlInput = "https://" + document.getElementById("url-input").value.replace("https://", "").replace("http://", "");
    document.getElementById("refresh-btn-header").style.animation = "spin 1s linear infinite";
    ipc.send("load-url-browser", urlInput)
});
document.getElementById("close-browser").addEventListener("click", function () {
    var settingWarp = {
        proxy: "127.0.0.1:8086",
        gool: false,
        scan: false,
        endpoint: "",
        cfon: false,
        cfonc: "IR",
        ipver: 4,
        warpver: "",
        warpkey: "",
        scanrtt: "",
        verbose: false,
        cache: "",
        wgconf: "",
        config: "",
        reserved: "",
        dns: "",
        tun: false,
        startup: "warp"
    };
    settingWarp = JSON.parse(read_file("warp.json"));
    settingWarp["startup"] = "warp";
    write_file("warp.json", JSON.stringify(settingWarp));
    ipc.send("load-main-app");
});
read_file = function (path) {
    return fs.readFileSync(path, 'utf8');
}
write_file = function (path, output) {
    fs.writeFileSync(path, output);
}
document.getElementById("back-btn-header").addEventListener("click", function () {
    Back();
});
document.getElementById("forward-btn-header").addEventListener("click", function () {
    Forward();
})
// #endregion
// #region define variables
var tabs = [];
var tabContents = [];
var tabTitles = [];
var tabIcons = [];
var tabURLs = [];
var tabStatus = [];
var HistoryTabs = [];
var HistoryCount = -1;
var currentTab = 0;
var tabCount = -1;
var urlInput = "";
var settingBrowser = {
    core: "warp",
    status: false,
    proxy: "127.0.0.1:8086"
}
// #endregion
// #region Load Browser
function loadBrowser() {
    document.getElementById("add-tab").click();
}
document.addEventListener("DOMContentLoaded", function () {
    loadBrowser();
});
// #endregion
// #region IPC

ipc.on("set-url", (event, url) => {
    HistoryCount++;
    document.getElementById("refresh-btn-header").style.animation = "spin 1s linear infinite";
    setTimeout(() => {
        document.getElementById("refresh-btn-header").style.animation = "s";
    }, 3000);
    document.getElementById("url-input").value = url;
    console.log(url);
    if (BackTab != true) {
        tabURLs[currentTab] = url;
        HistoryTabs[currentTab].push(url);
    };
    BackTab = false;
});
ipc.on("set-title", (event, title) => {
    document.getElementById("refresh-btn-header").style.animation = "s";
    document.getElementById("tab-" + currentTab).title = title.toString();
    document.getElementById("tab-title-" + currentTab).innerHTML = title.toString().length >= 15 ? title.slice(0, 20) : title;
});
// #endregion
testProxy();
trackEvent("start-browser");
