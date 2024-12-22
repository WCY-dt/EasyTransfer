<div align="center">
<img src="client/public/favicon.svg" alt="logo" width="100" height="100" />

<h1>EasyTransfer</h1>

简单分享，匿名传输

[English](README.md) | 简体中文

[![GitHub issues](https://img.shields.io/github/issues/WCY-dt/EasyTransfer)](https://github.com/WCY-dt/EasyTransfer/issues) [![GitHub pull requests](https://img.shields.io/github/issues-pr/WCY-dt/EasyTransfer)](https://github.com/WCY-dt/EasyTransfer/pulls) [![GitHub license](https://img.shields.io/github/license/WCY-dt/EasyTransfer)](https://github.com/WCY-dt/EasyTransfer/blob/main/LICENSE) ![GitHub package.json version](https://img.shields.io/github/package-json/v/WCY-dt/EasyTransfer?filename=client%2Fpackage.json)

<strong style="font-size: 24px;">👉 立即体验：<a href="https://file.ch3nyang.top/">EasyTransfer</a></strong>

</div>

![样例](./example.png)

EasyTransfer 是一款免费、匿名、加密且易于使用的 E2EE 文件传输工具。您只需访问一个简单的网页，即可使用设备代码连接到**任何网络**中的**任何设备**。

它使用 webRTC 和 Vue.js 构建，并且

- **无需**安装任何软件
- **无需**注册账户
- **无需**扫描二维码
- **无需**分享 URL 链接
- **无需**上传文件到服务器[^1]
- **无需**担心网络环境

## 使用方法

1. 在需要传输文件的两台设备上访问 [EasyTransfer](https://file.ch3nyang.top/)。
2. 将任意一台设备的四位设备代码输入到另一台设备的设备代码输入框中，并点击连接按钮。
3. 等待连接成功后，您可以将文件拖放到网页上的文件区域，或者点击文件区域选择文件。支持一次性发送多个文件。
4. 在设置中，可以自定义 STUN 服务器和 TURN 服务器，或者指定最大连接数。

## 注意事项

- 本项目全部托管在免费的服务器上，请不要滥用。

## 自行部署

请参照[项目 Wiki](https://github.com/WCY-dt/EasyTransfer/wiki/导航)。

## 致谢

- 感谢 [metered](https://www.metered.ca/) 提供免费的 STUN 和 TURN 服务器。
- 感谢 [glitch](https://glitch.com/) 提供了免费的信令服务器。

[^1]: 在通信双方需要内网穿透时，文件可能会上传到本项目提供的免费 TURN 服务器。您可以自行部署一个可信的 TURN 服务器来避免这种情况。

## 统计

> 感谢[阮一峰老师](http://www.ruanyifeng.com/blog/2024/12/weekly-issue-329.html)的推荐！

[<img src="https://starchart.cc/WCY-dt/EasyTransfer.svg?axis=%23343a40&line=%23007bff" alt="Stargazers over time" style="zoom: 67%;" />](https://starchart.cc/WCY-dt/EasyTransfer)
