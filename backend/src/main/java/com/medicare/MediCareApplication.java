package com.medicare;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * MediCare backend entry point.
 *
 * Spring Boot is used purely as the HTTP/REST runtime for the documented layered
 * architecture: Controller -> Service -> Repository -> MongoConnection -> MongoDB Atlas.
 */
@SpringBootApplication
public class MediCareApplication {

    public static void main(String[] args) {
        SpringApplication.run(MediCareApplication.class, args);
    }
}
