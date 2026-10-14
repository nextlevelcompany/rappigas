package com.pidegas.modulos.soporte.controlador;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/archivos")
@Tag(name = "Archivos y Evidencias", description = "Subida y descarga de fotos de balones y comprobantes para tickets")
public class ArchivosControlador {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(ArchivosControlador.class);
    private final Path directorioSubidas;

    public ArchivosControlador(@org.springframework.beans.factory.annotation.Value("${app.storage.path:uploads}") String rutaConfigurada) {
        this.directorioSubidas = Paths.get(rutaConfigurada).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.directorioSubidas);
        } catch (Exception e) {
            log.warn("No se pudo inicializar el directorio de subidas '{}': {}", this.directorioSubidas, e.getMessage());
        }
    }

    @PostMapping(value = "/subir", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Subir archivo o foto de evidencia", description = "Almacena fotos de balones, válvulas o comprobantes y retorna la URL pública.")
    public ResponseEntity<Map<String, String>> subirArchivo(@RequestParam("archivo") MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "El archivo no puede estar vacío"));
        }

        String nombreOriginal = archivo.getOriginalFilename();
        String extension = "";
        if (nombreOriginal != null && nombreOriginal.contains(".")) {
            extension = nombreOriginal.substring(nombreOriginal.lastIndexOf("."));
        }

        String nombreGuardado = UUID.randomUUID() + extension;
        Path destino = this.directorioSubidas.resolve(nombreGuardado);

        try {
            Files.createDirectories(this.directorioSubidas);
            Files.copy(archivo.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);
            String urlDescarga = "/api/v1/archivos/ver/" + nombreGuardado;
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "nombreArchivo", nombreGuardado,
                    "url", urlDescarga,
                    "tamano", String.valueOf(archivo.getSize())
            ));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensaje", "Error al guardar el archivo: " + e.getMessage()));
        }
    }

    @GetMapping("/ver/{nombreArchivo}")
    @Operation(summary = "Visualizar o descargar archivo adjunto", description = "Retorna el archivo binario almacenado.")
    public ResponseEntity<Resource> verArchivo(@PathVariable String nombreArchivo) {
        try {
            Path rutaArchivo = this.directorioSubidas.resolve(nombreArchivo).normalize();
            Resource recurso = new UrlResource(rutaArchivo.toUri());

            if (!recurso.exists() || !recurso.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = Files.probeContentType(rutaArchivo);
            if (contentType == null) {
                contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + recurso.getFilename() + "\"")
                    .body(recurso);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
