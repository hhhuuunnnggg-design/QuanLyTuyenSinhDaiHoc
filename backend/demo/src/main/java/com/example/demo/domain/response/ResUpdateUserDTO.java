package com.example.demo.domain.response;

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
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ResUpdateUserDTO {

    String email;
    String fullname;
    String avatar;
    String coverPhoto;
    LocalDate dateOfBirth;
    genderEnum gender;
    String work; // Công việc hiện tại
    String education; // Học vấn
    String current_city; // nơi đang sống
    String hometown;
    String bio; // Mô tả ngắn gọn
}
