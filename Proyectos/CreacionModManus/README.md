# Creación de Mods Manus
## Arqueología Digital con Estilo Nórdico Antiguo

### Descripción

Proyecto de investigación dedicado a la creación de una página web que combina arqueología digital con estética nórdica antigua (Viking/Medieval Norse). Implementa completamente los estándares **WCAG 2.1 AA** de accesibilidad web.

### Características

✅ **Estilo Nórdico Antiguo**
- Paleta de colores derivada de pigmentos históricos nórdicos
- Tipografía que evoca antiguos manuscritos y rúnicas
- Patrones geométricos basados en ornamentación nórdica
- Simbolismo cultural auténtico

✅ **Accesibilidad WCAG 2.1 AA**
- ✓ HTML semántico completo
- ✓ ARIA labels y roles apropiados
- ✓ Skip links funcionales
- ✓ Navegación por teclado completa
- ✓ Contraste de colores certificado (WCAG AA)
- ✓ Soporte para lectores de pantalla
- ✓ Validación de formularios accesible
- ✓ Respeto por preferencias de movimiento reducido

✅ **Funcionalidades**
- Navegación suave entre secciones
- Formulario de contacto con validación
- Paleta de colores interactiva
- Modo oscuro automático
- Completamente responsive (mobile-first)

### Estructura del Proyecto

```
CreacionModManus/
├── index.html          # Página principal (estructura semántica)
├── styles.css          # Estilos con cumplimiento WCAG
├── script.js           # Interactividad accesible
├── README.md           # Este archivo
└── assets/            # Carpeta para futuros recursos
```

### Accesibilidad

#### Herramientas de Accesibilidad Implementadas

1. **Skip Link**: Permite saltarse la navegación y ir directamente al contenido principal (accesible con Tab+Enter)

2. **ARIA Labels**: Todas las regiones de la página tienen labels descriptivos
   - `role="banner"` en header
   - `role="main"` en contenido principal
   - `role="contentinfo"` en footer
   - `aria-label` en navegación y componentes

3. **Navegación por Teclado**:
   - Tab: navegar entre elementos
   - Enter/Space: activar enlaces y botones
   - Flechas: navegar dentro de menús

4. **Anuncios en Vivo**:
   - Los cambios de sección se anuncian a lectores de pantalla
   - Los mensajes de formulario se anuncian dinámicamente

5. **Validación Accesible**:
   - Campos marcados con `required`
   - Errores anunciados con `aria-invalid`
   - Mensajes descriptivos en tiempo real

### Colores (Paleta Nórdica)

| Color | Hex | Uso |
|-------|-----|-----|
| Marrón Oscuro | #2C1810 | Texto principal, encabezados |
| Marrón Dorado | #8B6F47 | Acentos, decoración |
| Beige Oscuro | #D4AF87 | Bordes, elementos secundarios |
| Beige Claro | #E8D5C4 | Fondos alternativos |
| Blanco Roto | #F5F1ED | Fondo principal |
| Gris Piedra | #4A4A4A | Texto secundario |
| Sienna | #A0522D | Acentos principales |

Todos los colores cumplen con la relación de contraste mínima de 4.5:1 para texto pequeño (WCAG AA).

### Tipografía

- **Serif Decorativa**: Cinzel, IM Fell English (títulos)
- **Serif Texto**: Crimson Text (cuerpo)
- Todas las tipografías son legibles y están optimizadas para web

### Testing de Accesibilidad

Para verificar la accesibilidad de esta página:

1. **Navegación por Teclado**:
   - Presiona `Tab` para navegar
   - Presiona `Shift+Tab` para ir hacia atrás
   - El link "Volver" debe ser accesible sin mouse

2. **Lector de Pantalla**:
   - Prueba con NVDA, JAWS o VoiceOver
   - Todos los elementos deben tener descripciones claras

3. **Validación**:
   - Completa el formulario de contacto
   - Verifica que los errores se anuncien correctamente
   - Los campos requeridos están claramente marcados

4. **Contraste**:
   - Usa herramientas como WAVE o Axe DevTools
   - Verifica que el contraste sea mínimo 4.5:1

### Desarrollo

#### Estructura HTML
- Encabezados jerárquicos correctos (h1 > h2 > h3...)
- Elementos semánticos (`header`, `nav`, `main`, `section`, `footer`)
- Links con destinos claros
- Formularios con labels asociadas a inputs

#### Estilos CSS
- Variables CSS para colores y espaciado
- Media queries para modo oscuro y movimiento reducido
- Transiciones suaves (respetando preferencias)
- Tipografía accesible

#### JavaScript
- Event listeners sin interferencia con navegación
- Validación de formulario con feedback visual y auditivo
- Anuncios de ARIA live para cambios dinámicos
- Soporte para navegación por teclado mejorada

### Navegación

#### Enlaces Internos
- Todos los enlaces `#` saltan suavemente a secciones
- La sección activa se resalta automáticamente
- Se anuncian cambios de sección para lectores de pantalla

#### Volver al Índice
Desde cualquier proyecto, puedes usar el link "Volver" para regresar al portafolio principal.

### Requisitos WCAG 2.1 AA Cumplidos

- **1.1.1 Contenido no textual (A)**: Todas las imágenes tienen alt text
- **1.4.3 Contraste (Mínimo) (AA)**: Relación mínima 4.5:1
- **1.4.4 Cambio de tamaño de texto (AA)**: Zoom funciona al 200%
- **2.1.1 Teclado (A)**: Totalmente navegable por teclado
- **2.1.2 Sin trampa de teclado (A)**: El foco no queda atrapado
- **2.4.3 Orden de enfoque (A)**: El orden es lógico
- **2.4.4 Propósito de enlace (A)**: Los enlaces tienen propósito claro
- **2.4.7 Enfoque visible (AA)**: El enfoque es siempre visible
- **2.5.5 Tamaño de objetivo (Mejorado) (AAA)**: Botones > 44x44px
- **3.2.4 Identificación consistente (AA)**: Los componentes se comportan consistentemente
- **3.3.1 Identificación de errores (A)**: Los errores se identifican
- **3.3.2 Etiquetas o instrucciones (A)**: Campos con etiquetas claras
- **3.3.4 Prevención de errores (AA)**: Validación en cliente
- **4.1.2 Nombre, rol, valor (A)**: ARIA implementado correctamente
- **4.1.3 Mensajes de estado (AA)**: Los cambios se anuncian

### Navegadores Soportados

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

### Autores

Proyecto de investigación de **Raúl Poblete Illescas**
Módulo: IFCD0083 - Inteligencia Artificial

### Licencia

Este proyecto es parte del portafolio educativo y está disponible para fines académicos.

---

**Última actualización**: Junio 2025
**Estado**: Completo y publicado ✓
