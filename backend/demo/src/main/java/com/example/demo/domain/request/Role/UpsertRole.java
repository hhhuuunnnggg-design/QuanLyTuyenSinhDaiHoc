package com.example.demo.domain.request.Role;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpsertRole {
    @NotBlank(message = "Tên không được để trống")
    String name;

    @NotBlank(message = "Mô tả không được để trống")
    String description;

    @NotNull(message = "Trạng thái không được để trống")
    boolean active;

    @Valid
    List<Permission> permissions;

    @Data
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class Permission {

        Long id;

        @NotBlank(message = "Tên không được để trống")
        String name;

        @NotBlank(message = "apiPath không được để trống")
        String apiPath;

        @NotBlank(message = "method không được để trống")
        String method;

        @NotBlank(message = "module không được để trống")
        String module;

    }

}
