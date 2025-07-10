package com.example.demo.domain.response;

import java.time.Instant;
import java.time.LocalDate;

import com.example.demo.domain.Enum.genderEnum;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ResUserDTO {
    Long id;
    String email;
    String avatar;
    String coverPhoto;
    String fullname;
    LocalDate dateOfBirth;
    genderEnum gender;
    String work;
    String education;
    String currentCity;
    String hometown;
    String bio;
    Instant createdAt;
    boolean isAdmin;
    boolean isBlocked;
    // có 16 field
    RoleUser role;

    @Data
    @AllArgsConstructor
    @Builder
    @NoArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class RoleUser {
        long id;
        String name;
    }

}
