<div align="center">
<img src="client/public/favicon.svg" alt="logo" width="100" height="100" />

<h1>EasyTransfer</h1>

[简体中文](README_ZH-cn.md) | English

[![GitHub issues](https://img.shields.io/github/issues/WCY-dt/EasyTransfer)](https://github.com/WCY-dt/EasyTransfer/issues) [![GitHub pull requests](https://img.shields.io/github/issues-pr/WCY-dt/EasyTransfer)](https://github.com/WCY-dt/EasyTransfer/pulls) [![GitHub license](https://img.shields.io/github/license/WCY-dt/EasyTransfer)](https://github.com/WCY-dt/EasyTransfer/blob/main/LICENSE) ![GitHub package.json version](https://img.shields.io/github/package-json/v/WCY-dt/EasyTransfer?filename=client%2Fpackage.json)

<strong style="font-size: 24px;">👉 EXPERIENCE NOW: <a href="https://file.ch3nyang.top/">EasyTransfer</a></strong>

</div>

![Sample](./og-image.png)

EasyTransfer is a free, anonymous, encrypted, and easy-to-use E2EE file transfer tool. You only need to visit a simple web page to connect to **any device** in **any network** using a device code.

It is built using webRTC and Vue.js.

## How to use

1. Visit [EasyTransfer](https://file.ch3nyang.top/) on the two devices where you need to transfer files.
2. Enter the four-digit device code of any device into the device code input box of the other device and click the connect button.
3. After waiting for the connection to succeed, you can drag and drop the file to the file area on the web page, or click the file area to select the file. Supports sending multiple files at once.
4. In the settings, you can customize the STUN server and TURN server, or specify the maximum number of connections.

> [!NOTE]
>
> This project currently uses free STUN/TURN servers, which has a monthly traffic limit. Please do not abuse it. It is recommended that you deploy a STUN/TURN server yourself to obtain faster speed and higher stability.

## Features

What makes EasyTransfer different? It's these features:

- 🫣 **Anonymous**: No need to register an account, log in, or provide any personal information
- 🔒 **Encrypted**: Default encryption ensures the security of file transfer
- 🔄 **End-to-end**: Files are transferred directly from the sender to the receiver without going through the server[^1]
- 🌐 **Cross-network**: Supports file transfer between LAN and WAN
- 🛠️ **Easy to use**: Connect devices using a four-digit device code, without any extra operations
- 📎 **Multimedia messages**: Supports sending text and various file types, and also supports sending photos
- ⚙️ **Custom settings**: All modules can be customized and deployed by yourself

## Self-deployment

Please refer to the [project Wiki](https://github.com/WCY-dt/EasyTransfer/wiki/Navigator).

## Acknowledgements

Thanks to the following organizations for providing free services:

|                                                           | Organization                       | Service provided           |
| --------------------------------------------------------- | ---------------------------------- | -------------------------- |
| <img src="imgs/metered.webp" alt="metered" width="100" /> | [metered](https://www.metered.ca/) | Free STUN and TURN servers |
| <img src="imgs/glitch.webp" alt="glitch" width="100" />   | [glitch](https://glitch.com/)      | Free signaling server      |

## Statistics

Thanks to these organizations or individuals for recommending this project[^2]:

| <img src="imgs/ruanyf.webp" alt="ruanyf" width="100" /> | <img src="imgs/appinn.webp" alt="小众软件" width="100" /> | <img src="imgs/ahhhhfs.webp" alt="ahhhhfs" width="100" /> | <img src="imgs/iiiiShare.webp" alt="i资源分享" width="100" /> |
| ------------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------- |
| [Ruan Yifeng](https://github.com/ruanyf)                | [Appinn](https://meta.appinn.net/)                        | [ahhhhfs](https://www.ahhhhfs.com/)                       | [iShare](https://x.com/iiiiShare)                             |

[<img src="https://api.star-history.com/svg?repos=WCY-dt/EasyTransfer&type=Date" alt="Star History Chart" style="zoom: 67%;" />](https://star-history.com/#WCY-dt/EasyTransfer&Date)

[^1]: If the communicating peers need to penetrate the intranet, the file may be uploaded to the free TURN server provided by this project. You can avoid this by deploying a trusted TURN server yourself.

[^2]: If you have recommended this project and are not listed here, please contact me to add it.
