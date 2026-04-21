# Registro de Instalación - Proyecto bytokioarserver0001

Este documento registra la configuración de nuevas capacidades (skills) para el agente de IA en este workspace.

## Fecha: 21 de Abril de 2026

### 1. Instalación de Marketing Skills
- **Fuente**: [Marketingskills GitHub](https://github.com/coreyhaines31/marketingskills.git)
- **Ubicación**: `.agents/skills/` y `.agents/tools/`
- **Descripción**: Se han instalado 36 habilidades especializadas en marketing, SEO, CRO y estrategia de crecimiento.
- **Habilidades añadidas**:
    - `ab-test-setup`: Planificación de pruebas A/B.
    - `ad-creative`: Generación de copys para anuncios.
    - `ai-seo`: Optimización para motores de búsqueda de IA.
    - `analytics-tracking`: Configuración de seguimiento de métricas.
    - `community-marketing`: Estrategias de marketing en comunidades (nueva).
    - `copywriting`: Redacción persuasiva.
    - `page-cro`: Optimización de tasa de conversión en páginas.
    - `seo-audit`: Auditoría técnica y on-page de SEO.
    - *(Y otras 28 habilidades adicionales)*.

### 2. Instalación de Frontend Design Skill
- **Fuente**: [Claude Code Plugins (Anthropic)](https://github.com/anthropics/claude-code/tree/fe53778ed90fd971bf4ec78fa1f65ccf0536352f/plugins/frontend-design)
- **Ubicación**: `.agents/skills/frontend-design/`
- **Descripción**: Habilidad avanzada para crear interfaces de usuario de alta calidad, evitando estéticas genéricas de IA y priorizando la tipografía, el color y el movimiento de grado productivo.

### 3. Instalación de OpenCode AI
- **Método**: `npm i -g opencode-ai` (Instalación global)
- **Comando de inicio**: `opencode`
- **Descripción**: Herramienta de asistencia para el desarrollo y optimización de código mediante IA.

### 4. Conexión con Supabase
- **Estado**: Conectado.
- **Descripción**: Se ha establecido la conexión con Supabase para la gestión de base de datos y autenticación de la aplicación.

## Cómo Utilizar estas Skills
El agente de IA invocará estas habilidades automáticamente cuando detecte tareas relacionadas con el diseño frontend o estrategias de marketing. Puedes solicitar tareas específicas como:
- *"Optimiza el SEO de la página de inicio"*
- *"Diseña un dashboard con estética brutalista para la sección de administración"*
- *"Crea una secuencia de correos para recuperar carritos abandonados"*

---
*Documentación generada por Antigravity AI.*
