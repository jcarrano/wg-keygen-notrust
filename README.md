# Wireguard Key Generator

Browser-based, offline-capable, client-side, trustless

## Available

### IPFS

https://gateway.pinata.cloud/ipfs/QmdGs4rfkTS3D4614sjUysx9XxJkp57v5sm59w259eX7ov

or

https://ipfs.io/ipfs/QmdGs4rfkTS3D4614sjUysx9XxJkp57v5sm59w259eX7ov

### GitHub

https://jcarrano.github.io/wg-keygen-notrust/

Note that this link is not content-addressed, so here you should trust me.
## What is this

This is a website that can generate a Wireguard keypair. The user
is given two files to download: a wireguard config with his private key (and additional parameters),
to load into his VPN software, and a "fragment", which is a `[Peer]` section that he
must send to the server administrator.

AT THIS POINT NO EXTERNAL SERVER IS CONTACTED. KEYS NEVER LEAVE THE USER'S COMPUTER UNTIL
THEY EXPLICITLY SEND THE FRAGMENT TO THE SEVER ADMIN.

Compared to other online key generators out there, this one does not require you to
trust me (the author) or the person running the webserver.

- You don't have to trust me because the code is small and clear. You can review and
  audit it from the point where I imported Jason Donenfeld's code through all
  the additions I made.
- You do not have to trust the webserver not to tamper with the site because it
  is hosted on IPFS, which is [content-addressed](https://en.wikipedia.org/wiki/Content-addressable_storage),
  so if the address/hash is the same, the content is the same.

Alternatively, you could host the site yourself.

## OPNsense bridge

Additionally, there's an interface to OPNsense instances. These get contacted to get back a free IP address inside the given tunnel realm, get a wireguard server list and finally push the generated config to the OPNsense. AT THIS POINT, A SERVER IS CONTACTED, but only the one You gave inside the field "OPNsense URL". THERE IS NO OTHER SERVER CONTACTED BY THIS PROJECT.
To make this work, You have to put or link the file `opnsensebridge.py` into your `cgi-bin` directory (i.e. `/usr/lib/cgi-bin`) and make it executable. It must be accessible and executable from `/cgi-bin/opnsensebridge.py`. Also You might need the apache cgi module which You can enable with `a2enmod cgid`.
This funtion is in a beta state, errors might not get caught, things can happen...

## Single-file version

A single-file version with embedded scripts is available under the "single-file"
branch, however it does not work on IPFS gateways due the content-security
policy.

## Some additional background

When setting up a Wireguard VPN server you have two choices:

- Generate the private keys yourself and send them to users, in which
  case the files must be send under a secure (private, authenticated) channel
  (i.e. NOT email).
- Users can generate a keypair and send the server admin the public key over
  an authenticated (but not necessarily private) channel, in which case they
  need to have the technical know how to use the command line tools and to
  build a configuration file.

This website allows users to generate their own keys and configuration files with
no special knowledge required..

### Instructions

The VPN admin fills in the form fields and clicks "save", which generates a URL
with the parameters saved inside the query string. Upon opening this URL the form will
be pre-filled. It's strongly advised not to save with filled out OPNsense credentials - they will appear openly in the resulting URL.

The admin sends the URL to users, which generate the keys and send the "Server
Fragment" back to the admin. An email address can optionally be specified,
which will enable a "mailto" link to directly mail the fragment back to the
admin.

## License

This code is licensed under the GNU GPLv2, since that was the license of the
original JS code. I would like a more permissive license.
