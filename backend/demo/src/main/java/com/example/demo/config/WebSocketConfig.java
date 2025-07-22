package com.example.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;

@Configuration // đánh dấu đây là class cấu hình Spring., quét tất cả các anotation
@EnableWebSocketMessageBroker
// bật chức năng WebSocket với STOMP protocol, để sử dụng WebSocket trong Spring
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // đăng ký endpoint /ws để kết nối WebSocket
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // cho phép tất cả các origin
                .withSockJS()
                // hỗ trợ fallback nếu trình duyệt không hỗ trợ WebSocket → tự động dùng HTTP
                // polling
                .setClientLibraryUrl("https://cdn.jsdelivr.net/npm/sockjs-client@1/dist/sockjs.min.js");
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic"); // hững message gửi tới /topic/xyz sẽ được phân phối tới tất cả client
                                               // subscribe tới topic đó.
        registry.setApplicationDestinationPrefixes("/app"); // định nghĩa prefix cho các message gửi tới server.
    }

    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registration) {
        registration.setMessageSizeLimit(8192) // Max message size
                .setSendBufferSizeLimit(512 * 1024) // Max buffer size
                .setSendTimeLimit(20000); // Max send time
    }
}