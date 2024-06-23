# EasyTransfer

[简体中文](README_cn.md) | English

EasyTransfer is a free, simple, and easy-to-use P2P file transfer tool. You only need to visit a simple web page to connect to **any device** in **any network** using a device code.

It is built using webRTC, **no need to scan codes**, **no need to share URL links**, **no need to upload files to the server**.

## How to use

1. Visit [EasyTransfer](https://file.ch3nyang.top/) on the two devices where you need to transfer files.
2. Enter the four-digit device code of any device into the device code input box of the other device and click the connect button.
3. After waiting for the connection to succeed, you can drag and drop the file to the file area on the web page, or click the file area to select the file. Supports sending multiple files at once.

## Notes

- Signaling and data may be leaked, please do not transfer private files.
- This project is hosted on a free server, please do not abuse it.

## TODO

- [x] Support large file transmission
- [x] Optimize transmission speed
- [x] Support photo transmission
- [x] Support plain text transmission
- [ ] Support breakpoint resume
- [ ] Encrypted transmission

## Acknowledgements

- Thanks to [metered](https://www.metered.ca/) for providing free STUN and TURN servers.
- Thanks to [glitch](https://glitch.com/) for providing free signaling servers.
