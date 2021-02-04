package com.nfe.h5videoactionsync.websocket;

import com.alibaba.fastjson.JSON;
import com.nfe.h5videoactionsync.entity.SessionInfoEntity;
import com.nfe.h5videoactionsync.entity.dto.MessageDto;
import com.nfe.h5videoactionsync.enums.ActionType;
import com.nfe.h5videoactionsync.enums.MessageType;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;

import javax.websocket.*;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Description:
 *
 * @author nfe-w
 * @date 2021-02-04 14:24
 */
@Slf4j
@Component
@ServerEndpoint("/connection/{connectionKey}/{userName}")
public class WebSocketClient {

    /**
     * mapping relationship between key and session
     */
    private static final Map<String, List<Session>> CONNECTION_SESSION_MAP = new ConcurrentHashMap<>();

    /**
     * mapping relationship between session and session-info
     */
    private static final Map<Session, SessionInfoEntity> SESSION_INFO_MAP = new ConcurrentHashMap<>();

    @OnOpen
    public void onOpen(Session session, @PathParam("connectionKey") String connectionKey, @PathParam("userName") String userName) {
        if (CONNECTION_SESSION_MAP.containsKey(connectionKey)) {
            CONNECTION_SESSION_MAP.get(connectionKey).add(session);
        } else {
            List<Session> sessionList = new ArrayList<>();
            sessionList.add(session);
            CONNECTION_SESSION_MAP.put(connectionKey, sessionList);
        }
        SESSION_INFO_MAP.put(session, new SessionInfoEntity(connectionKey, userName, LocalDateTime.now()));

        this.sendMessage(session, MessageDto.builder().messageType(MessageType.ACTION).actionType(ActionType.CONNECT).build());
        this.sendMessageToAllPeopleWithKey(connectionKey, session, MessageDto.builder().messageType(MessageType.MSG).message(userName + "已上线").build());
    }

    @OnClose
    public void onClose(Session session) {
        SessionInfoEntity sessionInfoEntity = SESSION_INFO_MAP.get(session);
        if (sessionInfoEntity != null) {
            SESSION_INFO_MAP.remove(session);

            String connectionKey = sessionInfoEntity.getConnectionKey();
            String userName = sessionInfoEntity.getUserName();
            if (connectionKey != null && CONNECTION_SESSION_MAP.containsKey(connectionKey)) {
                CONNECTION_SESSION_MAP.get(connectionKey).remove(session);

                this.sendMessageToAllPeopleWithKey(connectionKey, session, MessageDto.builder().messageType(MessageType.MSG).message(userName + "已下线").build());
            }
        }
    }

    @OnError
    public void onError(Session ignoredSession, Throwable error) {
        log.error("【H5VideoActionSync】{}", error.getMessage(), error);
    }

    @OnMessage
    public void onMessage(Session session, String message) {
        if (StringUtils.isEmpty(message)) {
            return;
        }
        SessionInfoEntity sessionInfoEntity = SESSION_INFO_MAP.get(session);
        if (sessionInfoEntity == null) {
            return;
        }
        String connectionKey = sessionInfoEntity.getConnectionKey();
        if (!CONNECTION_SESSION_MAP.containsKey(connectionKey)) {
            return;
        }

        MessageDto messageDto = JSON.parseObject(message, MessageDto.class);
        this.sendMessageToAllPeopleWithKey(connectionKey, session, messageDto);
    }

    /**
     * Send a message to the specified session
     *
     * @param targetSession target session
     * @param messageDto    message content
     */
    private void sendMessage(Session targetSession, MessageDto messageDto) {
        try {
            if (targetSession.isOpen()) {
                targetSession.getBasicRemote().sendText(JSON.toJSONString(messageDto));
            }
        } catch (IOException e) {
            log.error("【H5VideoActionSync】failed to send message! targetSession: {}, messageDto: {}", targetSession, messageDto.toString(), e);
        }
    }

    /**
     * Broadcast messages to the session under the specified key (exclude yourself)
     *
     * @param connectionKey connection key
     * @param mySession     current user's session
     * @param messageDto    message content
     */
    private void sendMessageToAllPeopleWithKey(String connectionKey, Session mySession, MessageDto messageDto) {
        List<Session> sessionList = CONNECTION_SESSION_MAP.get(connectionKey);
        sessionList.forEach(targetSession -> {
            if (!targetSession.equals(mySession)) {
                sendMessage(targetSession, messageDto);
            }
        });
        log.debug("【H5VideoActionSync】connectionKey: {}, messageDto: {}", connectionKey, messageDto.toString());
    }
}
