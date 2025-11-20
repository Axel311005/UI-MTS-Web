/**
 * EJEMPLOS DE USO DE LAS UTILIDADES DE SEGURIDAD
 *
 * Este archivo muestra cómo usar las funciones de seguridad
 * para prevenir XSS, validar inputs y sanitizar datos.
 */

import {
  sanitizeString,
  sanitizeNumber,
  sanitizeFormData,
  validateEmail,
  validatePlaca,
  validateTelefono,
  sanitizeId,
  escapeHtml,
  isSafeString,
} from './security';

// ============================================
// EJEMPLO 1: Sanitizar entrada de usuario
// ============================================
export function ejemploSanitizacion() {
  const userInput = '<script>alert("XSS")</script>Hola mundo';
  const sanitized = sanitizeString(userInput);
  // Resultado: 'Hola mundo' (sin el script)
  // console.log(sanitized); // Comentado para producción
  return sanitized;
}

// ============================================
// EJEMPLO 2: Validar email
// ============================================
export function ejemploValidarEmail() {
  const email1 = 'usuario@ejemplo.com';
  const email2 = 'email-invalido';

  // console.log(validateEmail(email1)); // true - Comentado para producción
  // console.log(validateEmail(email2)); // false - Comentado para producción
  return {
    email1: validateEmail(email1),
    email2: validateEmail(email2),
  };
}

// ============================================
// EJEMPLO 3: Sanitizar número con límites
// ============================================
export function ejemploSanitizarNumero() {
  const input1 = '25';
  const input2 = '150';
  const input3 = 'abc';

  // Año válido entre 1900 y 2100
  // console.log(sanitizeNumber(input1, 1900, 2100)); // Comentado para producción
  // console.log(sanitizeNumber(input2, 1900, 2100)); // Comentado para producción
  // console.log(sanitizeNumber('2020', 1900, 2100)); // Comentado para producción
  // console.log(sanitizeNumber(input3, 1900, 2100)); // Comentado para producción
  return {
    input1: sanitizeNumber(input1, 1900, 2100),
    input2: sanitizeNumber(input2, 1900, 2100),
    valid: sanitizeNumber('2020', 1900, 2100),
    input3: sanitizeNumber(input3, 1900, 2100),
  };
}

// ============================================
// EJEMPLO 4: Validar placa de vehículo
// ============================================
export function ejemploValidarPlaca() {
  const placa1 = 'ABC-123';
  const placa2 = '<script>alert("XSS")</script>';

  // console.log(validatePlaca(placa1)); // true - Comentado para producción
  // console.log(validatePlaca(placa2)); // false - Comentado para producción
  return {
    placa1: validatePlaca(placa1),
    placa2: validatePlaca(placa2),
  };
}

// ============================================
// EJEMPLO 5: Sanitizar datos de formulario
// ============================================
export function ejemploSanitizarFormulario() {
  const formData = {
    nombre: '<script>alert("XSS")</script>Juan',
    email: 'juan@ejemplo.com',
    edad: '25',
    comentario: 'Hola <b>mundo</b>',
  };

  const sanitized = sanitizeFormData(formData);
  // Resultado: { nombre: 'Juan', email: 'juan@ejemplo.com', edad: '25', comentario: 'Hola mundo' }
  // console.log(sanitized); // Comentado para producción
  return sanitized;
}

// ============================================
// EJEMPLO 6: Escapar HTML para prevenir XSS
// ============================================
export function ejemploEscapeHtml() {
  const userInput = '<script>alert("XSS")</script>';
  const escaped = escapeHtml(userInput);
  // Resultado: '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
  // console.log(escaped); // Comentado para producción
  return escaped;
}

// ============================================
// NOTA: La validación de contraseñas se maneja en el backend
// ============================================

// ============================================
// EJEMPLO 7: Verificar si un string es seguro
// ============================================
export function ejemploIsSafeString() {
  const safe = 'Hola mundo';
  const unsafe = '<script>alert("XSS")</script>';

  // console.log(isSafeString(safe)); // true - Comentado para producción
  // console.log(isSafeString(unsafe)); // false - Comentado para producción
  return {
    safe: isSafeString(safe),
    unsafe: isSafeString(unsafe),
  };
}

// ============================================
// EJEMPLO 8: Sanitizar ID
// ============================================
export function ejemploSanitizarId() {
  const id1 = '123';
  const id2 = '-5';
  const id3 = 'abc';

  // console.log(sanitizeId(id1)); // 123 - Comentado para producción
  // console.log(sanitizeId(id2)); // undefined - Comentado para producción
  // console.log(sanitizeId(id3)); // undefined - Comentado para producción
  return {
    id1: sanitizeId(id1),
    id2: sanitizeId(id2),
    id3: sanitizeId(id3),
  };
}

// ============================================
// EJEMPLO 9: Validar teléfono
// ============================================
export function ejemploValidarTelefono() {
  const telefono1 = '12345678';
  const telefono2 = '1234';
  const telefono3 = 'abc12345';

  // console.log(validateTelefono(telefono1)); // true - Comentado para producción
  // console.log(validateTelefono(telefono2)); // false - Comentado para producción
  // console.log(validateTelefono(telefono3)); // false - Comentado para producción
  return {
    telefono1: validateTelefono(telefono1),
    telefono2: validateTelefono(telefono2),
    telefono3: validateTelefono(telefono3),
  };
}
