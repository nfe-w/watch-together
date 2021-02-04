package com.nfe.h5videoactionsync.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Description:
 *
 * @author nfe-w
 * @date 2021-02-04 14:58
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SessionInfoEntity {

    /**
     * connection key
     */
    private String connectionKey;

    /**
     * username
     */
    private String userName;

    /**
     * user login time
     */
    private LocalDateTime loginTime;
}
