package com.nfe.h5videoactionsync.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.server.standard.ServerEndpointExporter;

/**
 * Description:
 *
 * @author nfe-w
 * @date 2021-02-04 14:25
 */

@Configuration
public class WebSocketConfiguration {

    /**
     * use spring IOC to manage webSocket endpoint
     *
     * @return ServerEndpointExporter
     */
    @Bean
    public ServerEndpointExporter serverEndpointExporter() {
        return new ServerEndpointExporter();
    }
}
