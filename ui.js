(new URL(window.location.href)).searchParams.forEach((x, y) => {
    let el = document.getElementById(y);
    if (el) {
        if (el.type == "checkbox") {
            el.checked = (x == "on");
            el.dispatchEvent(new InputEvent('change'));
        }
        else el.value = x;
    }
});

// Make the result section disappear when changing relevant input fields
for (var element of document.getElementById("relevant_for_clientconfig").getElementsByTagName("input")) {
    document.getElementById(element.id).setAttribute('onbeforeinput', 'getElementById("results").setAttribute("style", "display: none")');
}

function genCfg() {
    if (document.getElementById("pka").checked) genPsk();
    if (document.getElementById("cna").checked) generateCN();
    let results = document.getElementById('results');
    results.setAttribute("style", "");
    let kp = wireguard.generateKeypair();
    document.getElementById("puk").value = kp.publicKey;
    let fd = new FormData(document.getElementById('params'));
    let clientcfg = [
        "[Interface]",
        (fd.get("cn") ? "# ClientName = " + fd.get("cn") : ""),
        "# PublicKey = " + kp.publicKey,
        "PrivateKey = " + kp.privateKey,
        "Address = " + fd.get("ca"),
        (fd.get("dn")) ? ("DNS = " + fd.get("dn")) : "",
        (fd.get("mt") > 0) ? ("MTU = " + fd.get("mt")) : "",
        "[Peer]",
        "Endpoint = " + fd.get("sa") + ":" + fd.get("sp"),
        "PublicKey = " + fd.get("sk"),
        (fd.get("pk")) ? ("PresharedKey = " + fd.get("pk")) : "",
        "AllowedIPs = " + fd.get("aa"),
        (fd.get("ka") > 0) ? ("PersistentKeepalive = " + fd.get("ka")) : ""].filter(Boolean).join("\n");
    let client_dl = document.getElementById('client-dl');
    client_dl.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(clientcfg));
    client_dl.setAttribute("download", "wireguard.conf")
    let client_sh = document.getElementById('client-sh');
    client_sh.textContent = clientcfg;

    let serverfrag = [
        "[Peer]",
        (fd.get("cn") ? "# ClientName = " + fd.get("cn") : ""),
        "PublicKey = " + kp.publicKey,
        (fd.get("pk")) ? ("PresharedKey = " + fd.get("pk")) : "",
        "AllowedIPs = " + fd.get("ca")].filter(Boolean).join("\n");
    let server_dl = document.getElementById('server-dl');
    let server_sh = document.getElementById('server-sh');
    server_sh.textContent = serverfrag;
    let encodedfrag = encodeURIComponent(serverfrag);
    server_dl.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodedfrag);
    server_dl.setAttribute("download", "wg-" + (fd.get("cn") ? fd.get("cn") : "peer") + ".conf")
    let server_em = document.getElementById('server-em');
    let subject = "Wireguard server config" + (fd.get("cn") ? " for " + fd.get("cn") : "");
    server_em.setAttribute('href',
        'mailto:?subject=' + encodeURIComponent(subject) + "&body=" + encodedfrag);

    let server_ps = document.getElementById('server-ps');
    let needed = ["ca", "cn", "os", "osk", "oss", "owg"]
    let missing = false;
    let missingelements = [];
    needed.forEach(element => {
        if (!fd.get(element)) {
            missing = true;
            missingelements.push(document.getElementById(element).parentNode.querySelector("label[for='" + element + "']").innerHTML);
        }
    });
    if (!missing) {
        server_ps.setAttribute('href', 'javascript:pushconfig()');
        if (server_ps.getAttribute('xtitle')) server_ps.setAttribute("title", server_ps.getAttribute('xtitle'));
        server_ps.removeAttribute("class");
    } else {
        server_ps.setAttribute("class", "disabled");
        if (!server_ps.getAttribute('xtitle')) server_ps.setAttribute("xtitle", server_ps.getAttribute('title'));
        server_ps.setAttribute("title", "enter " + missingelements.join(", ") + " to enable");
        server_ps.removeAttribute("href");
    }
    results.setAttribute("style", "display: inherit");
}

function genPsk() {
    let pkfield = document.getElementById('pk');
    pkfield.value = wireguard.generatePresharedKey();
    pkfield.dispatchEvent(new InputEvent('beforeinput'));
}

function generateCN() {
    d = new Date();
    var datestring = d.getFullYear().toString().substring(2) + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2) +
        "_" + ("0" + d.getHours()).slice(-2) + "-" + ("0" + d.getMinutes()).slice(-2) + "-" + ("0" + d.getSeconds()).slice(-2);
    let cnfield = document.getElementById('cn');
    cnfield.value = 'user_' + datestring;
    cnfield.dispatchEvent(new InputEvent('beforeinput'));
}

function copycl(text) {
    navigator.clipboard.writeText(text).then(function () {
        console.log('Async: Copying to clipboard was successful!');
    }, function (err) {
        console.error('Async: Could not copy text: ', err);
    });
}

function getservers() {
    let cafield = document.getElementById('ca');
    cafield.dispatchEvent(new InputEvent('beforeinput'));
    let fd = new FormData(document.getElementById('params'));
    let needed = ["os", "osk", "oss"]
    let missing = false;
    needed.forEach(element => {
        if (!document.getElementById(element).value) {
            missing = true;
            document.getElementById(element).setAttribute("style", "background-color: rgb(255, 130, 130)");
        }
    });
    if (missing) return;
    document.getElementById('err').innerHTML = "Getting Servers..."
    document.getElementById('err').setAttribute("style", "background-color: rgb(100, 100, 255)");
    var xmlHttp = null;
    try {
        xmlHttp = new XMLHttpRequest();
    } catch (e) {
    }
    if (xmlHttp) {
        xmlHttp.open('GET', "/cgi-bin/opnsensebridge.py?task=getservers&opnsenseURL=" + encodeURI(document.getElementById('os').value) +
            "&key=" + encodeURIComponent(document.getElementById('osk').value) +
            "&secret=" + encodeURIComponent(document.getElementById('oss').value), true);
        xmlHttp.responseType = "JSON";
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4) {
                try {
                    res = JSON.parse(xmlHttp.responseText);
                    if (!res.arr) throw ""
                    res.arr.forEach(obj => {
                        var option = document.createElement("option");
                        option.value = obj.uuid;
                        option.text = obj.interface + ": " + obj.name;
                        document.getElementById('owgl').appendChild(option);
                    });
                    document.getElementById("owg").value = document.getElementById("owgl").value;
                    document.getElementById("owgl").onchange = changeListener;
                    document.getElementById('err').innerHTML = "Get Servers: Success.";
                    document.getElementById('err').setAttribute("style", "background-color: rgb(100, 255, 100)");
                }
                catch {
                    document.getElementById('err').innerHTML = "Get Servers Error: " + xmlHttp.responseText;
                    document.getElementById('err').setAttribute("style", "background-color: rgb(255, 100, 100)");

                }
            }
        };
        xmlHttp.send(null);
    }
}

function changeListener() {
    document.getElementById("owg").value = this.value;
}

function getIP() {
    let cafield = document.getElementById('ca');
    cafield.dispatchEvent(new InputEvent('beforeinput'));
    let fd = new FormData(document.getElementById('params'));
    let needed = ["os", "osk", "oss", "tr"]
    let missing = false;
    needed.forEach(element => {
        if (!document.getElementById(element).value) {
            missing = true;
            document.getElementById(element).setAttribute("style", "background-color: rgb(255, 130, 130)");
        }
    });
    if (missing) return;
    document.getElementById('err').innerHTML = "Getting IP..."
    document.getElementById('err').setAttribute("style", "background-color: rgb(100, 100, 255)");
    var xmlHttp = null;
    try {
        xmlHttp = new XMLHttpRequest();
    } catch (e) {
    }
    if (xmlHttp) {
        xmlHttp.open('GET', "/cgi-bin/opnsensebridge.py?task=getip&opnsenseURL=" + encodeURI(document.getElementById('os').value) +
            "&key=" + encodeURIComponent(document.getElementById('osk').value) +
            "&secret=" + encodeURIComponent(document.getElementById('oss').value) +
            "&tunnelRealm=" + encodeURIComponent(document.getElementById('tr').value), true);
        xmlHttp.responseType = "JSON";
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4) {
                try {
                    res = JSON.parse(xmlHttp.responseText);
                    if (!res.ip) throw ""
                    cafield.value = res.ip;
                    document.getElementById('err').innerHTML = "Get unused IP: Success.";
                    document.getElementById('err').setAttribute("style", "background-color: rgb(100, 255, 100)");
                }
                catch {
                    document.getElementById('err').innerHTML = "Get unused IP Error: " + xmlHttp.responseText;
                    document.getElementById('err').setAttribute("style", "background-color: rgb(255, 100, 100)");
                };
            }
        };
        xmlHttp.send(null);
    }
}

function pushconfig() {
    //if (!confirm("Really push this config to OPNsense?")) {
    //    return;
    //}
    document.getElementById('err').innerHTML = "Creating Client..."
    document.getElementById('err').setAttribute("style", "background-color: rgb(100, 100, 255)");
    var xmlHttp = null;
    try {
        xmlHttp = new XMLHttpRequest();
    } catch (e) {
    }
    if (xmlHttp) {
        xmlHttp.open('GET', "/cgi-bin/opnsensebridge.py?task=createclient&opnsenseURL=" + encodeURI(document.getElementById('os').value) +
            "&key=" + encodeURIComponent(document.getElementById('osk').value) +
            "&secret=" + encodeURIComponent(document.getElementById('oss').value) +
            "&PeerName=" + encodeURIComponent(document.getElementById('cn').value) +
            "&pubkey=" + encodeURIComponent(document.getElementById('puk').value) +
            "&pskey=" + encodeURIComponent(document.getElementById('pk').value) +
            "&tunnelAddress=" + encodeURIComponent(document.getElementById('ca').value), true);
        xmlHttp.responseType = "JSON";

        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4) {
                try {
                    res = JSON.parse(xmlHttp.responseText);
                    if (!res.uuid) throw ""
                    document.getElementById('err').innerHTML = "Create Client: Success.";
                    document.getElementById('err').setAttribute("style", "background-color: rgb(100, 255, 100)");
                    enableclient(res.uuid);
                }
                catch {
                    document.getElementById('err').innerHTML = "Create Client Error: " + xmlHttp.responseText
                    document.getElementById('err').setAttribute("style", "background-color: rgb(255, 100, 100)");

                };

            }
        };
        xmlHttp.send(null);
    }

}

function enableclient(uuid) {
    document.getElementById('err').innerHTML = "Enabling Client..."
    document.getElementById('err').setAttribute("style", "background-color: rgb(100, 100, 255)");
    var xmlHttp = null;
    try {
        xmlHttp = new XMLHttpRequest();
    } catch (e) {
    }
    if (xmlHttp) {
        xmlHttp.open('GET', "/cgi-bin/opnsensebridge.py?task=enableclient&opnsenseURL=" + encodeURI(document.getElementById('os').value) +
            "&key=" + encodeURIComponent(document.getElementById('osk').value) +
            "&secret=" + encodeURIComponent(document.getElementById('oss').value) +
            "&ServerUUID=" + encodeURIComponent(document.getElementById('owg').value) +
            "&PeerUUID=" + encodeURIComponent(uuid, true));
        xmlHttp.responseType = "JSON";

        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4) {
                try {
                    res = JSON.parse(xmlHttp.responseText);
                    if (res.result != "saved") throw ""
                    document.getElementById('err').innerHTML = "Enable Client: Success.";
                    document.getElementById('err').setAttribute("style", "background-color: rgb(100, 255, 100)");
                    reconfigure();
                }
                catch {
                    document.getElementById('err').innerHTML = "Enable Client Error: " + xmlHttp.responseText
                    document.getElementById('err').setAttribute("style", "background-color: rgb(255, 100, 100)");

                };

            }
        };
        xmlHttp.send(null);
    }

}

function reconfigure() {
    document.getElementById('err').innerHTML = "Reconfiguring... may take up to 30 seconds."
    document.getElementById('err').setAttribute("style", "background-color: rgb(100, 100, 255)");
    var xmlHttp = null;
    try {
        xmlHttp = new XMLHttpRequest();
    } catch (e) {
    }
    if (xmlHttp) {
        xmlHttp.open('GET', "/cgi-bin/opnsensebridge.py?task=reconfigure&opnsenseURL=" + encodeURI(document.getElementById('os').value) +
            "&key=" + encodeURIComponent(document.getElementById('osk').value) +
            "&secret=" + encodeURIComponent(document.getElementById('oss').value));
        xmlHttp.responseType = "JSON";

        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4) {
                try {
                    if (!xmlHttp.responseText) {
                        document.getElementById('err').innerHTML = "Reconfiguring: Answer Timed Out, process probably still successful.";
                        document.getElementById('err').setAttribute("style", "background-color: rgb(255, 255, 100)");
                        return;
                    }
                    res = JSON.parse(xmlHttp.responseText);
                    if (res.status != "ok") throw ""
                    document.getElementById('err').innerHTML = "Reconfiguring: Success.";
                    document.getElementById('err').setAttribute("style", "background-color: rgb(100, 255, 100)");
                }
                catch {
                    document.getElementById('err').innerHTML = "Reconfiguring Error: " + xmlHttp.responseText
                    document.getElementById('err').setAttribute("style", "background-color: rgb(255, 100, 100)");

                };

            }
        };
        xmlHttp.send(null);
    }

}

