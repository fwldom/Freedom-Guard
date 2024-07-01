// #region Libraries
;
const { open } = require("fs");
const { dirname } = require("path");
const child_process = require("child_process");
const path = require("path");
const shell = require("electron");
const { execPath } = require("process");
const { execFile, spawn, exec } = require("child_process");
const { remote } = require('electron');
var fs = require("fs");
const { readFile } = require("fs/promises");
const axios = require('axios'); // Import axios
const { type } = require("os");
const geoip = require('geoip-lite');
;
// #endregion
// #region Global Var
__dirname = __dirname.replace("app.asar", "")
var childProcess = null;
var StatusGuard = false;
var AssetsPath = path.join(__dirname, "assets");
var settingWarp = {
    proxy: "127.0.0.1:8086",
    gool: false,
    scan: false,
    endpoint: "",
    cfon: false,
    cfonc: "",
    ipver: "",
    warpver: "",
    warpkey: "",
    scanrtt: "",
    verbose: false,
    cache: "",
    wgconf: "",
    config: "",
    reserved: "",
    dns: "",
};
var argsWarp = [""];
var argsVibe = [""];
var Psicountry = ["IR", "AT", "BE", "BG", "BR", "CA", "CH", "CZ", "DE", "DK", "EE", "ES", "FI", "FR", "GB", "HU", "HR", "IE", "IN", "IT", "JP", "LV", "NL", "NO", "PL", "PT", "RO", "RS", "SE", "SG", "SK", "UA", "US"];
var PsicountryFullname = ["disable", "Austria", "Belgium", "Bulgaria", "Brazil", "Canada", "Switzerland", "Czech Republic", "Germany", "Denmark", "Estonia", "Spain", "Finland", "France", "United Kingdom", "Hungary", "Croatia", "Ireland", "India", "Italy", "Japan", "Latvia", "Netherlands", "Norway", "Poland", "Portugal", "Romania", "Serbia", "Sweden", "Singapore", "Slovakia", "Ukraine", "United States"];
// #endregion
// #region all Listener
document.addEventListener("DOMContentLoaded", () => {
    // Onclick Button and Onchange inputs
    ChangeStatusbtn = document.getElementById("ChangeStatus");
    ChangeStatusbtn.onclick = () => {
        ConnectWarp();
    };
    document.body.onload = () => {
        Onload();
    };
    document.getElementById("Gool").onclick = () => {
        if (document.getElementById("Gool").checked) SetService("gool", true);
        else SetService("gool", false);
    };
    document.getElementById("Scan").onclick = () => {
        if (document.getElementById("Scan").checked) SetService("scan", true);
        else SetService("scan", false);
        SetCfon("IR");
    };
    document.getElementById("box-select-country-mini").addEventListener("click", () => {
        if (document.getElementById("box-select-country").style.display == "grid") {
            document.getElementById("box-select-country").style.display = "none";
        } else {
            document.getElementById("box-select-country").style.display = "grid";
        }
    });
    document.getElementById("close-setting").onclick = () => {
        document.getElementById("setting").style.display = "none";
        document.getElementById("setting-vibe").style.display = "none";
    };
    document.getElementById("selector-ip-version").onchange = () => {
        SetService("ipver", document.getElementById("selector-ip-version").value.match(/\d+/g)).toString();
    };
    document.getElementById("end-point-address").onchange = () => {
        SetService("endpoint", document.getElementById("end-point-address").value);
    };
    document.getElementById("bind-address-text").onchange = () => {
        SetService("proxy", document.getElementById("bind-address-text").value);
    };
    document.getElementById("warp-key-text").onchange = () => {
        SetService("warpkey", document.getElementById("warp-key-text").value);
    };
    document.getElementById("dns-warp-text").onchange = () => {
        SetService("dns", document.getElementById("dns-warp-text").value);
    };
    document.getElementById("scan-rtt-text").onchange = () => {
        SetService("scanrtt", document.getElementById("scan-rtt-text").value);
    };
});
// #endregion
// #region For Connections Warp
function ConnectWarp() {
    // Function Connect To Warp
    if (StatusGuard == false) {
        console.log("Starting Warp ...");
        document.getElementById("ChangeStatus").style.animation = "Connect 7s ease-in-out";
        // Start warp plus
        Run("warp-plus.exe", argsWarp);
        // Set System Proxy
        exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyEnable /t REG_DWORD /d 1 /F');
        exec(`reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyServer /t REG_SZ /d ${settingWarp["proxy"]} /F`);
        StatusGuard = true;
        var testConnectionWarp = setTimeout(() => {
            if (testProxy()) {
                console.log("Connected Warp !!!");
                document.getElementById("ChangeStatus").style.animation = "s";
                document.getElementById("ChangeStatus").style.borderColor = "#15ff00";
            }
            else {
                if (StatusGuard == true) {
                    FindBestEndpointWarp("conn");
                }
            }
        }, 5500);
    } else {
        document.getElementById("ChangeStatus").style.animation = "Connect 7s ease-in-out";
        document.getElementById("ChangeStatus").style.borderColor = "";
        exec("taskkill /IM warp-plus.exe /F");
        exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyEnable /t REG_DWORD /d 0 /F');
        document.getElementById("ChangeStatus").style.animation = "Connect 5s";
        setTimeout(() => {
            document.getElementById("ChangeStatus").style.animation = "";
        }, 3500);
        StatusGuard = false;
    }
}

// #endregion
// #region Functions For Load
function Onload() {
    ResetArgsWarp();
    // Start Add Element Countries to box select country psiphon
    var container = document.getElementById("box-select-country");
    Psicountry.forEach((country, index) => {
        let countryDiv = document.createElement("div");
        countryDiv.className = "cfonCountry";
        countryDiv.id = `cfonCountry${country}`;
        countryDiv.title = country;
        let img = document.createElement("img");
        img.src = path.join(__dirname, "svgs", country + ".svg");
        img.id = "imgOfCfon";
        let p = document.createElement("p");
        p.id = "textOfCfonS";
        p.textContent = PsicountryFullname[index];
        countryDiv.appendChild(img);
        countryDiv.appendChild(p);
        container.appendChild(countryDiv);
        countryDiv.addEventListener("click", () => {
            SetCfon(country);
            if (document.getElementById("Scan").checked) document.getElementById("Scan").click();
            document.getElementById("box-select-country").style.display = "none";
        });
    });
    // End Added All Elements
    try {
        // Restore var settingWarp  from json
        settingWarp = JSON.parse(read_file("warp.json"));
        SetSettingWarp()
    }
    catch {
        saveSetting()
    }
}
// #endregion
// #region Functions other
function FindBestEndpointWarp(type = 'find') {
    if (settingWarp["ipver"] == "") settingWarp["ipver"] = 4;
    Run("win_scanner.bat", ["-" + settingWarp["ipver"]]);
    Loading(25000, "Searching For Endpoint ...");
    childProcess.on('exit', () => {
        document.getElementById("end-point-address").value = read_file(path.join(AssetsPath, "bestendpoint.txt"));
        alert("Finded Best Endpoint");
        var event = new Event('change', {
            bubbles: true,
            cancelable: false,
        });
        document.getElementById("end-point-address").dispatchEvent(event);
        if (type == "conn") {
            StatusGuard = false;
            ConnectWarp();
        }
        Loading(100, "Searching For Endpoint ...");
    });
}
async function testProxy() {
    var startTime = Date.now();
    try {
        const response = await axios.get('https://api.ipify.org?format=json', {
            timeout: 5000, // Timeout in ms
        });
        console.log('IP :', response.data.ip);
        var endTime = Date.now(); // Capture the end time
        var pingTime = endTime - startTime; // Calculate the ping time
        if (pingTime < 1500) { pingTime = `<font color='green'>${pingTime}ms</font>`; } else { pingTime = `<font color='red'>${pingTime}ms</font>` };
        function getCountryFromIP(ip) {
            var geo = geoip.lookup(ip);
            if (geo) {
                var country = geo.country;
                return `<img src="${path.join(__dirname, "svgs", country + ".svg")}" width="40rem" style='margin:1rem'>`
            } else {
                return '❓';
            }
        }
        var countryEmoji = getCountryFromIP(response.data.ip);
        document.getElementById("ip-ping-vibe").innerHTML = "" + countryEmoji + response.data.ip + " | " + pingTime + "";
        document.getElementById("ip-ping-warp").innerHTML = "" + countryEmoji + response.data.ip + " | " + pingTime + "";
        return true;
    } catch (error) {
        console.error('Error Test Connection:', error.message);
        document.getElementById("ip-ping-vibe").innerHTML = " " + "Not Connected To Internet";
        document.getElementById("ip-ping-warp").innerHTML = " " + "Not Connected To Internet";
        return false;
    }
}
function SetCfon(country) {
    settingWarp["cfon"] = true;
    settingWarp["cfonc"] = country;
    document.getElementById("textOfCfon").innerHTML = PsicountryFullname[Psicountry.indexOf(country)];
    document.getElementById("imgOfCfonCustom").src = path.join(__dirname, "svgs", country.toString().toLowerCase() + ".svg");
    ResetArgsWarp();
    // set
}
function CloseAllSections() {
    // For Close Sections (Setting & Menu & Psiphon)
    document.getElementById("box-select-country").style.display = "none";
    document.getElementById("menu").style.display = "none";
    document.getElementById("setting").style.display = "none";
    document.getElementById("setting-vibe").style.display = "none";
}
function SetSettingWarp() {
    // Restore value setting section
    SetValueInput("selector-ip-version", "IPV" + settingWarp['ipver'])
    SetValueInput("end-point-address", settingWarp["endpoint"]);
    SetValueInput("bind-address-text", settingWarp["proxy"]);
    SetValueInput("warp-key-text", settingWarp["warpkey"]);
    SetValueInput("dns-warp-text", settingWarp["dns"]);
    SetValueInput("scan-rtt-text", settingWarp["scanrtt"]);
    document.getElementById("verbose-status").checked = settingWarp["verbose"];
    SetValueInput("cache-dir", settingWarp["cache"]);
    SetValueInput("wgconfig-dir", settingWarp["wgconf"]);
    SetValueInput("config-dir", settingWarp["config"]);
    document.getElementById("reserved-status").checked = settingWarp["reserved"];
}
function SetValueInput(id, Value) {
    // Set Value In Input
    document.getElementById(id).value = Value;
}
function SetService(para, status) {
    // Change
    settingWarp[para] = status;
    ResetArgsWarp();
    saveSetting();
}
function ResetArgsWarp() {
    argsWarp = [];
    if (settingWarp["proxy"] != "127.0.0.1:8086" & settingWarp["proxy"] != "") {
        argsWarp.push("--bind " + settingWarp["proxy"]);
    }
    if (settingWarp["gool"]) {
        argsWarp.push("--gool");
    }
    if (settingWarp["scan"]) {
        argsWarp.push("--scan");
    }
    if (settingWarp["cfon"] && settingWarp["cfonc"] != "IR") {
        argsWarp.push("--cfon " + settingWarp["cfonc"]);
    }
    if (settingWarp["endpoint"] != "") {
        argsWarp.push("--endpoint  " + settingWarp["endpoint"]);
    }
    if (settingWarp["ipver"] != "") {
        argsWarp.push("-" + settingWarp["ipver"]);
    }
    if (settingWarp["warpkey"] != "") {
        argsWarp.push("--key " + settingWarp["warpkey"]);
    }
    if (settingWarp["scanrtt"] != "") {
        argsWarp.push("--rtt " + settingWarp["scanrtt"] + "s");
    }
    if (settingWarp["verbose"]) {
        argsWarp.push("--verbose");
    }
    if (settingWarp["cache"] != "") {
        argsWarp.push("--cache-dir " + settingWarp["cache"]);
    }
    if (settingWarp["wgconf"] != "") {
        argsWarp.push("--wgconf " + settingWarp["wgconf"]);
    }
    if (settingWarp["config"] != "") {
        argsWarp.push("--config " + settingWarp["config"]);
    }
    if (settingWarp["reserved"]) {
        argsWarp.push("--reserved");
    }
    if (settingWarp["dns"] != "") {
        argsWarp.push("--dns " + settingWarp["dns"]);
    }
}
function KillProcess() {
    if (childProcess != null) {
        childProcess.kill();
        if (process.platform === 'win32') {
            spawn('taskkill', ['/PID', childProcess.pid, '/F', '/T']); // Windows
        } else {
            childProcess.kill('SIGTERM'); // POSIX systems
        }
        childProcess = null;
    }
}
function Run(nameFile, args) {
    KillProcess();
    var exePath = `"${path.join(__dirname, "assets", nameFile)}"`; // Adjust the path to your .exe file
    childProcess = spawn(exePath, args, { shell: true, runAsAdmin: true });
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
// #region Section Setting Warp
document.getElementById("find-best-endpoint").addEventListener("click", () => {
    FindBestEndpointWarp();
});
document.getElementById("verbose-status").addEventListener("change", () => {
    if (document.getElementById("verbose-status").checked) SetService("verbose", true);
    else SetService("verbose", false);
});
document.getElementById("reserved-status").addEventListener("change", () => {
    if (document.getElementById("reserved-status").checked) SetService("reserved", true);
    else SetService("reserved", false);
});
document.getElementById("setting-show").addEventListener("click", () => {
    if (document.getElementById("setting").style.display == "") {
        CloseAllSections();
        document.getElementById("setting").style.display = "flex";
    } else {
        document.getElementById("setting").style.display = "";
    }
});
document.getElementById("setting-show-vibe").addEventListener("click", () => {
    if (document.getElementById("setting-vibe").style.display == "") {
        CloseAllSections();
        document.getElementById("setting-vibe").style.display = "flex";
    } else {
        document.getElementById("setting-vibe").style.display = "";
    }
});
document.getElementById("about").addEventListener("click", () => { document.getElementById("about-app").style.display = "flex" })
document.getElementById("close-about").addEventListener("click", () => { document.getElementById("about-app").style.display = "" })
//#endregion
// #region Section Menu
document.getElementById("menu-show").onclick = () => {
    document.getElementById("menu").style.display = "flex";
};
document.getElementById("menu-freedom-vibe").onclick = () => {
    Loading("");
    LoadVibe();
};
document.getElementById("menu-freedom-get").onclick = () => {
    Loading("");
    document.getElementById("freedom-get").style.display = "block"
    elements.forEach(element => {
        element.style.display = '';
    });
};
document.getElementById("menu-dns").onclick = () => { document.getElementById("dns-set").style.display = "flex" };
document.getElementById("menu-exit").onclick = () => (document.getElementById("menu").style.display = "");
//#endregion
// #region Section Freedom-Vibe
var settingVibe = {
    "status": false,
    "config": "auto",
    "fragment": false,
    "fragment-size": "",
    "dns-direct": "",
    "dns-remote": ""
}
function LoadVibe() {
    document.getElementById("freedom-vibe").style.display = "flex";
    try {
        settingVibe = JSON.parse(read_file("vibe.json")); // Load Setting From File.json 
    }
    catch {
        saveSetting();
    }
    if (settingVibe["config"] == "") {
        settingVibe["config"] = "auto";
    }
    settingVibe["status"] = false;
    document.getElementById("config-vibe-text").value = settingVibe["config"];
    document.getElementById("dns-direct-address").value = settingVibe["dns-direct"];
    document.getElementById("dns-remote-address").value = settingVibe["dns-remote"];
    document.getElementById("fragment-status-vibe").checked = settingVibe["fragment"];
    document.getElementById("fragment-vibe-size-text").value = settingVibe["fragment-size"];
}
async function connectVibe() {
    // this is For Connect To Freedom-Vibe
    if (settingVibe["status"] == false) {
        document.getElementById("changeStatus-vibe").style.animation = "changeStatus-vibe-animation 5s infinite";
        if (settingVibe["config"] = "auto") {
            var configs = [
                "https://raw.githubusercontent.com/yebekhe/TVC/main/subscriptions/xray/normal/mix",
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
            await sleep(25000);
            if (settingVibe["status"] == true) {
                if (testProxy()) {
                    Connected();
                    break;
                }
            }
            else break;
        }
    }
    else {
        disconnectVibe();
    }
}
async function saveSetting() {
    // Save setting vibe & setting warp In vibe.json & warp.json
    write_file("vibe.json", JSON.stringify(settingVibe));
    write_file("warp.json", JSON.stringify(settingWarp));
}
// function Read File and Write  
read_file = function (path) {
    return fs.readFileSync(path, 'utf8');
}
write_file = function (path, output) {
    fs.writeFileSync(path, output);
}
function Connected() {
    // function runed when the proxy is connected
    document.getElementById("changeStatus-vibe").style.boxShadow = "0px 0px 50px 10px rgba(98, 255, 0, 0.7)";
    document.getElementById("changeStatus-vibe").style.animation = "";
    document.getElementById("status-vibe-conn").innerHTML = "🚀 Connected";
}
function disconnectVibe() {
    // function runed when the proxy is disconnected
    //Kill the HiddifyCli.exe process
    exec("taskkill /IM " + "HiddifyCli.exe" + " /F");
    //Disable the proxy settings
    exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyEnable /t REG_DWORD /d 0 /F');
    //Remove the box shadow and animation from the vibe status element
    document.getElementById("changeStatus-vibe").style.boxShadow = "";
    document.getElementById("changeStatus-vibe").style.animation = "";
    //Set the vibe status to disconnected
    document.getElementById("status-vibe-conn").innerHTML = "Disconnected";
    //Set the vibe setting to false
    settingVibe["status"] = false;
}
document.getElementById("changeStatus-vibe").onclick = () => connectVibe();
document.getElementById("close-vibe").onclick = () => document.getElementById("freedom-vibe").style.display = "none";
document.getElementById("close-setting-vibe").onclick = () => {
    document.getElementById("setting-vibe").style.display = "none";
};
document.getElementById("fragment-status-vibe").addEventListener("click", () => {
    if (document.getElementById("fragment-status-vibe").checked) {
        settingVibe["fragment"] = true;
        document.getElementById("fragment-vibe-size-text").removeAttribute("disabled");
    }
    else {
        settingVibe["fragment"] = false;
    }
    saveSetting();
    ResetArgsVibe();
});
document.getElementById("fragment-vibe-size-text").addEventListener("change", () => {
    console.log(document.getElementById("fragment-vibe-size-text").value);
    settingVibe["fragment-size"] = document.getElementById("fragment-vibe-size-text").value;
    if (document.getElementById("fragment-status-vibe").checked) {
        settingVibe["fragment"] = true;
    }
    else {
        settingVibe["fragment"] = false;
    }
    saveSetting();
    ResetArgsVibe();
});
document.getElementById("dns-direct-address").addEventListener("change", () => {
    settingVibe["dns-direct"] = document.getElementById("dns-direct-address").value;
    saveSetting();
    ResetArgsVibe();
});
document.getElementById("dns-remote-address").addEventListener("change", () => {
    settingVibe["dns-remote"] = document.getElementById("dns-remote-address").value;
    saveSetting();
    ResetArgsVibe();
});
document.getElementById("config-vibe-text").addEventListener("change", () => {
    settingVibe["config"] = document.getElementById("config-vibe-text").value;
    saveSetting();
});
function ResetArgsVibe(config = "auto") {
    argsVibe = [];
    argsVibe.push("run");
    argsVibe.push("--config");
    argsVibe.push(config);
    argsVibe.push("--system-proxy");
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
}
//#endregion
// #region Section Freedom-Get
var parent = document.getElementById('freedom-get');
var elements = parent.querySelectorAll('*');
elements.forEach(element => {
    element.style.display = 'none';
});
//#endregion
// #region Section Set Dns
document.getElementById("close-dns").onclick = () => (document.getElementById("dns-set").style.display = "");
document.getElementById("submit-dns").onclick = () => SetDNS(document.getElementById("dns1-text").value, document.getElementById("dns2-text").value);
function SetDNS(dns1, dns2) {
    // Run Dns Jumper With DNS address as parameter for Apply DNS
    if (dns1 != "", dns2 != "") Run("DnsJumper.exe", [dns1 + "," + dns2]);
}
//#endregion


Onload();
setInterval(() => {
    testProxy()
}, 7500);