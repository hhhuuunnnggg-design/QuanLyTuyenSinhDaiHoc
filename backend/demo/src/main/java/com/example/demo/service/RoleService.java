package com.example.demo.service;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import com.example.demo.domain.Role;
import com.example.demo.domain.dto.ResultPaginationDTO;
import com.example.demo.domain.request.Role.UpsertRoleDTO;
import com.example.demo.util.error.IdInvalidException;

public interface RoleService {

    boolean existByName(String name);

    Role createFromDTO(UpsertRoleDTO dto) throws IdInvalidException;

    Role fetchById(long id);

    Role updateRoleFromDTO(long id, UpsertRoleDTO dto) throws IdInvalidException;

    void delete(long id) throws IdInvalidException;

    ResultPaginationDTO getRoles(Specification<Role> spec, Pageable pageable);
}
