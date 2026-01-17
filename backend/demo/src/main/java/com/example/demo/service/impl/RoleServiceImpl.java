package com.example.demo.service.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.example.demo.domain.Permission;
import com.example.demo.domain.Role;
import com.example.demo.domain.dto.ResultPaginationDTO;
import com.example.demo.domain.request.Role.UpsertRoleDTO;
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
        return roleRepository.existsByName(name);
    }

    @Override
    public Role createFromDTO(UpsertRoleDTO dto) throws IdInvalidException {
        validateRoleNameNotExists(dto.getName());

        Role newRole = mapDtoToRole(dto);
        newRole.setPermissions(getValidatedPermissions(dto.getPermissionIds()));

        return roleRepository.save(newRole);
    }

    @Override
    public Role fetchById(long id) {
        return roleRepository.findById(id).orElse(null);
    }

    @Override
    public Role updateRoleFromDTO(long id, UpsertRoleDTO dto) throws IdInvalidException {
        Role existingRole = fetchById(id);
        if (existingRole == null) {
            throw new IdInvalidException("Role với id = " + id + " không tồn tại");
        }

        validateRoleNameForUpdate(existingRole.getName(), dto.getName());

        updateRoleFromDto(existingRole, dto);
        existingRole.setPermissions(getValidatedPermissions(dto.getPermissionIds()));

        return roleRepository.save(existingRole);
    }

    @Override
    public void delete(long id) throws IdInvalidException {
        if (!roleRepository.existsById(id)) {
            throw new IdInvalidException("Role với id = " + id + " không tồn tại");
        }
        roleRepository.deleteById(id);
    }

    @Override
    public ResultPaginationDTO getRoles(Specification<Role> spec, Pageable pageable) {
        Page<Role> page = roleRepository.findAll(spec, pageable);

        ResultPaginationDTO result = new ResultPaginationDTO();
        ResultPaginationDTO.Meta meta = new ResultPaginationDTO.Meta();

        meta.setPage(pageable.getPageNumber() + 1);
        meta.setPageSize(pageable.getPageSize());
        meta.setPages(page.getTotalPages());
        meta.setTotal(page.getTotalElements());

        result.setMeta(meta);
        result.setResult(page.getContent());

        return result;
    }

    // Private helper methods

    private void validateRoleNameNotExists(String name) throws IdInvalidException {
        if (existByName(name)) {
            throw new IdInvalidException("Role với name = " + name + " đã tồn tại");
        }
    }

    private void validateRoleNameForUpdate(String currentName, String newName) throws IdInvalidException {
        if (!currentName.equals(newName) && existByName(newName)) {
            throw new IdInvalidException("Role với name = " + newName + " đã tồn tại");
        }
    }

    private Role mapDtoToRole(UpsertRoleDTO dto) {
        Role role = new Role();
        role.setName(dto.getName());
        role.setDescription(dto.getDescription());
        role.setActive(dto.getActive() != null ? dto.getActive() : true);
        return role;
    }

    private void updateRoleFromDto(Role role, UpsertRoleDTO dto) {
        role.setName(dto.getName());
        role.setDescription(dto.getDescription());
        role.setActive(dto.getActive() != null ? dto.getActive() : true);
    }

    private List<Permission> getValidatedPermissions(List<Long> permissionIds) throws IdInvalidException {
        if (permissionIds == null || permissionIds.isEmpty()) {
            return new ArrayList<>();
        }

        List<Permission> permissions = permissionRepository.findByIdIn(permissionIds);

        if (permissions.size() != permissionIds.size()) {
            throw new IdInvalidException("Một hoặc nhiều permissionId không tồn tại");
        }

        return permissions;
    }
}
