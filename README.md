# Wireguard Key Generator

Browser-based, offline-capable, client-side, trustless

## Available

### IPFS

https://gateway.pinata.cloud/ipfs/QmdU8zZ1HPrS7JZQ5AqCbGnCE2zLqtiGLpxPYL99XTipZk

or

https://ipfs.io/ipfs/QmdU8zZ1HPrS7JZQ5AqCbGnCE2zLqtiGLpxPYL99XTipZk

### GitHub

https://htmlpreview.github.io/?https://github.com/jcarrano/wg-keygen-notrust/blob/6979e6b2e9d0c5eef62ace9277fe94fc97528dc2/index.html

## What is this

This is a single-file website that can generate a Wireguard keypair. The user
is given two files to download: a wireguard config with his private key (and additional parameters),
to load into his VPN software, and a "fragment", which is a `[Peer]` section that he
must send to the server administrator.

AT NO POINT IS ANY EXTERNAL SERVER CONTACTED. KEYS NEVER LEAVE THE USER'S COMPUTER UNTIL
THEY EXPLICITLY SEND THE FRAGMENT TO THE SEVER ADMIN.

Compared to other online key generators out there, this one does not require you to
trust me (the author) or the person running the webserver.

- You don't have to trust me because the code is small and clear. You can review and
  audit it from the point where I imported Jason Donenfeld's code through all
  the additions I made.
- You do not have to trust the webserver not to tamper with the site because it
  is hosted on IPFS, which is [content-addressed](https://en.wikipedia.org/wiki/Content-addressable_storage),
  so if the address/hash is the same, the content is the same.
  - You can also access it via the Github HTML preview, which embeds the git
    commit hash, so you know you are getting the right version.

Alternatively, you could host the site yourself.

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
be pre-filled.

The admin sends the URL to users, which generate the keys and send the "Server
Fragment" back to the admin. An email address can optionally be specified,
which will enable a "mailto" link to directly mail the fragment back to the
admin.

## License

This code is licensed under the GNU GPLv2, since that was the license of the
original JS code. I would like a more permissive license.
