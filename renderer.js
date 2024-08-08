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
const { type, platform } = require("os");
const geoip = require('geoip-lite');
const versionapp = "1.3.0";
const ipc = require('electron').ipcRenderer;
const { trackEvent } = require('@aptabase/electron/renderer');
var sect = "main";
var {connectVibe,connectWarp,settingWarp,settingVibe,AssetsPath,ResetArgsVibe,ResetArgsWarp,testProxy} = require('./connect.js');
// #endregion
// #region Global Var
__dirname = __dirname.replace("app.asar", "")
var Psicountry = ["IR", "AT", "BE", "BG", "BR", "CA", "CH", "CZ", "DE", "DK", "EE", "ES", "FI", "FR", "GB", "HU", "HR", "IE", "IN", "IT", "JP", "LV", "NL", "NO", "PL", "PT", "RO", "RS", "SE", "SG", "SK", "UA", "US"];
var PsicountryFullname = ["disable", "Austria", "Belgium", "Bulgaria", "Brazil", "Canada", "Switzerland", "Czech Republic", "Germany", "Denmark", "Estonia", "Spain", "Finland", "France", "United Kingdom", "Hungary", "Croatia", "Ireland", "India", "Italy", "Japan", "Latvia", "Netherlands", "Norway", "Poland", "Portugal", "Romania", "Serbia", "Sweden", "Singapore", "Slovakia", "Ukraine", "United States"];
// #endregion
// #region all Listener
document.addEventListener("DOMContentLoaded", () => {
    // Onclick Button and Onchange inputs
    ChangeStatusbtn = document.getElementById("ChangeStatus");
    ChangeStatusbtn.onclick = () => {
        connectWarp();
    };
    document.getElementById("Gool").onclick = () => {
        if (document.getElementById("Gool").checked) SetServiceWarp("gool", true);
        else SetServiceWarp("gool", false);
    };
    document.getElementById("Scan").onclick = () => {
        if (document.getElementById("Scan").checked) SetServiceWarp("scan", true);
        else SetServiceWarp("scan", false);
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
        SetServiceWarp("ipver", document.getElementById("selector-ip-version").value.match(/\d+/g)).toString();
    };
    document.getElementById("end-point-address").onchange = () => {
        SetServiceWarp("endpoint", document.getElementById("end-point-address").value);
    };
    document.getElementById("bind-address-text").onchange = () => {
        SetServiceWarp("proxy", document.getElementById("bind-address-text").value);
    };
    document.getElementById("warp-key-text").onchange = () => {
        SetServiceWarp("warpkey", document.getElementById("warp-key-text").value);
    };
    document.getElementById("dns-warp-text").onchange = () => {
        SetServiceWarp("dns", document.getElementById("dns-warp-text").value);
    };
    document.getElementById("scan-rtt-text").onchange = () => {
        SetServiceWarp("scanrtt", document.getElementById("scan-rtt-text").value);
    };
});
// #endregion
// #region For Connections Warp

// #endregion
// #region Functions For Load
function Onload() {
    ResetArgsWarp();
    process.platform == "win32" ? exec(path.join(__dirname, "register-url-win.bat")) : ("");
    // Start Add Element Countries to box select country psiphon
    var container = document.getElementById("box-select-country");
    container.innerHTML = ""
    Psicountry.forEach((country, index) => {
        country = country.toLowerCase()
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
            (document.getElementById("Scan").checked) ? document.getElementById("Scan").click() : ("");
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
    testProxy();
    try {
        keyUser = read_file("one.one");
    }
    catch {
        try {
            if (process.platform == "win32") {
                exec("start https://fwldom.github.io/Freedom")
            }
            write_file("one.one", "ok");
        }
        catch { };
        HelpStart();
    }
    if (settingWarp["startup"] !== "warp") {
        if (settingWarp["startup"] == "vibe") {
            LoadVibe();
        }
        else if (settingWarp["startup"] == "browser") {
            setTimeout(() => {
                ipc.send("load-browser", "");
            }, 1500);
        }
    }
    trackEvent("start-warp");
};
// #endregion
// #region Functions other
function SetAnim(id, anim) {
    document.getElementById(id).style.animation = anim;
}
function SetAttr(id,attr,value) {
    document.getElementById(id).setAttribute(attr, value);
}
function SetHTML(id,value){
    document.getElementById(id).innerHTML = value;
};
function SetBorderColor(id,value){
    document.getElementById(id).style.borderColor = value;
};
function HelpStart(step = 1) {
    var HelpStartElem = document.createElement("div");
    HelpStartElem.dir = "rtl";
    HelpStartElem.style.textAlign = "center";
    HelpStartElem.id = "HelpMess";
    if (step == 1) {
        if (confirm("نیاز به راهنمایی داری؟")) {
            HelpStartElem.innerHTML = `
            اگر روی نماد تنظیمات بزنی میتونی تنظیمات وارپ رو تغییر بدی.
            <br>
            برای بعدی کلیک کنید.`;
            HelpStartElem.style.top = "55px";
            HelpStartElem.style.right = "55px";
            HelpStartElem.style.borderTopRightRadius = "0px";
            HelpStartElem.onclick = () => {
                HelpStart(2);
            };
        }
        document.body.appendChild(HelpStartElem);
    }
    else if (step == 2) {
        HelpStartElem = document.getElementById("HelpMess");
        HelpStartElem.innerHTML = `
        از بخش منو میتونید به بخش های دیگر مثل Freedom Vibe و Freedom Get و Dns Changer دسترسی داشته باشید.
        <br>
        برای بعدی کلیک کنید.`
        HelpStartElem.style.top = "55px";
        HelpStartElem.style.left = "55px";
        HelpStartElem.style.borderTopRightRadius = "15px";
        HelpStartElem.style.borderTopLeftRadius = "0px";
        HelpStartElem.onclick = () => {
            HelpStart(3);
        };
    }
    else if (step == 3) {
        HelpStartElem = document.getElementById("HelpMess");
        HelpStartElem.innerHTML = `
        بر روی نماد وسط صفحه ضربه بزنید تا Freedom Warp متصل شود
        <br>
        برای پایان کلیک کنید.`;
        HelpStartElem.style.top = "40vh";
        HelpStartElem.style.left = "10vh";
        HelpStartElem.style.borderTopRightRadius = "0px";
        HelpStartElem.style.borderTopLeftRadius = "15px";
        HelpStartElem.onclick = () => {
            HelpStart(4);
        };
    }
    else if (step == 4) {
        HelpStartElem = document.getElementById("HelpMess");
        HelpStartElem.style.display = "none";
    }
}

function SetCfon(country) {
    settingWarp["cfon"] = true;
    settingWarp["cfonc"] = country;
    document.getElementById("textOfCfon").innerHTML = PsicountryFullname[Psicountry.indexOf(country.toString().toUpperCase())];
    document.getElementById("imgOfCfonCustom").src = path.join(__dirname, "svgs", country.toString().toLowerCase() + ".svg");
    ResetArgsWarp();
    // Set Psiphon Country 
}
function CloseAllSections() {
    // For Close Sections (Setting & Menu & Psiphon)
    document.getElementById("box-select-country").style.display = "none";
    document.getElementById("menu").style.display = "none";
    document.getElementById("setting").style.display = "none";
    document.getElementById("setting-vibe").style.display = "none";
    document.getElementById("vibe-profile-manage").style.display = "none";
    document.getElementById("profile-add").style.display = "none";
}
function OnEvent(id,event) {
    var event = new Event(event, {
        bubbles: true,
        cancelable: false,
    });
    document.getElementById(id).dispatchEvent(event);
}
function SetSettingWarp() {
    // Restore value setting section
    SetValueInput("selector-ip-version", "IPV" + settingWarp['ipver'])
    SetValueInput("vpn-type-selected", settingWarp["tun"] ? "tun" : "system")
    SetValueInput("start-up-at", settingWarp["startup"])
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
    document.getElementById("Gool").checked = settingWarp["gool"];
    document.getElementById("Scan").checked = settingWarp["scan"];
}
function SetValueInput(id, Value) {
    // Set Value In Input
    document.getElementById(id).value = Value;
}
function SetServiceWarp(para, status) {
    // Change
    settingWarp[para] = status;
    ResetArgsWarp();
    saveSetting();
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
function Showmess(time = 2500, text = "message text", type = "info") {
    document.getElementById("message").style.display = "flex";
    document.getElementById("message").style.width = "";
    document.getElementById("message").style.transition = time / 5 + "ms";
    document.getElementById("message-border").style.width = "100%";
    document.getElementById("messageText").innerText = text;
    setTimeout(() => {
        document.getElementById("message-border").style.width = "0%";
        document.getElementById("message").style.width = "0%";
        setTimeout(() => {
            document.getElementById("message").style.display = "none";
        }, 1000);
    }, time);
}
// #endregion
// #region Section Setting Warp
document.getElementById("find-best-endpoint").addEventListener("click", () => {
    FindBestEndpointWarp();
});
document.getElementById("vpn-type-selected").addEventListener("change", () => {
    if (document.getElementById("vpn-type-selected").value == "tun") {
        SetServiceWarp("tun", true);
    } else SetServiceWarp("tun", false);
});
document.getElementById("start-up-at").addEventListener("change", () => {
    SetServiceWarp("startup", document.getElementById("start-up-at").value);
});
document.getElementById("verbose-status").addEventListener("change", () => {
    if (document.getElementById("verbose-status").checked) SetServiceWarp("verbose", true);
    else SetServiceWarp("verbose", false);
});
document.getElementById("reserved-status").addEventListener("change", () => {
    if (document.getElementById("reserved-status").checked) SetServiceWarp("reserved", true);
    else SetServiceWarp("reserved", false);
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
document.getElementById("menu-freedom-browser").onclick = () => {
    ipc.send("load-browser", "")
};
document.getElementById("menu-dns").onclick = () => { document.getElementById("dns-set").style.display = "flex" };
document.getElementById("menu-exit").onclick = () => (document.getElementById("menu").style.display = "");
//#endregion
// #region Section Freedom-Vibe

var configsVibeName = [
    "Auto",
    "TVC | MIX",
    "Free | Sub V2ray",
    "AzadNet | META IRAN",
    "WARP | IRCF",
    "TELEGRAM | V2RAY",
    "TVC | VLESS"
];
var configsVibeLink = [
    "auto",
    "https://raw.githubusercontent.com/yebekhe/TVC/main/subscriptions/xray/normal/mix",
    "https://raw.githubusercontent.com/ALIILAPRO/v2rayNG-Config/main/sub.txt",
    "https://raw.githubusercontent.com/AzadNetCH/Clash/main/AzadNet_META_IRAN-Direct.yml",
    "https://raw.githubusercontent.com/ircfspace/warpsub/main/export/warp",
    "https://raw.githubusercontent.com/yebekhe/TelegramV2rayCollector/main/sub/base64/mix",
    "https://raw.githubusercontent.com/yebekhe/TVC/main/subscriptions/xray/base64/vless"
];
function LoadVibe() {
    document.getElementById("freedom-vibe").style.display = "flex";
    try {
        settingVibe = JSON.parse(read_file("vibe.json")); // Load Setting From File.json 
        configsVibeName = JSON.parse(read_file("configsVibeName.json")); // Load Setting From File.json 
        configsVibeLink = JSON.parse(read_file("configsVibeLink.json")); // Load Setting From File.json 
    }
    catch {
        saveSetting();
        SaveConfigsVibe();
    }
    if (settingVibe["config"] == "") {
        settingVibe["config"] = "auto";
    }
    settingVibe["status"] = false;
    document.getElementById("vpn-type-selected-vibe").value = settingVibe["tun"] ? "tun" : "system";
    document.getElementById("config-vibe-text").value = settingVibe["config"];
    document.getElementById("dns-direct-address").value = settingVibe["dns-direct"];
    document.getElementById("dns-remote-address").value = settingVibe["dns-remote"];
    document.getElementById("fragment-status-vibe").checked = settingVibe["fragment"];
    document.getElementById("fragment-vibe-size-text").value = settingVibe["fragment-size"];
    trackEvent("start-vibe");
}
async function saveSetting() {
    // Save setting vibe & setting warp In vibe.json & warp.json
    write_file("vibe.json", JSON.stringify(settingVibe));
    write_file("warp.json", JSON.stringify(settingWarp));
    ResetArgsVibe();
    ResetArgsWarp();
}
// function Read File and Write  
read_file = function (path) {
    return fs.readFileSync(path, 'utf8');
}
write_file = function (path, output) {
    fs.writeFileSync(path, output);
}
function LoadVibeProfileManager() {
    document.getElementById("vibe-profile-manage").style.display = "flex";
    document.getElementById("vibe-profile-list").innerHTML = "";
    configsVibeName.forEach((config, index) => {
        var configBox = document.createElement("div");
        configBox.id = "config-box-vibe-sel";
        configBox.title = config;
        configBox.innerHTML = config;
        configBox.addEventListener("click", () => {
            settingVibe["config"] = configsVibeLink[index];
            saveSetting();
            SaveConfigsVibe();
            document.getElementById("status-vibe").innerHTML = config;
            document.getElementById("status-vibe-sel").innerHTML = config;

            CloseAllSections();
        });
        configBox.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            if (confirm("Are you sure you want to delete this profile?")) {
                configsVibeName.splice(index, 1);
                configsVibeLink.splice(index, 1);
                SaveConfigsVibe();
                document.getElementById("vibe-profile-list").innerHTML = "";
                LoadVibeProfileManager();
            };
        });
        document.getElementById("vibe-profile-list").appendChild(configBox);
        console.log(index);
    });
}
function SaveConfigsVibe() {
    write_file("configsVibeName.json", JSON.stringify(configsVibeName));
    write_file("configsVibeLink.json", JSON.stringify(configsVibeLink));
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
        document.getElementById("fragment-vibe-size-text").setAttribute("disabled", "");
    }
    saveSetting();
    ResetArgsVibe();
});
document.getElementById("vibe-profile").addEventListener("click", () => {
    LoadVibeProfileManager();
});
document.getElementById("close-vibe-profile").addEventListener("click", () => {
    CloseAllSections();
});
document.getElementById("add-config-vibe").addEventListener("click", () => {
    document.getElementById("profile-add").style.display = "flex";
});
document.getElementById("add-config-vibe-submit").addEventListener("click", () => {
    if (document.getElementById("add-config-vibe-link").value.trim().lenght > 2) {
        configsVibeName.push(document.getElementById("add-config-vibe-name").value);
        configsVibeLink.push(document.getElementById("add-config-vibe-link").value);
        document.getElementById("profile-add").style.display = "none";
        SaveConfigsVibe();
        CloseAllSections();
        LoadVibeProfileManager();
    }
    else {
        alert("Invalid link");
    }
});
document.getElementById("fragment-vibe-size-text").addEventListener("change", () => {
    console.log(document.getElementById("fragment-vibe-size-text").value);
    settingVibe["fragment-size"] = document.getElementById("fragment-vibe-size-text").value;
    document.getElementById("fragment-status-vibe").checked ? settingVibe["fragment"] = true : settingVibe["fragment"] = false;
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
    ResetArgsVibe();
});
document.getElementById("vpn-type-selected-vibe").addEventListener("change", () => {
    document.getElementById("vpn-type-selected-vibe").value == "tun" ? settingVibe["tun"] = true : settingVibe["tun"] = false;
    saveSetting();
    ResetArgsVibe();
});
document.getElementById("close-vibe-profile-add").addEventListener("click", () => {
    document.getElementById("profile-add").style.display = "none";
});
//#endregion
// #region Section Set Dns
document.getElementById("close-dns").onclick = () => (document.getElementById("dns-set").style.display = "");
document.getElementById("submit-dns").onclick = () => SetDNS(document.getElementById("dns1-text").value, document.getElementById("dns2-text").value);
function SetDNS(dns1, dns2) {
    // Run Dns Jumper With DNS address as parameter for Apply DNS
    (dns1 != "" & dns2 != "") ? (process.platform == "linux") ? spawn(`"${path.join(__dirname, "assets", "bash", "set_dns.sh")}"`, [dns1, dns2]) : ("") : ("");
    if (dns1 != "" & dns2 != "") Run("DnsJumper.exe", [dns1 + "," + dns2]);
}
//#endregion
// #region deep links 
const { ipcRenderer } = require('electron');
const { randomBytes } = require("crypto");
ipcRenderer.on('start-vibe', (event, ev) => {
    ResetArgsVibe();
    LoadVibe();
    connectVibe();
});
ipcRenderer.on('start-warp', (event, ev) => {
    ResetArgsWarp();
    connectWarp();
});
ipcRenderer.on('start-get', (event, key, value) => {

});
ipcRenderer.on('set-warp-true', (event, key) => {
    settingWarp[`${key}`] = true;
    ResetArgsWarp();
    SetSettingWarp();
});
ipcRenderer.on('start-link', (event, link) => {
    alert(link);
});
// #endregion
// Interval Timers and Loads
Onload();
setInterval(() => {
    testProxy();
}, 7500);

