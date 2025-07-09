package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.domain.User;
import com.example.demo.domain.response.ResUserDTO;
import com.example.demo.service.UserServices;
import com.example.demo.util.annotation.ApiMessage;
import com.example.demo.util.error.IdInvalidException;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping(value = "/api/v1/users")
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserController {

    private UserServices userService;
    private PasswordEncoder passwordEncoder;

    // tìm 1 giá trị
    @GetMapping("/{id}")
    @ApiMessage("fetch user by id")
    public ResponseEntity<ResUserDTO> getUserById(@PathVariable("id") Long id) throws IdInvalidException {
        User fetUser = this.userService.handleFindByIdUser(id);
        if (fetUser == null) {
            throw new IdInvalidException("User với id = " + id + " không tồn tại");
        }

        return ResponseEntity.ok(this.userService.convertToResUserDTO(fetUser));
    }

}
