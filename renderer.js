//#region Libraries
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
;
// #endregion
// #region Global Var
var StatusGuard = false;
var AssetsPath = path.join(process.resourcesPath, "assets");
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
var args = [""];
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
    };
    document.getElementById("box-select-country-mini").onclick = () => {
        if (document.getElementById("box-select-country").style.display == "grid") {
            document.getElementById("box-select-country").style.display = "none";
        } else {
            document.getElementById("box-select-country").style.display = "grid";
        }
    };
    document.getElementById("close-setting").onclick = () => {
        document.getElementById("setting").style.display = "none";
    };
    document.getElementById("selector-ip-version").onchange = () => {
        SetService("ipver", document.getElementById("selector-ip-version").value.match(/\d+/g));
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
// #region For Connections
function ConnectWarp() {
    // Function Connect To Warp
    if (StatusGuard == false) {
        console.log("Start Connecting ...");
        document.getElementById("ChangeStatus").style.animation = "Connect 7s ease-in-out";
        var exePath = path.join(process.resourcesPath, "assets", "warp-plus.exe"); // For Test __dirname for build process.resourcePath
        // Start warp plus
        exec("start " + exePath + " " + args);
        // Set System Proxy
        exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyEnable /t REG_DWORD /d 1 /F');
        exec(`reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyServer /t REG_SZ /d ${settingWarp["proxy"]} /F`);
        StatusGuard = true;
        setTimeout(() => {
            console.log("Connected !!!");
            document.getElementById("ChangeStatus").style.animation = "s";
            document.getElementById("ChangeStatus").style.borderColor = "#15ff00";
            var started = new Date().getTime();
            var http = new XMLHttpRequest();
            http.open("GET", "ircf.space", true);
            http.onreadystatechange = function () {
                if (http.readyState == 4) {
                    var ended = new Date().getTime();
                    var milliseconds = ended - started;
                    console.log(milliseconds);
                }
            };
        }, 3500);
    } else {
        document.getElementById("ChangeStatus").style.animation = "Connect 7s ease-in-out";
        document.getElementById("ChangeStatus").style.borderColor = "";
        exec("taskkill /IM warp-plus.exe /F");
        exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyEnable /t REG_DWORD /d 0 /F');
        document.getElementById("ChangeStatus").style.animation = "Connect 5s";
        setTimeout(() => {
            document.getElementById("ChangeStatus").style.animation = "";
            StatusGuard = false;
        }, 3500);
    }
}

// #endregion
// #region Functions For Load
function Onload() {
    ResetArgs();
    // Start Add Element Countries to box select country psiphon
    var container = document.getElementById("box-select-country");
    Psicountry.forEach((country, index) => {
        let countryDiv = document.createElement("div");
        countryDiv.className = "cfonCountry";
        countryDiv.id = `cfonCountry${country}`;
        countryDiv.title = country;
        let img = document.createElement("img");
        img.src = process.resourcesPath + `\\svgs\\${country}.svg`;
        img.id = "imgOfCfon";
        let p = document.createElement("p");
        p.id = "textOfCfonS";
        p.textContent = PsicountryFullname[index];
        countryDiv.appendChild(img);
        countryDiv.appendChild(p);
        container.appendChild(countryDiv);
        countryDiv.addEventListener("click", () => {
            SetCfon(country);
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
function SetCfon(country) {
    document.getElementById("box-select-country-mini").onclick();
    settingWarp["cfon"] = true;
    settingWarp["cfonc"] = country;
    document.getElementById("textOfCfon").innerHTML = PsicountryFullname[Psicountry.indexOf(country)];
    document.getElementById("imgOfCfonCustom").src = path.join(process.resourcesPath, "svgs", country.toString().toLowerCase() + ".svg");
    ResetArgs();
    // set
}
function CloseAllSections() {
    // For Close Sections (Setting & Menu & Psiphon)
    document.getElementById("box-select-country").style.display = "none";
    document.getElementById("menu").style.display = "none";
    document.getElementById("setting").style.display = "none";
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
    ResetArgs();
    saveSetting();
}
function ResetArgs() {
    args = [];
    if (settingWarp["proxy"] != "127.0.0.1:8086" & settingWarp["proxy"] != "") {
        args.push("--bind " + settingWarp["proxy"]);
    }
    if (settingWarp["gool"]) {
        args.push("--gool");
    }
    if (settingWarp["scan"]) {
        args.push("--scan");
    }
    if (settingWarp["cfon"] && settingWarp["cfonc"] != "IR") {
        args.push("--cfon " + settingWarp["cfonc"]);
    }
    if (settingWarp["endpoint"] != "") {
        args.push("--endpoint  " + settingWarp["endpoint"]);
    }
    if (settingWarp["ipver"] != "") {
        args.push("-" + settingWarp["ipver"]);
    }
    if (settingWarp["warpkey"] != "") {
        args.push("--key " + settingWarp["warpkey"]);
    }
    if (settingWarp["scanrtt"] != "") {
        args.push("--rtt " + settingWarp["scanrtt"] + "s");
    }
    if (settingWarp["verbose"]) {
        args.push("--verbose ");
    }
    if (settingWarp["cache"] != "") {
        args.push("--cache-dir " + settingWarp["cache"]);
    }
    if (settingWarp["wgconf"] != "") {
        args.push("--wgconf " + settingWarp["wgconf"]);
    }
    if (settingWarp["config"] != "") {
        args.push("--config " + settingWarp["config"]);
    }
    if (settingWarp["reserved"] != "") {
        args.push("--reserved " + settingWarp["reserved"]);
    }
    if (settingWarp["dns"] != "") {
        args.push("--dns " + settingWarp["dns"]);
    }
}
function Run(type, nameFile, args) {
    if (type == "exec") {
        var exePath = path.join(process.resourcesPath, "assets", nameFile);
        exec("taskkill /IM " + nameFile + " /F");
        exec("start " + exePath + " " + args);
    }
    else if (type == "child") {
        var exePath = path.join(process.resourcesPath, "assets", nameFile);
        var childProcess = spawn(exePath, args);
    }
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// #endregion
//#region Section Setting Warp
document.getElementById("find-best-endpoint").addEventListener("click", () => {
    Run("exec", "win_scanner.bat");
    Loading();
    setTimeout(() => {
        document.getElementById("end-point-address").value = read_file(path.join(AssetsPath, "bestendpoint.txt"));
        alert("Finded Best Endpoint");
        var event = new Event('change', {
            bubbles: true,
            cancelable: false,
        });
        document.getElementById("end-point-address").dispatchEvent(event);
    }, 10500);
});
document.getElementById("setting-show").addEventListener("click", () => {
    if (document.getElementById("setting").style.display == "") {
        CloseAllSections();
        document.getElementById("setting").style.display = "flex";
    } else {
        document.getElementById("setting").style.display = "";
    }
});
document.getElementById("about").addEventListener("click", () => { document.getElementById("about-app").style.display = "flex" })
document.getElementById("close-about").addEventListener("click", () => { document.getElementById("about-app").style.display = "" })
//#endregion
//#region Section Menu
document.getElementById("menu-show").onclick = () => {
    document.getElementById("menu").style.display = "flex";
};
document.getElementById("menu-freedom-vibe").onclick = () => {
    Loading();
    LoadVibe();
};
document.getElementById("menu-freedom-get").onclick = () => {
    Loading();
    document.getElementById("freedom-get").style.display = "block"
    elements.forEach(element => {
        element.style.display = '';
    });
};
document.getElementById("menu-dns").onclick = () => { document.getElementById("dns-set").style.display = "flex" };
document.getElementById("menu-exit").onclick = () => (document.getElementById("menu").style.display = "");
//#endregion
//#region Section Freedom-Vibe
var settingVibe = {
    "status": false,
    "config": "auto",
    "fragment": ""
}
function LoadVibe() {
    document.getElementById("freedom-vibe").style.display = "flex";
    try {
        settingVibe = JSON.parse(read_file("vibe.json")); // Load Setting From File.json 
    }
    catch {
        saveSetting();
        document.getElementById("custom-config-vibe").value = settingVibe["config"];
    }
    if (settingVibe["config"] == "") {
        settingVibe["config"] = "auto";
    }
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
        for (var config of configs) {
            Run("exec", "HiddifyCli.exe", ' run' + ' -c ' + config + ' --system-proxy');
            settingVibe["status"] = true;
            await sleep(10000);
            if (confirm("Are You Connected? | آیا متصل هستید؟\n اگر مشکل اتصال دارید بر روی Cancel بزنید.")) {
                Connected();
                break;
            }
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
document.getElementById("enter-custom-config").onclick = () => document.getElementById("freedom-vibe-custom-config").style.display = "flex";
document.getElementById("close-custom-config").onclick = () => document.getElementById("freedom-vibe-custom-config").style.display = "none";
document.getElementById("submit-config-custom-vibe").onclick = () => {
    settingVibe["config"] = document.getElementById("custom-config-vibe").value;
    saveSetting();
    document.getElementById("freedom-vibe-custom-config").style.display = "none";
    document.getElementById("status-vibe").innerHTML = "Custom Config";
};
document.getElementById("reset-config-custom-vibe").onclick = () => {
    document.getElementById("custom-config-vibe").value = "auto";
    settingVibe["config"] = document.getElementById("custom-config-vibe").value;
    saveSetting();
    document.getElementById("freedom-vibe-custom-config").style.display = "none";
    document.getElementById("status-vibe").innerHTML = "Auto";
}
//#endregion
//#region Section Freedom-Get
var parent = document.getElementById('freedom-get');
var elements = parent.querySelectorAll('*');
elements.forEach(element => {
    element.style.display = 'none';
});
//#endregion
//#region Section Set Dns
document.getElementById("close-dns").onclick = () => (document.getElementById("dns-set").style.display = "");
document.getElementById("submit-dns").onclick = () => SetDNS(document.getElementById("dns1-text").value, document.getElementById("dns2-text").value);
function SetDNS(dns1, dns2) {
    // Run Dns Jumper With DNS address as parameter for Apply DNS
    if (dns1 != "", dns2 != "") Run("exec", "DnsJumper.exe", [dns1 + "," + dns2]);
}
//#endregion


