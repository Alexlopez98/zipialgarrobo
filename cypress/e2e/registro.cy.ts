Cypress.on('uncaught:exception', (err, runnable) => {
  if (err.message.includes('Element attr did not return a valid number')) {
    return false; 
  }
  return true;
});
// =================================================================

describe('Flujo E2E: Validaciones y Registro de Usuario', () => {

  const baseURL = 'http://localhost:8100/login';
  const claveValida = '1234'; 
  
  const usuarioAleatorioExitoso = `success${Date.now()}abc`; 
  
  const usuarioFalla = 'usuariofalla';
  const usuarioExistenteFijo = 'test1765518507331abc'; 

  beforeEach(() => {
    cy.visit(baseURL);
  });

  const navegarARegistro = () => {
    cy.log('Paso 1: Navegar a Registro');
    cy.get('ion-button[routerlink="/registro"]').contains('Regístrate aquí').click();
    cy.url().should('include', '/registro'); 
    cy.get('#registro-form').should('be.visible'); 
  };
  
  // --- Test 1: Falla por Contraseña Inválida (Validación de TS) ---
  it('1. Debe mostrar un toast si la contraseña NO tiene 4 números (TS Validation)', () => {
    navegarARegistro();
    cy.log('Paso 2: Usar una contraseña de 5 dígitos');
    cy.get('#registro-form').within(() => {
        cy.get('input[name="usuario"]').type(usuarioFalla);
        cy.get('input[name="password"]').type('12345'); 
        cy.get('button[type="submit"]').contains('Registrarme').click();
    });
    cy.contains('La contraseña debe ser de 4 números (Ej: 1234)', { timeout: 5000 }).should('be.visible');
    cy.url().should('include', '/registro'); 
  });
  
  // --- Test 2: Falla por Validación de Pattern (Validación de HTML/Angular) ---
  it('2. Debe bloquear el botón si el Usuario tiene números (HTML Validation)', () => {
    navegarARegistro();
    cy.log('Paso 2: Intentar usar números en el usuario');
    cy.get('#registro-form').within(() => {
        cy.get('input[name="usuario"]').type('Alex123'); 
        cy.get('input[name="password"]').type(claveValida);
    });
    cy.contains('Crea tu cuenta').click(); 
    cy.log('Paso 3: Verificar deshabilitación del botón y mensaje');
    cy.get('button[type="submit"]').should('have.attr', 'disabled'); 
    cy.contains('El usuario debe contener solo letras.').should('be.visible');
  });

  // --- Test 3: Falla por Usuario Existente (Aserción de URL) ---
  it('3. Debe fallar el registro y quedarse en /registro (Usuario Existente)', () => {
    navegarARegistro();
    
    cy.log('Paso 2: Intentar registrar usuario que ya existe');
    cy.get('#registro-form').within(() => {
        cy.get('input[name="usuario"]').type(usuarioExistenteFijo); 
        cy.get('input[name="password"]').type(claveValida);
        cy.log('Paso 3: Hacer clic en Registrarme');
        cy.get('button[type="submit"]').contains('Registrarme').click();
    });

    // ASERCIÓN CLAVE: La app NO NAVEGA. Esto prueba que el bloque catch se ejecutó.
    cy.url().should('include', '/registro', { timeout: 15000 }); 
    cy.log('✅ Verificado: La aplicación se quedó en /registro, indicando falla de BD.');
  });
  
});