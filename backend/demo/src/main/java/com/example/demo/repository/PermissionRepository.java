package com.example.demo.repository;

import java.util.List;

import com.example.demo.domain.Permission;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long>,
        JpaSpecificationExecutor<Permission> {
    boolean existsByModuleAndApiPathAndMethod(String module, String apiPath, String method);

    List<Permission> findByIdIn(List<Long> id);
}
