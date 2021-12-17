# watch-together

## 简介

基于webSocket的浏览器播放进度同步插件

## 运行环境

- Java 8

## 使用步骤

1. 【服务器】部署java后端
2. 【服务器】配置nginx ssh 证书（由于视频播放网站大多为https，因此需要wss地址）
3. 【浏览器】安装[油猴插件](https://www.tampermonkey.net/)
4. 【浏览器】在油猴插件内新建脚本，并将 [tampermonkey.js](https://github.com/nfe-w/watch-together/blob/master/tampermonkey.js) 的内容全量复制到油猴脚本中
5. 【浏览器】对插件进行配置如下图

![image-20211217113147331](https://s2.loli.net/2021/12/17/xuImSZv9jqydRFY.png)

## 声明:

- 本仓库发布的`watch-together`项目中涉及的任何脚本，仅用于测试和学习研究，禁止用于商业用途
- `nfe-w` 对任何脚本问题概不负责，包括但不限于由任何脚本错误导致的任何损失或损害
- 以任何方式查看此项目的人或直接或间接使用`watch-together`项目的任何脚本的使用者都应仔细阅读此声明
- `watch-together` 保留随时更改或补充此免责声明的权利。一旦使用并复制了任何相关脚本或`watch-together`项目，则视为已接受此免责声明
- 本项目遵循`MIT LICENSE`协议，如果本声明与`MIT LICENSE`协议有冲突之处，以本声明为准