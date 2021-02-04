package com.nfe.h5videoactionsync.entity.dto;

import com.nfe.h5videoactionsync.enums.ActionType;
import com.nfe.h5videoactionsync.enums.MessageType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Description:
 *
 * @author nfe-w
 * @date 2021-02-04 14:28
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageDto {

    /**
     * message type
     */
    private MessageType messageType;

    /**
     * message content
     */
    private String message;

    /**
     * action type
     */
    private ActionType actionType;

    /**
     * player current playing time
     */
    private Long videoTime;
}
