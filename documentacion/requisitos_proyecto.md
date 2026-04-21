# Definición del Proyecto: byTokioDemo001

## Descripción General
Sitio web integral para gestión de turnos, venta de productos y atención al cliente automatizada.

## Características Principales

### 1. Sistema de Turnos
- **Integración con Google Calendar**: Mostrar disponibilidad en tiempo real.
- **Reserva Online**: Permitir a los usuarios reservar slots disponibles.

### 2. E-commerce
- **Catálogo de Productos**: Galería de imágenes y descripciones.
- **Carrito de Compras**: Gestión de productos seleccionados para compra.

### 3. Gestión de Usuarios y Roles
- **Área de Login**: Autenticación gestionada por Supabase.
- **Niveles de Acceso**:
    - `Superadmin`: Control total del sistema y configuraciones.
    - `Admin`: Gestión de turnos y productos.
    - `Cliente`: Historial de reservas y compras.
    - `Usuario`: Acceso básico/visitante registrado.

### 4. Comunicación y Automatización
- **Formulario de Consulta**: Envío de correos y registro de leads.
- **Chatbot con IA**: Asistente virtual para resolver dudas frecuentes y asistir en la navegación.
- **Integración con n8n**: Orquestación de flujos de trabajo y automatizaciones entre servicios.

### 5. Registro de Clientes
- Formulario detallado para captura de datos y creación de perfiles.

## Stack Tecnológico Propuesto
- **Frontend**: React + Vite (A estética Premium con `frontend-design`).
- **Backend/Base de Datos**: Supabase (Auth, DB, Storage).
- **Automatización**: n8n.
- **APIs Externas**: Google Calendar API.
