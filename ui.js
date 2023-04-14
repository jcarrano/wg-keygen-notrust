(new URL(window.location.href)).searchParams.forEach((x, y) => {
    let el = document.getElementById(y);
    if (el) {
        if (el.type == "checkbox") {
            el.checked = (x == "on");
            el.dispatchEvent(new Event("change"));
            //            el.dispatchEvent(new initEvent("change", false, true));
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
    let fd = new FormData(document.getElementById('params'));
    let clientcfg = [
        "[Interface]",
        "# PublicKey = " + kp.publicKey,
        (fd.get("cn") ? "# ClientName = " + fd.get("cn") : ""),
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
    if (fd.get("ae")) {
        to = 'to=' + encodeURIComponent(fd.get("ae")) + '&';
    }
    else to = '';
    server_em.setAttribute('href',
        'mailto:?' + to + 'subject=' + encodeURIComponent(subject) + "&body=" + encodedfrag);

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
