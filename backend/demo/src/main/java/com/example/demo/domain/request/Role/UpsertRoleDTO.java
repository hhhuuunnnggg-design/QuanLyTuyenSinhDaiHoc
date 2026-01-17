package com.example.demo.domain.request.Role;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpsertRoleDTO {
    @NotBlank(message = "Tên không được để trống")
    String name;

    @NotBlank(message = "Mô tả không được để trống")
    String description;

    Boolean active = true;

    @NotEmpty(message = "Danh sách quyền không được rỗng")
    List<Long> permissionIds;
}
