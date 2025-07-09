package com.example.demo.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.domain.User;
import com.example.demo.domain.response.ResCreateUserDTO;
import com.example.demo.domain.response.ResUserDTO;
import com.example.demo.repository.UserServiceRepository;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE)
@AllArgsConstructor
public class UserServices {
    @Autowired
    UserServiceRepository userServiceRepository;

    public User handleGetUserByUsernames(String username) {
        User user = this.userServiceRepository.findByEmail(username);
        if (user == null) {
            throw new RuntimeException("User với email " + username + " không tồn tại");
        }
        if (user.isBlocked()) {
            throw new RuntimeException("Tài khoản đã bị khóa. Vui lòng liên hệ admin.");
        }
        return user;
    }

    public User handleGetUserByUsername(String username) {
        return this.userServiceRepository.findByEmail(username);
    }

    // Cập nhật token
    public void updateUserToken(String token, String email) {
        User currentUser = this.handleGetUserByUsername(email);
        if (currentUser != null) {
            currentUser.setRefreshToken(token);
            this.userServiceRepository.save(currentUser);
        }
    }

    public User getUserByRefreshTokenAndEmail(String token, String email) {
        return this.userServiceRepository.findByRefreshTokenAndEmail(token, email);
    }

    public boolean isEmailExist(String email) {
        return this.userServiceRepository.existsByEmail(email);
    }

    public User handleCreateUser(User user) {
        return this.userServiceRepository.save(user);
    }

    public ResCreateUserDTO convertToResCreateUserDTO(User user) {
        ResCreateUserDTO rs = new ResCreateUserDTO();
        rs.setId(user.getId());
        rs.setEmail(user.getEmail());
        rs.setGender(user.getGender());
        rs.setFullName(user.getFirstName() + " " + user.getLastName());
        rs.setCreatedAt(user.getCreatedAt());
        return rs;
    }

    // tìm 1 giá trị
    public User handleFindByIdUser(Long id) {
        Optional<User> UserOption = this.userServiceRepository.findById(id);
        if (UserOption.isPresent()) {
            return UserOption.get();
        }
        return null;
    }

    public ResUserDTO convertToResUserDTO(User user) {
        return ResUserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .avatar(user.getAvatar())
                .coverPhoto(user.getCoverPhoto())
                .fullname(user.getFirstName() + " " + user.getLastName())
                .dateOfBirth(user.getDateOfBirth())
                .gender(user.getGender())
                .work(user.getWork())
                .education(user.getEducation())
                .currentCity(user.getCurrent_city())
                .hometown(user.getHometown())
                .bio(user.getBio())
                .isAdmin(user.getIs_admin())
                // .isBlocked(user.isBlocked())
                .build();
    }

}
