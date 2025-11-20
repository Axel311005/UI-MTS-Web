# 🛡️ Testing de Seguridad - Payloads Maliciosos para Consola

## ⚠️ ADVERTENCIA

Estos payloads son SOLO para testing en tu propio proyecto. NO los uses en aplicaciones de terceros.

---

## 1. Intentos de Restaurar Console

```javascript
// Intentar restaurar console.log
window.console.log = console.log.constructor.prototype.log;

// Intentar acceder a console original
const originalConsole = window.console;
originalConsole.log('test');

// Intentar crear nueva instancia
const newConsole = new console.constructor();
newConsole.log('test');

// Intentar usar Function constructor
Function('return console.log("test")')();

// Intentar usar eval
eval('console.log("test")');

// Intentar usar setTimeout para restaurar
setTimeout(() => {
  window.console.log = function () {
    return 'hacked';
  };
}, 1000);
```

---

## 2. Intentos de XSS en Inputs

### Payloads básicos:

```
<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>
<svg onload=alert('XSS')>
javascript:alert('XSS')
```

### Payloads avanzados:

```
<iframe src="javascript:alert('XSS')"></iframe>
<body onload=alert('XSS')>
<input onfocus=alert('XSS') autofocus>
<select onfocus=alert('XSS') autofocus>
<textarea onfocus=alert('XSS') autofocus>
<keygen onfocus=alert('XSS') autofocus>
<video><source onerror=alert('XSS')>
<audio src=x onerror=alert('XSS')>
```

### Event handlers:

```
onclick=alert('XSS')
onerror=alert('XSS')
onload=alert('XSS')
onmouseover=alert('XSS')
onfocus=alert('XSS')
onblur=alert('XSS')
```

### Data URLs:

```
data:text/html,<script>alert('XSS')</script>
data:text/html;base64,PHNjcmlwdD5hbGVydCgnWFNTJyk8L3NjcmlwdD4=
```

### VBScript:

```
vbscript:alert('XSS')
```

---

## 3. Intentos de SQL Injection (si hay backend)

```
' OR '1'='1
' OR '1'='1' --
' OR '1'='1' /*
admin'--
admin'/*
admin'#
' UNION SELECT NULL--
' UNION SELECT NULL,NULL--
```

---

## 4. Intentos de Bypass de Validación

### Caracteres repetidos:

```
aaa
AAAA
111
###
@@@
```

### Caracteres especiales:

```
<>&"'
&#60;&#62;
%3Cscript%3E
\u003Cscript\u003E
```

### Encoding bypass:

```
%3Cscript%3Ealert('XSS')%3C/script%3E
&lt;script&gt;alert('XSS')&lt;/script&gt;
&#60;script&#62;alert('XSS')&#60;/script&#62;
```

---

## 5. Intentos de Manipulación de DOM

```javascript
// Intentar inyectar scripts
document.body.innerHTML += '<script>alert("XSS")</script>';

// Intentar modificar elementos
document.getElementById('root').innerHTML = '<img src=x onerror=alert("XSS")>';

// Intentar crear elementos maliciosos
const script = document.createElement('script');
script.textContent = 'alert("XSS")';
document.body.appendChild(script);

// Intentar usar eval indirectamente
window['eval']('alert("XSS")');
```

---

## 6. Intentos de Acceso a Datos Sensibles

```javascript
// Intentar acceder a localStorage
localStorage.getItem('token');
localStorage.getItem('password');

// Intentar acceder a sessionStorage
sessionStorage.getItem('auth');

// Intentar acceder a cookies
document.cookie;

// Intentar interceptar fetch
const originalFetch = window.fetch;
window.fetch = function (...args) {
  console.log('Intercepted:', args);
  return originalFetch.apply(this, args);
};
```

---

## 7. Intentos de Bypass de Protección DevTools

```javascript
// Intentar abrir DevTools programáticamente
window
  .open('', '_blank', 'width=100,height=100')
  .document.write('<script>console.log("test")</script>');

// Intentar usar postMessage
window.postMessage({ type: 'openDevTools' }, '*');

// Intentar usar debugger
debugger;

// Intentar usar console en diferentes formas
console['log']('test');
window['console']['log']('test');
```

---

## 8. Payloads para Campos Específicos

### Campo de Email:

```
"><script>alert('XSS')</script>
admin@test.com' OR '1'='1
javascript:alert('XSS')
```

### Campo de Teléfono:

```
<script>alert('XSS')</script>
'+OR+1=1--
' UNION SELECT NULL--
```

### Campo de RUC:

```
J0000000000000
J1111111111111
' OR '1'='1
<script>alert('XSS')</script>
```

### Campo de Precio:

```
-999999999
999999999999999
NaN
Infinity
-Infinity
1e308
```

### Campo de Fecha:

```
1970-01-01' OR '1'='1
<script>alert('XSS')</script>
9999-12-31
0000-00-00
```

---

## 9. Intentos de CSRF

```javascript
// Intentar hacer peticiones desde otro origen
fetch('https://tu-api.com/api/delete-all', {
  method: 'POST',
  credentials: 'include',
});

// Intentar usar XMLHttpRequest
const xhr = new XMLHttpRequest();
xhr.open('POST', 'https://tu-api.com/api/delete-all');
xhr.withCredentials = true;
xhr.send();
```

---

## 10. Payloads de Overflow

```
// Strings muy largos
'a'.repeat(1000000)
'<script>'.repeat(10000)

// Números muy grandes
Number.MAX_SAFE_INTEGER + 1
1e308
-1e308
```

---

## ✅ Qué Debería Bloquearse

1. ✅ Todos los `<script>` tags
2. ✅ Todos los event handlers (`onclick`, `onerror`, etc.)
3. ✅ `javascript:` URLs
4. ✅ `data:` URLs maliciosas
5. ✅ Caracteres repetidos (3+ consecutivos)
6. ✅ Números fuera de rango
7. ✅ Fechas inválidas
8. ✅ Console methods en producción
9. ✅ Acceso a datos sensibles
10. ✅ Manipulación de DOM maliciosa

---

## 🧪 Cómo Probar

1. Abre la consola del navegador (en desarrollo)
2. Prueba cada payload en los inputs del formulario
3. Verifica que:
   - Los payloads se sanitizan correctamente
   - No se ejecuta código JavaScript
   - Los errores se muestran apropiadamente
   - La consola está bloqueada en producción

---

## 📝 Notas

- En **desarrollo**: La consola funciona normalmente para debugging
- En **producción**: La consola debe estar bloqueada
- DOMPurify debe sanitizar todos los payloads XSS
- Las validaciones deben rechazar datos inválidos
- Los errores no deben exponer información sensible
