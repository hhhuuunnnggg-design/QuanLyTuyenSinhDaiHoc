package com.example.demo.service.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.example.demo.domain.Permission;
import com.example.demo.domain.Role;
import com.example.demo.domain.dto.ResultPaginationDTO;
import com.example.demo.domain.request.Role.UpsertRole;
import com.example.demo.repository.PermissionRepository;
import com.example.demo.repository.RoleRepository;
import com.example.demo.service.RoleService;
import com.example.demo.util.error.IdInvalidException;

@Service
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    public RoleServiceImpl(
            RoleRepository roleRepository,
            PermissionRepository permissionRepository) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
    }

    @Override
    public boolean existByName(String name) {
        return this.roleRepository.existsByName(name);
    }

    @Override
    public Role create(Role r) {
        if (r.getPermissions() != null) {
            List<Long> reqPermissions = r.getPermissions()
                    .stream().map(x -> x.getId())
                    .collect(Collectors.toList());

            List<Permission> dbPermissions = this.permissionRepository.findByIdIn(reqPermissions);
            r.setPermissions(dbPermissions);
        }

        return this.roleRepository.save(r);
    }

    @Override
    public Role createFromDTO(UpsertRole dto) throws IdInvalidException {
        // check name
        if (this.existByName(dto.getName())) {
            throw new IdInvalidException("Role với name = " + dto.getName() + " đã tồn tại");
        }

        // Map từ DTO sang Entity
        Role newRole = new Role();
        newRole.setName(dto.getName());
        newRole.setDescription(dto.getDescription());
        newRole.setActive(dto.isActive());

        // Map permissions từ DTO sang Entity
        if (dto.getPermissions() != null && !dto.getPermissions().isEmpty()) {
            List<Permission> dbPermissions = new ArrayList<>();
            for (UpsertRole.Permission permissionDTO : dto.getPermissions()) {
                Permission permission = this.permissionRepository
                        .findByModuleAndApiPathAndMethod(
                                permissionDTO.getModule(),
                                permissionDTO.getApiPath(),
                                permissionDTO.getMethod())
                        .orElse(null);

                if (permission == null) {
                    throw new IdInvalidException(
                            "Permission với module=" + permissionDTO.getModule() +
                                    ", apiPath=" + permissionDTO.getApiPath() +
                                    ", method=" + permissionDTO.getMethod() + " không tồn tại");
                }
                dbPermissions.add(permission);
            }
            newRole.setPermissions(dbPermissions);
        }

        return this.roleRepository.save(newRole);
    }

    @Override
    public Role fetchById(long id) {
        Optional<Role> roleOptional = this.roleRepository.findById(id);
        if (roleOptional.isPresent())
            return roleOptional.get();
        return null;
    }

    @Override
    public Role updateRole(Role r) {
        Role roleDB = this.fetchById(r.getId());
        if (roleDB == null) {
            return null;
        }

        if (r.getPermissions() != null) {
            List<Long> reqPermissions = r.getPermissions()
                    .stream().map(x -> x.getId())
                    .collect(Collectors.toList());

            List<Permission> dbPermissions = this.permissionRepository.findByIdIn(reqPermissions);
            r.setPermissions(dbPermissions);
        }

        roleDB.setName(r.getName());
        roleDB.setDescription(r.getDescription());
        roleDB.setActive(r.isActive());
        roleDB.setPermissions(r.getPermissions());
        roleDB = this.roleRepository.save(roleDB);
        return roleDB;
    }

    @Override
    public Role updateRoleFromDTO(long id, UpsertRole dto) throws IdInvalidException {
        // check exist by id
        Role existingRole = this.fetchById(id);
        if (existingRole == null) {
            throw new IdInvalidException("Role với id = " + id + " không tồn tại");
        }

        // check name (chỉ check nếu có thay đổi)
        if (!existingRole.getName().equals(dto.getName()) && this.existByName(dto.getName())) {
            throw new IdInvalidException("Role với name = " + dto.getName() + " đã tồn tại");
        }

        // Map từ DTO sang Entity
        existingRole.setName(dto.getName());
        existingRole.setDescription(dto.getDescription());
        existingRole.setActive(dto.isActive());

        // Map permissions từ DTO sang Entity
        if (dto.getPermissions() != null) {
            List<Permission> dbPermissions = new ArrayList<>();
            for (UpsertRole.Permission permissionDTO : dto.getPermissions()) {
                Permission permission = this.permissionRepository
                        .findByModuleAndApiPathAndMethod(
                                permissionDTO.getModule(),
                                permissionDTO.getApiPath(),
                                permissionDTO.getMethod())
                        .orElse(null);

                if (permission == null) {
                    throw new IdInvalidException(
                            "Permission với module=" + permissionDTO.getModule() +
                                    ", apiPath=" + permissionDTO.getApiPath() +
                                    ", method=" + permissionDTO.getMethod() + " không tồn tại");
                }
                dbPermissions.add(permission);
            }
            existingRole.setPermissions(dbPermissions);
        }

        return this.roleRepository.save(existingRole);
    }

    @Override
    public void delete(long id) throws IdInvalidException {
        Role existingRole = this.fetchById(id);
        if (existingRole == null) {
            throw new IdInvalidException("Role với id = " + id + " không tồn tại");
        }
        this.roleRepository.deleteById(id);
    }

    @Override
    public ResultPaginationDTO getRoles(Specification<Role> spec, Pageable pageable) {
        Page<Role> pRole = this.roleRepository.findAll(spec, pageable);
        ResultPaginationDTO rs = new ResultPaginationDTO();
        ResultPaginationDTO.Meta mt = new ResultPaginationDTO.Meta();

        mt.setPage(pageable.getPageNumber() + 1);
        mt.setPageSize(pageable.getPageSize());

        mt.setPages(pRole.getTotalPages());
        mt.setTotal(pRole.getTotalElements());

        rs.setMeta(mt);
        rs.setResult(pRole.getContent());
        return rs;
    }
}
