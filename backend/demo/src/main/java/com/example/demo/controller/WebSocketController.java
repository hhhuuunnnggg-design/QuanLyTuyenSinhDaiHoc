package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.example.demo.domain.Notification;
import com.example.demo.service.UserServices;

@Controller
public class WebSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private UserServices userService;

    // Phương thức để gửi thông báo realtime khi có bài post mới
    public void notifyNewPost(Long receiverId, Notification notification) {
        messagingTemplate.convertAndSend("/topic/notifications/" + receiverId, notification);
    }

    public void notifyNewComment(Long userId, Notification notification) {
        // Gửi thông báo đến người dùng cụ thể
        messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/topic/notifications",
                notification);
    }

    public void broadcastComment(Long postId, Object message) {
        // Gửi thông báo đến tất cả người dùng đang xem bài post
        messagingTemplate.convertAndSend(
                "/topic/comments/" + postId,
                message);
    }

    // Phương thức để gửi thông báo realtime khi có like mới
    public void notifyNewLike(Long receiverId, Notification notification) {
        messagingTemplate.convertAndSend("/topic/notifications/" + receiverId, notification);
    }

    public void notifyNewShare(Long receiverId, Notification notification) {
        messagingTemplate.convertAndSend("/topic/notifications/" + receiverId, notification);
    }

}
