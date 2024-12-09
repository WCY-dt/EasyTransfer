# EasyTransfer - Share simply & stay anonymous

![GitHub](https://img.shields.io/github/license/WCY-dt/EasyTransfer) ![GitHub package.json version](https://img.shields.io/github/package-json/v/WCY-dt/EasyTransfer?filename=client%2Fpackage.json)

[简体中文](README_ZH-cn.md) | English

**👉EXPERIENCE NOW: [EasyTransfer](https://file.ch3nyang.top/)**

![Sample](./example.png)

EasyTransfer is a free, anonymous, encrypted, and easy-to-use E2EE file transfer tool. You only need to visit a simple web page to connect to **any device** in **any network** using a device code.

It is built using webRTC and Vue.js, and there is

- **NO** need to install any software
- **NO** need to register an account
- **NO** need to scan QR codes
- **NO** need to share URL links
- **NO** need to upload files to the server[^1]
- **NO** need to worry about the network environment

## How to use

1. Visit [EasyTransfer](https://file.ch3nyang.top/) on the two devices where you need to transfer files.
2. Enter the four-digit device code of any device into the device code input box of the other device and click the connect button.
3. After waiting for the connection to succeed, you can drag and drop the file to the file area on the web page, or click the file area to select the file. Supports sending multiple files at once.
4. In the settings, you can customize the STUN server and TURN server, or specify the maximum number of connections.

## Notes

- This project is hosted on a free server. Please do not abuse it.

## Self-deployment

1. [Fork](https://github.com/WCY-dt/EasyTransfer/fork) this project.

2. Click the button below to import the entire project into [glitch](https://glitch.com/).

    [![Remix on Glitch](https://cdn.glitch.com/2703baf2-b643-4da7-ab91-7ee2a2d00b5b%2Fremix-button.svg)](https://glitch.com/edit/#!/import/github/WCY-dt/EasyTransfer)

    > You can also choose to use the automated deployment script provided by this project. All you need to do is create a new project in Glitch and run the following command in the project's console:
    >
    > ```shell
    > git config receive.denyCurrentBranch ignore
    > ```
    >
    > Then set up Secrets in GitHub and set `GLITCH_GIT_URL` to the Git URL of your Glitch project.
    >
    > Whenever you push code to the `main` branch, GitHub Actions will automatically sync the code to the Glitch project.

3. The changes you may need to make to the code include:

    - **IceServers**: modify `iceServers` in [`./client/src/stores/connect.js`](./client/src/stores/setting.ts) to your own STUN and TURN server addresses;
    - **SignalServerUrl**: modify `VITE_SIGNAL_SERVER_URL` in [`./client/.env.production`](./client/.env.production) to your own signaling server address;
    - You may also need to modify `VITE_SIGNAL_SERVER_URL` in [`./client/.env.development`](./client/.env.development) to use a different signaling server address in the development environment to avoid conflicts with the production environment.

4. Open GitHub Pages and select the `gh-pages` branch as the source. GitHub Actions will automatically build and deploy.

## TODO

- [x] Support large file transmission
- [x] Optimize transmission speed
- [x] Support photo transmission
- [x] Support plain text transmission
- [x] Support parallel transmission

## Acknowledgements

- Thanks to [metered](https://www.metered.ca/) for providing free STUN and TURN servers.
- Thanks to [glitch](https://glitch.com/) for providing free signaling servers.

[^1]: If the communicating peers need to penetrate the intranet, the file may be uploaded to the free TURN server provided by this project. You can avoid this by deploying a trusted TURN server yourself.
