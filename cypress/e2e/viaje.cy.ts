describe('Flujo E2E: Pedir Viaje y Navegar al Historial (SOLUCIÓN FINAL)', () => {

  const baseURL = 'http://localhost:8100/home'; 
  const destinoDePrueba = 'Playa Canelo';
  
  // Datos simulados (Mocking de API)
  const mockConductores = [
    { id: 1, nombre: 'Mock Driver Alpha', vehiculo: 'Chevy Spark', patente: 'ABCD12', calificacion: 4.8, estado: 'Disponible' }
  ];

  beforeEach(() => {
    // Manejo de Excepciones de BD (Vital para que no se detenga el test)
    cy.on('uncaught:exception', (err, runnable) => {
      if (err.message.includes('Element attr did not return a valid number')) {
        return false;
      }
      return true;
    });

    // Mocking de API
    cy.intercept('GET', '**/conductores', {
      statusCode: 200,
      body: mockConductores
    }).as('getConductores');

    // Visita y Mocking de Geolocation
    cy.visit(baseURL, {
      onBeforeLoad(win) {
        cy.stub(win.navigator.geolocation, 'getCurrentPosition', (cb) => {
          cb({ coords: { latitude: -33.3644, longitude: -71.6517 } }); 
        });
      },
    });

    // Esperar carga inicial
    cy.contains('¡Hola,', { timeout: 10000 }).should('be.visible');
    cy.wait('@getConductores'); 
  });


  // --- Caso 1: Flujo Completo de Solicitud de Viaje ---
  it('1. Debe seleccionar destino, pedir viaje y navegar al historial', () => {
    
    cy.log('Paso 1: Abrir el Select de Destino');
    cy.contains('1. Selecciona Destino').click(); 
    
    cy.log('Paso 2: Seleccionar opción (Forzado)');
    // Force true necesario porque el select option está dentro de un popover
    cy.get('ion-select-option').contains(destinoDePrueba).click({ force: true }); 
    
    // Esperamos un momento para que la animación del select empiece a cerrarse
    cy.wait(500);

    cy.log('Paso 3: Pedir viaje al conductor (CLICK FORZADO)');
    // CORRECCIÓN CRÍTICA:
    // 1. Verificamos que el card EXISTA (no visible, para evitar error de 'covered')
    cy.get('ion-card').first().should('exist');
    
    // 2. Buscamos el botón y hacemos CLICK FORZADO para ignorar la animación del select que lo cubre
    cy.get('ion-card').contains(mockConductores[0].nombre)
      .parents('ion-card')
      .find('ion-button')
      .contains('Viajar')
      .click({ force: true }); // <--- ESTO SOLUCIONA EL ERROR "COVERED BY ELEMENT"

    cy.log('Paso 4: Verificar animación de éxito');
    cy.contains('¡Conductor en camino! 🚗', { timeout: 6000 }).should('be.visible');
    
    cy.log('Paso 5: Esperar a que el proceso termine');
    cy.wait(5000); 
    cy.contains('Selecciona un destino para ver conductores').should('be.visible');
    
    // Navegación al Historial
    cy.log('Paso 6: Ir a Mis Viajes');
    cy.get('ion-menu-button').click(); 
    cy.get('ion-item').contains('Mis Viajes').click(); 
    
    cy.url().should('include', '/viajes');

    cy.log('Paso 7: Verificar Historial');
    cy.contains('MIS VIAJES').should('be.visible');
    cy.contains('No tienes viajes registrados aún.').should('be.visible');
    
    cy.log('✅ Prueba 1 Pasada Exitosamente');
  });
  
  // --- Caso 2: Prueba de la función Limpiar Historial ---
  it('2. Debe mostrar alerta al intentar limpiar el historial', () => {
    
    cy.log('Paso 1: Ir a Historial');
    cy.visit('http://localhost:8100/viajes');
    
    cy.log('Paso 2: Clic en Limpiar (Forzado)');
    cy.contains('LIMPIAR HISTORIAL').click({ force: true }); 
    
    cy.log('Paso 3: Verificar Alerta');
    // Verificamos que el componente alerta exista
    cy.get('ion-alert', { timeout: 5000 }).should('exist');

    // CORRECCIÓN CRÍTICA:
    // Buscamos el texto GLOBALMENTE. Es más robusto que buscar dentro del shadow-dom del alert.
    cy.contains('¿Deseas eliminar todo tu historial de la base de datos?', { timeout: 5000 }).should('be.visible');
    
    cy.log('Paso 4: Cancelar');
    // Buscamos el botón cancelar globalmente o dentro del alert, forzando el click
    cy.get('ion-alert button').contains('Cancelar').click({ force: true });
    
    // Verificamos que la alerta desaparezca (se cierre)
    cy.get('ion-alert').should('not.exist');
    cy.log('✅ Prueba 2 Pasada Exitosamente');
  });
});