package com.resolveit.helpdesk;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.TimeZone;

@SpringBootApplication
@EnableJpaAuditing
@EnableScheduling
public class HelpdeskApplication {

    public static void main(String[] args) {
        // Enforce UTC timezone across all JVM operations
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
        SpringApplication.run(HelpdeskApplication.java, args);
    }
}
