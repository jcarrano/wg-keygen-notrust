
(new URL(window.location.href)).searchParams.forEach((x, y) => {
    let el = document.getElementById(y);
    if (el)
        el.value = x;
});
function genCfg() {
    let results = document.getElementById('results');
    results.setAttribute("style", "");
    let kp = wireguard.generateKeypair();
    let psk = wireguard.generatePresharedKey();
    let fd = new FormData(document.getElementById('params'));
    let clientcfg = [
        "[Interface]",
        "PrivateKey = "+kp.privateKey,
        "Address = "+fd.get("ca")+"/32",
        "[Peer]",
        "Endpoint = "+fd.get("sa")+":"+fd.get("sp"),
        "PublicKey = "+fd.get("sk"),
        "PresharedKey = "+psk,
        "AllowedIPs = "+fd.get("aa")+"/"+fd.get("ap"),
        (fd.get("ka") > 0)? ("PersistentKeepalive = "+fd.get("ka")) : ""].join("\n");
    let client_dl = document.getElementById('client-dl');
    client_dl.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(clientcfg));
    client_dl.setAttribute("download", "wireguard.conf")
    let serverfrag = [
        "[Peer]",
        (fd.get("cn")? "# "+fd.get("cn") : ""),
        "PublicKey = "+kp.publicKey,
        "PresharedKey = "+psk,
        "AllowedIPs = "+fd.get("ca")+"/32"].join("\n");
    let server_dl = document.getElementById('server-dl');
    let encodedfrag = encodeURIComponent(serverfrag);
    server_dl.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodedfrag);
    server_dl.setAttribute("download", "wg-"+(fd.get("cn")? fd.get("cn") : "peer")+".conf")
    let server_em = document.getElementById('server-em');
    if (fd.get("ae")) {
        let subject = "Wireguard pubkey" + (fd.get("cn")? " for "+fd.get("cn"):"");
        server_em.setAttribute('href',
            'mailto:' + fd.get("ae") + "?subject="+ encodeURIComponent(subject)+"&body="+encodedfrag);
        server_em.setAttribute("style", "display: inherit");
    } else {
        server_em.setAttribute("style", "display: none");
    }
    results.setAttribute("style", "display: inherit");
}
document.getElementById('genbtn').onclick = genCfg;
