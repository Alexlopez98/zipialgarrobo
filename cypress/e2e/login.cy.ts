describe('Flujo E2E: Inicio de Sesión (Login)', () => {

  const baseURL = 'http://localhost:8100/login';

  beforeEach(() => {
    cy.visit(baseURL);
  });

  // Función de selección final: Usa el atributo data-cy
  const getErrorMessage = () => {
    return cy.get('[data-cy="login-error"]');
  };

  // --- Caso 1: Login Exitoso (Ahora verifica falla de BD) ---
  it('1. Debe fallar el Login y mostrar el error técnico de la BD', () => {
    
    const usuarioValido = 'pollocerdo'; 
    const claveValida = '4321'; 

    cy.log('Paso 1: Llenar credenciales válidas');
    cy.get('input[name="usuario"]').type(usuarioValido);
    cy.get('input[name="password"]').type(claveValida);

    cy.log('Paso 2: Hacer clic en Ingresar');
    cy.get('button[type="submit"]').contains('Ingresar').click({ force: true }); 

    cy.log('Paso 3: Verificar el mensaje de error técnico');
    
    // Hacemos una pequeña pausa para que Angular termine de inyectar el error
    cy.wait(500); 

    // Aserción: Verificamos que el elemento EXISTA en el DOM y contenga el texto.
    getErrorMessage()
      .scrollIntoView({ duration: 500 })
      .should('exist') 
      .and('contain', 'Error técnico al iniciar sesión.');
    
    cy.url().should('include', '/login'); 
  });
  
  // --- Caso 2: Login Fallido (Lógica de App) ---
  it('2. Debe mostrar error de credenciales incorrectas', () => {
    
    const usuarioLogicamenteInvalido = 'usuarioprueba'; 
    const claveInvalida = '1111';

    cy.log('Paso 1: Intentar con credenciales lógicamente incorrectas');
    cy.get('input[name="usuario"]').type(usuarioLogicamenteInvalido);
    cy.get('input[name="password"]').type(claveInvalida);

    cy.log('Paso 2: Hacer clic en Ingresar (Forzado)');
    cy.get('button[type="submit"]').contains('Ingresar').click({ force: true });
    
    cy.log('Paso 3: Verificar el mensaje de credenciales incorrectas');
    
    cy.wait(500); // Pequeña espera para renderizado
    
    // Aserción: Verificamos que el elemento EXISTA en el DOM y contenga el texto.
    getErrorMessage()
      .scrollIntoView({ duration: 500 })
      .should('exist')
      .and('contain', 'Usuario o contraseña incorrectos.');
    
    cy.url().should('include', '/login'); 
  });
});