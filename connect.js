
// #region Libraries
__dirname = __dirname.replace("app.asar", "")
const geoip = require('geoip-lite');
const versionapp = "1.2.9";
const ipc = require('electron').ipcRenderer;
const { trackEvent } = require('@aptabase/electron/renderer');
// #endregion
//#region Functions
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
        sect == "main" && testProxy() ? disconnectVibe() : disconnectVPN();
    });
};
function isValidURL(url) {
    const regex = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,})(\/[^\s]*)?$/;
    return regex.test(url);
};
function FindBestEndpointWarp(type = 'find') {
    if (process.platform == "linux") {
        sect == "main" ? Loading(100, "Searching Endpoint ...") : ("");
        alert("Scanner IP Endpoint not support in linux");
        return;
    }
    if (settingWarp["ipver"] == "") settingWarp["ipver"] = 4;
    Run("win_scanner.bat", ["-" + settingWarp["ipver"]]);
    if (type != "conn") {
        sect == "main" ? Loading(25000, "Searching Endpoint ...") : ("");
    }
    childProcess.on('exit', () => {
        sect == "main" ? SetValueInput("end-point-address", read_file(path.join(AssetsPath, "bin", "bestendpoint.txt"))) : ("");
        OnEvent("end-point-address", "change");
        if (type == "conn" && StatusGuard == true) {
            StatusGuard = false;
            connectWarp();
        }
        if (type != "conn") {
            alert("Finded Best Endpoint");
            sect == "main" ? Loading(1, "Searching Endpoint ...") : ("");
        }
        else {
            sect == "main" ? Showmess(3000, "Finded Best Endpoint. Reconnecting") : ("");
        }
    });
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
        sect == "main" ? SetHTML("ip-ping-vibe", "" + countryEmoji + testConnection.data.ip + " | " + pingTime + "") : ("");
        sect == "main" ? SetHTML("ip-ping-warp", "" + countryEmoji + testConnection.data.ip + " | " + pingTime + "") : ("");
        testproxystat = true;
        try {
            const testBypass = await axios.get('https://ircf.space', {
                timeout: 5000, // Timeout in ms
            });
            filterBypassStat = true;
            ConnectedVPN();
            return true;
        }
        catch {
            filterBypassStat = false;
            return false;
        }
    } catch (error) {
        console.error('Error Test Connection:', error.message);
        sect == "main" ? SetHTML("ip-ping-vibe", "Not Connected To Internet") : ("");
        sect == "main" ? SetHTML("ip-ping-vibe", "Not Connected To Internet") : ("");
        testproxystat = false;
        return false;
    }
}
//#endregion
// #region Connection
function ConnectedVibe() {
    // function runed when the proxy is connected
    sect == "main" ? SetAttr("changeStatus-vibe", "style", "box-shadow:0px 0px 50px 10px rgba(98, 255, 0, 0.7);") : ("")
    sect == "main" ? SetAttr("changeStatus-vibe", "style", "animation:;") : ("")
    sect == "main" ? SetHTML("status-vibe-conn", "🚀 Connected") : ('');
    sect == "main" ? Showmess(5000, "Connected To Vibe!") : ("");
    trackEvent("connected-vibe");
}
function disconnectVibe() {
    // function runed when the proxy is disconnected
    //Kill the HiddifyCli.exe process
    KillProcess();
    if (process.platform == "linux") {
        exec("pkill HiddifyCli");
    }
    else {
        exec("taskkill /IM " + "HiddifyCli.exe" + " /F");
    }
    //Disable the proxy settings
    exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyEnable /t REG_DWORD /d 0 /F');
    //Remove the box shadow and animation from the vibe status element
    sect == "main" ? SetAttr("changeStatus-vibe", "style", "box-shadow:;") : ("")
    sect == "main" ? SetAttr("changeStatus-vibe", "style", "animation:;") : ("")
    //Set the vibe status to disconnected
    sect == "main" ? SetHTML("status-vibe-conn", "Disconnected") : ('');
    //Set the vibe setting to false
    settingVibe["status"] = false;
}
async function connectVibe() {
    // this is For Connect To Freedom-Vibe
    if (settingVibe["status"] == false) {
        sect == "main" ? SetAnim("changeStatus-vibe", "changeStatus-vibe-animation 5s infinite") : ("");
        if (settingVibe["config"] == "auto" || settingVibe["config"] == "") {
            var configs = [
                "https://raw.githubusercontent.com/ALIILAPRO/v2rayNG-Config/main/sub.txt",
                "https://raw.githubusercontent.com/yebekhe/TVC/main/subscriptions/xray/normal/mix",
                "https://raw.githubusercontent.com/AzadNetCH/Clash/main/AzadNet_META_IRAN-Direct.yml",
                "https://raw.githubusercontent.com/ircfspace/warpsub/main/export/warp",
                "https://raw.githubusercontent.com/barry-far/V2ray-Configs/main/Warp_sub.txt",
                "https://raw.githubusercontent.com/barry-far/V2ray-Configs/main/Sub1.txt",
                "https://raw.githubusercontent.com/barry-far/V2ray-Configs/main/Sub2.txt",
                "https://raw.githubusercontent.com/barry-far/V2ray-Configs/main/Sub3.txt",
                "https://raw.githubusercontent.com/barry-far/V2ray-Configs/main/Sub4.txt",
                "https://raw.githubusercontent.com/barry-far/V2ray-Configs/main/Sub5.txt",
                "https://raw.githubusercontent.com/barry-far/V2ray-Configs/main/Sub6.txt",
                "https://raw.githubusercontent.com/barry-far/V2ray-Configs/main/Sub7.txt",
                "https://raw.githubusercontent.com/barry-far/V2ray-Configs/main/Sub8.txt",
                "https://raw.githubusercontent.com/barry-far/V2ray-Configs/main/Sub9.txt",
                "https://raw.githubusercontent.com/barry-far/V2ray-Configs/main/Sub10.txt",
                "https://raw.githubusercontent.com/barry-far/V2ray-Configs/main/Sub11.txt",
                "https://raw.githubusercontent.com/barry-far/V2ray-Configs/main/Sub12.txt",
                "https://raw.githubusercontent.com/barry-far/V2ray-Configs/main/Sub13.txt",
                "https://raw.githubusercontent.com/barry-far/V2ray-Configs/main/Sub14.txt",
                "https://raw.githubusercontent.com/barry-far/V2ray-Configs/main/Sub15.txt",
                "https://raw.githubusercontent.com/barry-far/V2ray-Configs/main/Sub16.txt",
                "https://raw.githubusercontent.com/barry-far/V2ray-Configs/main/Sub17.txt",
                "https://raw.githubusercontent.com/barry-far/V2ray-Configs/main/Sub18.txt",
                "https://raw.githubusercontent.com/barry-far/V2ray-Configs/main/Splitted-By-Protocol/vless.txt",
            ]
        }
        else {
            var configs = [settingVibe["config"]];
        }
        settingVibe["status"] = true;
        for (var config of configs) {
            ResetArgsVibe(config);
            Run("HiddifyCli.exe", argsVibe);
            trackEvent("conn-vibe");
            await sleep(25000);
            if (settingVibe["status"] == true) {
                await sleep(5000);
                if (testProxy()) {
                    ConnectedVibe();
                    break;
                }
                else {
                    Showmess(5000, "Next Config...")
                }
            }
            else break;
        }
    }
    else {
        disconnectVibe();
    }
};
async function connectWarp() {
    // Function Connect To Warp
    if (StatusGuard == false) {
        console.log("Starting Warp ...");
        sect == "main" ? SetAnim("ChangeStatus", "Connect 7s infinite") : ("");
        // Start warp plus
        Run("warp-plus.exe", argsWarp, (settingWarp["tun"]) ? "admin" : "user");
        // Set System Proxy
        if (process.platform == "linux" & !settingWarp["tun"]) {
            exec("bash " + path.join(__dirname, "assets", "bash", "set_proxy.sh") + ` ${settingWarp["proxy"].replace(":", " ")}`);
        }
        else if (process.platform == "win32" & !settingWarp["tun"]) {
            exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyEnable /t REG_DWORD /d 1 /F');
            exec(`reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyServer /t REG_SZ /d ${settingWarp["proxy"]} /F`);
        }
        StatusGuard = true;
        await sleep(15000);
        testProxy();
        await sleep(10000);
        if (testProxy()) {
            Showmess(5000, "Connected Warp");
            trackEvent("connected-warp");
            sect == "main" ? SetAnim("ChangeStatus", "Load") : ("");
            sect == "main" ? SetBorderColor("ChangeStatus", "#15ff00") : ("");
        }
        else {
            if (StatusGuard == true) {
                FindBestEndpointWarp("conn");
                Showmess(5000, "Finding Endpoint Warp ...")
            }
        }
    } else {
        KillProcess();
        sect == "main" ? SetAnim("ChangeStatus", "Connect 7s ease-in-out") : ("");
        sect == "main" ? SetAttr("ChangeStatus", "style", "border-color:;") : ("");
        if (process.platform == "linux") {
            exec("bash " + path.join(__dirname, "assets", "bash", "reset_proxy.sh"));
        }
        else {
            exec("pkill warp-plus");
            exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyEnable /t REG_DWORD /d 0 /F');
        };
        sect == "main" ? SetAnim("ChangeStatus", "Connect 5s") : ("");
        setTimeout(() => {
            sect == "main" ? SetAnim("ChangeStatus", "") : ("");
        }, 3500);
        StatusGuard = false;
    }
};
//#endregion
// #region Reset Args
function ResetArgsVibe(config = "auto") {
    argsVibe = [];
    argsVibe.push("run");
    argsVibe.push("--config");
    argsVibe.push(config);
    if (settingVibe["fragment"] & settingVibe["fragment-size"] != "") {
        argsVibe.push("--fragment");
        argsVibe.push(settingVibe["fragment-size"]);
    }
    if (settingVibe["dns-direct"] != "") {
        argsVibe.push("--dns-direct");
        argsVibe.push(settingVibe["dns-direct"]);
    }
    if (settingVibe["dns-remote"] != "") {
        argsVibe.push("--dns-remote");
        argsVibe.push(settingVibe["dns-remote"]);
    }
    if (settingVibe["tun"]) {
        argsVibe.push("--tun");
    } else argsVibe.push("--system-proxy");
};
async function saveSetting() {
    // Save setting vibe & setting warp In vibe.json & warp.json
    write_file("vibe.json", JSON.stringify(settingVibe));
    write_file("warp.json", JSON.stringify(settingWarp));
    ResetArgsVibe();
    ResetArgsWarp();
};
read_file = function (path) {
    return fs.readFileSync(path, 'utf8');
}
write_file = function (path, output) {
    fs.writeFileSync(path, output);
}
function ResetArgsWarp() {
    argsWarp = [];
    if (settingWarp["proxy"] != "127.0.0.1:8086" & settingWarp["proxy"] != "") {
        argsWarp.push("--bind");
        argsWarp.push(settingWarp["proxy"]);
    }
    if (settingWarp["gool"]) {
        argsWarp.push("--gool");
    }
    if (settingWarp["scan"]) {
        argsWarp.push("--scan");
    }
    if (settingWarp["cfon"] && settingWarp["cfonc"] != "IR" && settingWarp["cfonc"] != "") {
        argsWarp.push("--cfon");
        argsWarp.push(settingWarp["cfonc"]);
    }
    if (settingWarp["endpoint"] != "") {
        argsWarp.push("--endpoint");
        argsWarp.push(settingWarp["endpoint"]);

    }
    if (settingWarp["ipver"] != "" && settingWarp["ipver"] != 4) {
        argsWarp.push("-" + settingWarp["ipver"]);
    }
    if (settingWarp["warpkey"] != "") {
        argsWarp.push("--key");
        argsWarp.push(settingWarp["warpkey"]);

    }
    if (settingWarp["scanrtt"] != "") {
        argsWarp.push("--rtt");
        argsWarp.push(settingWarp["scanrtt"] + "s");
    }
    if (settingWarp["verbose"]) {
        argsWarp.push("--verbose");
    }
    if (settingWarp["cache"] != "") {
        argsWarp.push("--cache-dir");
        argsWarp.push(settingWarp["cache"]);
    }
    if (settingWarp["wgconf"] != "") {
        argsWarp.push("--wgconf");
        argsWarp.push(settingWarp["wgconf"]);
    }
    if (settingWarp["config"] != "") {
        argsWarp.push("--config");
        argsWarp.push(settingWarp["config"]);
    }
    if (settingWarp["reserved"]) {
        argsWarp.push("--reserved");
    }
    if (settingWarp["dns"] != "") {
        argsWarp.push("--dns");
        argsWarp.push(settingWarp["dns"]);
    }
    if (settingWarp["tun"]) {
        argsWarp.push("--tun-experimental");
    };

};
// #endregion
// #region vars
var childProcess = null;
var StatusGuard = false;
var AssetsPath = path.join(__dirname, "assets");
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
var argsWarp = [""];
var argsVibe = [""];
var settingVibe = {
    "status": false,
    "config": "auto",
    "fragment": false,
    "fragment-size": "",
    "dns-direct": "",
    "dns-remote": "",
    "tun": false
};
var testproxystat = false;
var countryIP = "";
var filterBypassStat = false;
//#endregion
module.exports = {
    connectVibe,
    connectWarp,
    settingVibe,
    settingWarp,
    AssetsPath,
    testProxy,
    testproxyStat: testproxystat,
    countryIP: countryIP,
    filterBypassStat: filterBypassStat.
        ResetArgsVibe,
    ResetArgsWarp,
    KillProcess,
    StatusGuard: StatusGuard,
    disconnectVibe,
    saveSetting
};