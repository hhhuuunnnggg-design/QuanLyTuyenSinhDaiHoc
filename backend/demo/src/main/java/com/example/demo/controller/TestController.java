// package com.example.demo.controller;

// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.web.bind.annotation.RestController;

// @RestController
// public class TestController {

// @Value("${spring.datasource.url}")
// private String dbUrl;

// @Value("${test_123}")
// private String test123;

// @GetMapping("/test-env")
// public String test() {

// return dbUrl;
// }

// @GetMapping("/test-test123")
// public String testTest123() {
// return test123;
// }
// }