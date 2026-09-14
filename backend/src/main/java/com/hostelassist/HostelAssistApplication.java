package com.hostelassist;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class HostelAssistApplication {

    public static void main(String[] args) {
        SpringApplication.run(HostelAssistApplication.class, args);
        System.out.println("=================================================");
        System.out.println(" HOSTELASSIST Spring Boot Backend Active on 8080");
        System.out.println(" Connected to MySQL persistence");
        System.out.println("=================================================");
    }
}
