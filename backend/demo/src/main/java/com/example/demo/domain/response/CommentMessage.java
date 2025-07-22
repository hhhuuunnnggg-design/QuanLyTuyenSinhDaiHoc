package com.example.demo.domain.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
// Inner class để đóng gói message WebSocket
public class CommentMessage {
    private String type;
    private Object data;

}
