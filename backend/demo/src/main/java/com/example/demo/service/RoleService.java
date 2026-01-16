package com.example.demo.service;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import com.example.demo.domain.Role;
import com.example.demo.domain.dto.ResultPaginationDTO;
import com.example.demo.domain.request.Role.UpsertRole;
import com.example.demo.util.error.IdInvalidException;

public interface RoleService {

    boolean existByName(String name);

    Role create(Role r);

    Role createFromDTO(UpsertRole dto) throws IdInvalidException;

    Role fetchById(long id);

    Role updateRole(Role r);

    Role updateRoleFromDTO(long id, UpsertRole dto) throws IdInvalidException;

    void delete(long id) throws IdInvalidException;

    ResultPaginationDTO getRoles(Specification<Role> spec, Pageable pageable);
}
