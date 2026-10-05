package com.pidegas;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("dev")
class PideGasContextoTest {

    @Test
    void contextLoads() {
        // Verifica que Spring Boot, JPA, Flyway (12 migraciones) y la conexión a PostgreSQL/PostGIS inicialicen correctamente
    }
}
