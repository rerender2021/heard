<p align="center">
    <img width="375" src="./docs/images/logo.png">
</p>

<div align="center">

[![build](https://github.com/rerender2021/heard/actions/workflows/build.yml/badge.svg?branch=main&event=push)](https://github.com/rerender2021/heard/actions/workflows/build.yml) [![pack](https://github.com/rerender2021/heard/actions/workflows/pack.yml/badge.svg?branch=main&event=push)](https://github.com/rerender2021/heard/actions/workflows/pack.yml)

 </div>
 
# 简介

听到了! (Heard) 是一个字幕生成器，原理：

-   使用 [Whisper](https://github.com/openai/whisper) 生成字幕，支持 GPU 模式
-   GUI 部分则是使用 [Ave React](https://qber-soft.github.io/Ave-React-Docs/) 开发的

![heard-usage](./docs/images/heard-usage.png)

<!-- 演示视频见:

-   [回声：实时英语语音翻译](https://www.bilibili.com/video/BV11L411d7HE/) -->

# 使用说明

-   软件首页：https://rerender2021.github.io/products/heard/

# 开发者向

## 本地开发

```bash
> npm install
> npm run dev
```

开发过程中需要确保本机启动了 Whisper 服务器: https://github.com/rerender2021/Whisper-API/releases/tag/1.0.0


下载它，并解压到项目下，确保项目目录结构如下：

```
- whisper-gpu-server
    - Whisper-API.exe
    - ...
- src
- ...
- package.json
```

## 功能扩展

默认支持 Whisper 类型为 base 的模型（英语 & 多语言），如果需要使用其它模型，可自行下载，并放在 `whisper-gpu-server\model` 下。
- 模型下载地址：https://github.com/openai/whisper/discussions/63#discussioncomment-3798552

## 打包发布

-   生成 exe

```bash
> npm run release
```

# 开源协议

[MIT](./LICENSE)

# 赞赏

`:)` 如果此软件值得赞赏，可以请作者看小说，一元足足可看八章呢。

<p align="left">
    <img width="300" src="https://rerender2021.github.io/assets/donate.jpg">
</p>
