package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.repository.NotificationRepository;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserServices userService;

    // public Notification createNotification(Long senderId, Long receiverId, String
    // content, Post post, Share share,
    // NotificationType type) {
    // User sender = userService.handleFindByIdUser(senderId);
    // User receiver = userService.handleFindByIdUser(receiverId);

    // if (sender == null || receiver == null) {
    // return null;
    // }

    // Notification notification = new Notification();
    // notification.setContent(content);
    // notification.setSender(sender);
    // notification.setReceiver(receiver);
    // notification.setPost(post);
    // notification.setShare(share);
    // notification.setType(type);
    // notification.setIsRead(false);
    // notification.setCreatedAt(LocalDateTime.now());

    // return notificationRepository.save(notification);
    // }
}
