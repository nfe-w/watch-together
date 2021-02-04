// ==UserScript==
// @name         视频播放进度同步插件（HTML5）
// @version      0.1
// @description  基于webSocket，通过同步播放、暂停、拖拽进度条等操作，可以让多人同步播放进度；脚本目前支持bilibili、腾讯视频、爱奇艺，理论上其他H5播放平台也支持，可修改脚本中的@match标签。
// @author       nfe-w
// @homepageURL  https://github.com/nfe-w
// @include      https://www.bilibili.com/video/*
// @include      https://v.qq.com/x/*
// @include      https://www.iqiyi.com/*
// @require      https://cdn.bootcdn.net/ajax/libs/jquery/3.5.1/jquery.js
// @require      https://cdn.jsdelivr.net/npm/sweetalert2@10.10.0/dist/sweetalert2.all.min.js
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function () {
    'use strict';

    let syncVideo = {
        // 后端地址（由于视频播放网站大多为https，因此需要wss地址）
        websocketServerUrl: 'wss://ip:port/watchTogether/connection',
        // 连接口令
        connectKey: '',
        // 用户名
        userName: '',

        ws: null,
        lastActTime: new Date().getTime(),

        connectToServer: function () {
            if (!syncVideo.websocketServerUrl) {
                alert('【H5视频播放进度同步插件】未配置服务地址，开启失败');
                return;
            }
            if (!syncVideo.connectKey) {
                alert('【H5视频播放进度同步插件】未配置连接口令，开启失败');
                return;
            }
            if (!syncVideo.userName) {
                alert('【H5视频播放进度同步插件】未配置用户名，开启失败');
                return;
            }

            let videoArrays = document.getElementsByTagName('video');
            let video = videoArrays[0];
            if (!video) {
                alert('【H5视频播放进度同步插件】当前页面不包含H5视频播放器，开启失败');
                return;
            }

            video.addEventListener('play', function () {
                let now = new Date().getTime();
                if (now - syncVideo.lastActTime > 500) {
                    console.log('【H5视频播放进度同步插件】PLAY');
                    syncVideo.sendMessage('PLAY', null);
                } else {
                    syncVideo.lastActTime = now;
                }
            });
            video.addEventListener('pause', function () {
                let now = new Date().getTime();
                if (now - syncVideo.lastActTime > 500) {
                    console.log('【H5视频播放进度同步插件】PAUSE');
                    syncVideo.sendMessage('PAUSE', null);
                } else {
                    syncVideo.lastActTime = now;
                }
            });
            video.addEventListener('seeked', function () {
                console.log('【H5视频播放进度同步插件】SEEKED: ' + video.currentTime);
                syncVideo.sendMessage('SEEKED', video.currentTime);
            });

            if (syncVideo.ws === undefined || syncVideo.ws === null || syncVideo.ws.readyState !== 1) {
                syncVideo.ws = new WebSocket(syncVideo.websocketServerUrl + '/' + syncVideo.connectKey + '/' + syncVideo.userName);
            }

            syncVideo.ws.onopen = function () {
                alert('【H5视频播放进度同步插件】连接服务器成功');
                console.log('【H5视频播放进度同步插件】websocket 连接成功');
            };

            syncVideo.ws.onclose = function (event) {
                alert('【H5视频播放进度同步插件】断开服务器连接');
                console.log('【H5视频播放进度同步插件】websocket 断开连接: ' + event.code + ' ' + event.reason + ' ' + event.wasClean);
                console.log(event);
            };

            syncVideo.ws.onmessage = function (event) {
                let result = JSON.parse(event.data)
                if (result.messageType === 'MSG') {
                    alert('【H5视频播放进度同步插件】' + result.message);
                    console.log('【H5视频播放进度同步插件】' + result.message);
                } else if (result.messageType === 'ACTION') {
                    if (result.actionType === 'PLAY') {
                        video.play()
                    }
                    if (result.actionType === 'PAUSE') {
                        video.pause();
                    }
                    if (result.actionType === 'SEEKED') {
                        if (result.videoTime < video.currentTime - 1 || result.videoTime > video.currentTime + 1) {
                            video.currentTime = result.videoTime;
                        }
                    }
                }
            };
        },
        disconnect: function () {
            if (syncVideo.ws !== undefined && syncVideo.ws !== null && syncVideo.ws.readyState === 1) {
                syncVideo.ws.close();
            }
        },
        sendMessage: function (type, currentTime) {
            if (syncVideo.ws.readyState === 1) {
                syncVideo.ws.send(JSON.stringify({
                    messageType: 'ACTION',
                    actionType: type,
                    videoTime: currentTime
                }));
            } else {
                console.log('【H5视频播放进度同步插件】尚未连接 webSocket 服务器');
            }
        },
        getValueFromStorage: function () {
            let websocketServerUrl = GM_getValue('syncVideo.websocketServerUrl');
            let connectKey = GM_getValue('syncVideo.connectKey');
            let userName = GM_getValue('syncVideo.userName');
            if (websocketServerUrl) {
                syncVideo.websocketServerUrl = websocketServerUrl;
            }
            if (connectKey) {
                syncVideo.connectKey = connectKey;
            }
            if (userName) {
                syncVideo.userName = userName;
            }
        }
    };

    syncVideo.getValueFromStorage();

    GM_registerMenuCommand('配置服务器信息', () => {
        let dom = '';
        dom += '<div style="padding-bottom: 5px">　地址： <input id="txtServerUrl" type="text" style="width: 240px;" value ="' + syncVideo.websocketServerUrl + '"></div>';
        dom += '<div style="padding-bottom: 5px">　口令： <input id="txtConnectKey" type="text" style="width: 240px;" value="' + syncVideo.connectKey + '"></div>';
        dom += '<div style="padding-bottom: 5px">用户名： <input id="txtUserName" type="text" style="width: 240px;" value="' + syncVideo.userName + '"></div>';
        dom = '<div>' + dom + '</div>';
        let $dom = $(dom);
        Swal.fire({
            title: '配置服务器信息',
            html: $dom[0],
            showCancelButton: true,
            confirmButtonText: '保存',
            cancelButtonText: "取消"
        }).then((isConfirm) => {
            if (isConfirm.value) {
                syncVideo.websocketServerUrl = $('#txtServerUrl').val();
                syncVideo.connectKey = $('#txtConnectKey').val();
                syncVideo.userName = $('#txtUserName').val();

                GM_setValue('syncVideo.websocketServerUrl', syncVideo.websocketServerUrl);
                GM_setValue('syncVideo.connectKey', syncVideo.connectKey);
                GM_setValue('syncVideo.userName', syncVideo.userName);
            }
        });
    });

    GM_registerMenuCommand('连接服务器', () => {
        syncVideo.connectToServer();
    });

    GM_registerMenuCommand('断开连接', () => {
        syncVideo.disconnect();
    });
})();