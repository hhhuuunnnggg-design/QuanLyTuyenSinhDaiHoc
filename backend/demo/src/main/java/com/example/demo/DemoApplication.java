package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
public class DemoApplication {

    public static void main(String[] args) {

        Dotenv dotenv = Dotenv.configure()
                .directory("./backend/demo") // thư mục gốc project
                .filename(".env") // tên file
                .ignoreIfMissing()
                .load();

        dotenv.entries()
                .forEach(e -> System.setProperty(e.getKey(), e.getValue()));

        System.out.println("DB_URL from dotenv: " + dotenv.get("DB_URL"));

        SpringApplication.run(DemoApplication.class, args);
    }
}
