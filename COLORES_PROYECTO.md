# 🎨 Paleta de Colores del Proyecto - UI-MTS-Web

## 📋 Resumen de Colores Principales

### Colores Base (HEX)
- **Primary (Coral suave)**: `#f6b0a2`
- **Secondary (Azul suave)**: `#a2d5f6`
- **Accent (Melocotón)**: `#f6d9a2`

---

## 🌞 Modo Claro (Light Mode)

### Variables CSS - Modo Claro

```css
:root {
  /* Fondos */
  --background: 0 0% 98%;              /* #FAFAFA - Fondo principal */
  --foreground: 0 0% 20%;              /* #333333 - Texto principal */

  /* Tarjetas */
  --card: 0 0% 100%;                    /* #FFFFFF - Fondo de tarjetas */
  --card-foreground: 0 0% 20%;         /* #333333 - Texto en tarjetas */

  /* Popover */
  --popover: 0 0% 100%;                /* #FFFFFF - Fondo popover */
  --popover-foreground: 0 0% 20%;      /* #333333 - Texto popover */

  /* Primary - Coral suave #f6b0a2 */
  --primary: 10 81% 80%;               /* #F6B0A2 - Color principal */
  --primary-foreground: 0 0% 20%;      /* #333333 - Texto sobre primary */
  --primary-glow: 10 81% 88%;          /* #F8D4C8 - Brillo primary */

  /* Secondary - Azul suave #a2d5f6 */
  --secondary: 204 81% 80%;            /* #A2D5F6 - Color secundario */
  --secondary-foreground: 0 0% 20%;   /* #333333 - Texto sobre secondary */

  /* Neutros */
  --muted: 0 0% 96%;                   /* #F5F5F5 - Fondo muted */
  --muted-foreground: 0 0% 45%;        /* #737373 - Texto muted */

  /* Accent - Melocotón #f6d9a2 */
  --accent: 41 81% 80%;                /* #F6D9A2 - Color acento */
  --accent-foreground: 0 0% 20%;       /* #333333 - Texto sobre accent */

  /* Destructivo */
  --destructive: 0 65% 50%;            /* #CC3333 - Color destructivo */
  --destructive-foreground: 0 0% 100%; /* #FFFFFF - Texto sobre destructive */

  /* Bordes y Inputs */
  --border: 0 0% 90%;                  /* #E6E6E6 - Color de bordes */
  --input: 0 0% 94%;                   /* #F0F0F0 - Fondo de inputs */
  --ring: 10 81% 80%;                  /* #F6B0A2 - Color de focus ring */

  /* Border Radius */
  --radius: 0.5rem;                    /* 8px - Radio de bordes */

  /* Sidebar */
  --sidebar-background: 0 0% 99%;      /* #FCFCFC - Fondo sidebar */
  --sidebar-foreground: 0 0% 20%;     /* #333333 - Texto sidebar */
  --sidebar-primary: 10 81% 75%;      /* #F4A08E - Primary sidebar */
  --sidebar-primary-foreground: 0 0% 20%; /* #333333 - Texto primary sidebar */
  --sidebar-accent: 0 0% 96%;         /* #F5F5F5 - Accent sidebar */
  --sidebar-accent-foreground: 0 0% 20%; /* #333333 - Texto accent sidebar */
  --sidebar-border: 0 0% 92%;         /* #EBEBEB - Borde sidebar */
  --sidebar-ring: 10 81% 80%;         /* #F6B0A2 - Ring sidebar */
}
```

### Colores en HEX - Modo Claro

```css
/* Primary */
--primary-hex: #f6b0a2;
--primary-foreground-hex: #333333;
--primary-glow-hex: #f8d4c8;

/* Secondary */
--secondary-hex: #a2d5f6;
--secondary-foreground-hex: #333333;

/* Accent */
--accent-hex: #f6d9a2;
--accent-foreground-hex: #333333;

/* Backgrounds */
--background-hex: #fafafa;
--foreground-hex: #333333;
--card-hex: #ffffff;
--muted-hex: #f5f5f5;

/* Destructive */
--destructive-hex: #cc3333;
--destructive-foreground-hex: #ffffff;

/* Borders */
--border-hex: #e6e6e6;
--input-hex: #f0f0f0;
```

### Colores en RGB - Modo Claro

```css
/* Primary */
--primary-rgb: 246, 176, 162;
--primary-foreground-rgb: 51, 51, 51;

/* Secondary */
--secondary-rgb: 162, 213, 246;
--secondary-foreground-rgb: 51, 51, 51;

/* Accent */
--accent-rgb: 246, 217, 162;
--accent-foreground-rgb: 51, 51, 51;

/* Backgrounds */
--background-rgb: 250, 250, 250;
--foreground-rgb: 51, 51, 51;
--card-rgb: 255, 255, 255;
--muted-rgb: 245, 245, 245;

/* Destructive */
--destructive-rgb: 204, 51, 51;
--destructive-foreground-rgb: 255, 255, 255;
```

---

## 🌙 Modo Oscuro (Dark Mode)

### Variables CSS - Modo Oscuro

```css
.dark {
  /* Fondos */
  --background: 0 0% 8%;               /* #141414 - Fondo principal oscuro */
  --foreground: 0 0% 95%;              /* #F2F2F2 - Texto principal */

  /* Tarjetas */
  --card: 0 0% 11%;                    /* #1C1C1C - Fondo de tarjetas */
  --card-foreground: 0 0% 95%;         /* #F2F2F2 - Texto en tarjetas */

  /* Popover */
  --popover: 0 0% 11%;                 /* #1C1C1C - Fondo popover */
  --popover-foreground: 0 0% 95%;      /* #F2F2F2 - Texto popover */

  /* Primary - Coral más vibrante */
  --primary: 10 75% 70%;               /* #E89A8A - Color principal oscuro */
  --primary-foreground: 0 0% 10%;      /* #1A1A1A - Texto sobre primary */
  --primary-glow: 10 75% 78%;          /* #F0B4A6 - Brillo primary */

  /* Secondary - Azul suave */
  --secondary: 204 60% 65%;            /* #7DB8E0 - Color secundario oscuro */
  --secondary-foreground: 0 0% 10%;    /* #1A1A1A - Texto sobre secondary */

  /* Neutros */
  --muted: 0 0% 15%;                   /* #262626 - Fondo muted */
  --muted-foreground: 0 0% 70%;        /* #B3B3B3 - Texto muted */

  /* Accent - Melocotón */
  --accent: 41 65% 70%;                /* #E6C88A - Color acento oscuro */
  --accent-foreground: 0 0% 10%;       /* #1A1A1A - Texto sobre accent */

  /* Destructivo */
  --destructive: 0 60% 55%;            /* #B83333 - Color destructivo oscuro */
  --destructive-foreground: 0 0% 100%; /* #FFFFFF - Texto sobre destructive */

  /* Bordes y Inputs */
  --border: 0 0% 20%;                  /* #333333 - Color de bordes */
  --input: 0 0% 16%;                    /* #292929 - Fondo de inputs */
  --ring: 10 75% 70%;                  /* #E89A8A - Color de focus ring */

  /* Sidebar */
  --sidebar-background: 0 0% 9%;       /* #171717 - Fondo sidebar */
  --sidebar-foreground: 0 0% 90%;      /* #E6E6E6 - Texto sidebar */
  --sidebar-primary: 10 70% 65%;      /* #D88A7A - Primary sidebar */
  --sidebar-primary-foreground: 0 0% 10%; /* #1A1A1A - Texto primary sidebar */
  --sidebar-accent: 0 0% 14%;         /* #242424 - Accent sidebar */
  --sidebar-accent-foreground: 0 0% 85%; /* #D9D9D9 - Texto accent sidebar */
  --sidebar-border: 0 0% 18%;         /* #2E2E2E - Borde sidebar */
  --sidebar-ring: 10 70% 65%;        /* #D88A7A - Ring sidebar */
}
```

### Colores en HEX - Modo Oscuro

```css
/* Primary */
--primary-dark-hex: #e89a8a;
--primary-foreground-dark-hex: #1a1a1a;
--primary-glow-dark-hex: #f0b4a6;

/* Secondary */
--secondary-dark-hex: #7db8e0;
--secondary-foreground-dark-hex: #1a1a1a;

/* Accent */
--accent-dark-hex: #e6c88a;
--accent-foreground-dark-hex: #1a1a1a;

/* Backgrounds */
--background-dark-hex: #141414;
--foreground-dark-hex: #f2f2f2;
--card-dark-hex: #1c1c1c;
--muted-dark-hex: #262626;

/* Destructive */
--destructive-dark-hex: #b83333;
--destructive-foreground-dark-hex: #ffffff;

/* Borders */
--border-dark-hex: #333333;
--input-dark-hex: #292929;
```

---

## 🎨 Gradientes

### Modo Claro
```css
/* Gradiente Primary */
--gradient-primary: linear-gradient(135deg, hsl(10 81% 80%), hsl(10 81% 88%));
/* Equivalente: linear-gradient(135deg, #f6b0a2, #f8d4c8) */

/* Gradiente Card */
--gradient-card: linear-gradient(145deg, hsl(0 0% 100%), hsl(0 0% 99%));
/* Equivalente: linear-gradient(145deg, #ffffff, #fcfcfc) */

/* Gradiente Muted */
--gradient-muted: linear-gradient(180deg, hsl(0 0% 96%), hsl(0 0% 94%));
/* Equivalente: linear-gradient(180deg, #f5f5f5, #f0f0f0) */
```

### Modo Oscuro
```css
/* Gradiente Primary */
--gradient-primary-dark: linear-gradient(135deg, hsl(10 75% 70%), hsl(10 75% 78%));
/* Equivalente: linear-gradient(135deg, #e89a8a, #f0b4a6) */

/* Gradiente Card */
--gradient-card-dark: linear-gradient(145deg, hsl(0 0% 11%), hsl(0 0% 13%));
/* Equivalente: linear-gradient(145deg, #1c1c1c, #212121) */

/* Gradiente Muted */
--gradient-muted-dark: linear-gradient(180deg, hsl(0 0% 15%), hsl(0 0% 13%));
/* Equivalente: linear-gradient(180deg, #262626, #212121) */
```

---

## 🌈 Sombras

### Modo Claro
```css
--shadow-card: 0 4px 20px -2px hsl(10 20% 50% / 0.08);
--shadow-header: 0 2px 16px -4px hsl(10 20% 50% / 0.06);
--shadow-hover: 0 8px 32px -4px hsl(10 81% 80% / 0.2);
```

### Modo Oscuro
```css
--shadow-card-dark: 0 4px 20px -2px hsl(0 0% 0% / 0.4);
--shadow-header-dark: 0 2px 16px -4px hsl(0 0% 0% / 0.3);
--shadow-hover-dark: 0 8px 32px -4px hsl(10 75% 70% / 0.3);
```

---

## 📝 Uso en Tailwind CSS

```javascript
// tailwind.config.js
colors: {
  primary: {
    DEFAULT: "hsl(var(--primary))",
    foreground: "hsl(var(--primary-foreground))",
  },
  secondary: {
    DEFAULT: "hsl(var(--secondary))",
    foreground: "hsl(var(--secondary-foreground))",
  },
  accent: {
    DEFAULT: "hsl(var(--accent))",
    foreground: "hsl(var(--accent-foreground))",
  },
  destructive: {
    DEFAULT: "hsl(var(--destructive))",
    foreground: "hsl(var(--destructive-foreground))",
  },
  muted: {
    DEFAULT: "hsl(var(--muted))",
    foreground: "hsl(var(--muted-foreground))",
  },
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
  card: {
    DEFAULT: "hsl(var(--card))",
    foreground: "hsl(var(--card-foreground))",
  },
  border: "hsl(var(--border))",
  input: "hsl(var(--input))",
  ring: "hsl(var(--ring))",
}
```

---

## 🎯 Paleta Resumida para Lovable

### Colores Principales (HEX)
```
Primary: #f6b0a2 (Coral suave)
Secondary: #a2d5f6 (Azul suave)
Accent: #f6d9a2 (Melocotón)
Background: #fafafa
Foreground: #333333
Card: #ffffff
Muted: #f5f5f5
Destructive: #cc3333
Border: #e6e6e6
```

### Colores Modo Oscuro (HEX)
```
Primary: #e89a8a
Secondary: #7db8e0
Accent: #e6c88a
Background: #141414
Foreground: #f2f2f2
Card: #1c1c1c
Muted: #262626
Destructive: #b83333
Border: #333333
```

---

## 📋 Código CSS Completo para Copiar

```css
:root {
  /* === FONDOS === */
  --background: 0 0% 98%;
  --foreground: 0 0% 20%;

  /* === TARJETAS === */
  --card: 0 0% 100%;
  --card-foreground: 0 0% 20%;

  /* === POPOVER === */
  --popover: 0 0% 100%;
  --popover-foreground: 0 0% 20%;

  /* === PRIMARY (Coral #f6b0a2) === */
  --primary: 10 81% 80%;
  --primary-foreground: 0 0% 20%;
  --primary-glow: 10 81% 88%;

  /* === SECONDARY (Azul #a2d5f6) === */
  --secondary: 204 81% 80%;
  --secondary-foreground: 0 0% 20%;

  /* === ACCENT (Melocotón #f6d9a2) === */
  --accent: 41 81% 80%;
  --accent-foreground: 0 0% 20%;

  /* === NEUTROS === */
  --muted: 0 0% 96%;
  --muted-foreground: 0 0% 45%;

  /* === DESTRUCTIVO === */
  --destructive: 0 65% 50%;
  --destructive-foreground: 0 0% 100%;

  /* === BORDES === */
  --border: 0 0% 90%;
  --input: 0 0% 94%;
  --ring: 10 81% 80%;

  /* === RADIUS === */
  --radius: 0.5rem;

  /* === SIDEBAR === */
  --sidebar-background: 0 0% 99%;
  --sidebar-foreground: 0 0% 20%;
  --sidebar-primary: 10 81% 75%;
  --sidebar-primary-foreground: 0 0% 20%;
  --sidebar-accent: 0 0% 96%;
  --sidebar-accent-foreground: 0 0% 20%;
  --sidebar-border: 0 0% 92%;
  --sidebar-ring: 10 81% 80%;
}

.dark {
  /* === FONDOS === */
  --background: 0 0% 8%;
  --foreground: 0 0% 95%;

  /* === TARJETAS === */
  --card: 0 0% 11%;
  --card-foreground: 0 0% 95%;

  /* === POPOVER === */
  --popover: 0 0% 11%;
  --popover-foreground: 0 0% 95%;

  /* === PRIMARY === */
  --primary: 10 75% 70%;
  --primary-foreground: 0 0% 10%;
  --primary-glow: 10 75% 78%;

  /* === SECONDARY === */
  --secondary: 204 60% 65%;
  --secondary-foreground: 0 0% 10%;

  /* === ACCENT === */
  --accent: 41 65% 70%;
  --accent-foreground: 0 0% 10%;

  /* === NEUTROS === */
  --muted: 0 0% 15%;
  --muted-foreground: 0 0% 70%;

  /* === DESTRUCTIVO === */
  --destructive: 0 60% 55%;
  --destructive-foreground: 0 0% 100%;

  /* === BORDES === */
  --border: 0 0% 20%;
  --input: 0 0% 16%;
  --ring: 10 75% 70%;

  /* === SIDEBAR === */
  --sidebar-background: 0 0% 9%;
  --sidebar-foreground: 0 0% 90%;
  --sidebar-primary: 10 70% 65%;
  --sidebar-primary-foreground: 0 0% 10%;
  --sidebar-accent: 0 0% 14%;
  --sidebar-accent-foreground: 0 0% 85%;
  --sidebar-border: 0 0% 18%;
  --sidebar-ring: 10 70% 65%;
}
```

---

## 🎨 Notas de Diseño

- **Sistema de colores**: Basado en HSL para mejor control de temas
- **Accesibilidad**: Colores diseñados para cumplir con WCAG 2.1
- **Tema dual**: Soporte completo para modo claro y oscuro
- **Paleta suave**: Colores pasteles y profesionales para sistema de facturación
- **Border radius**: 0.5rem (8px) para esquinas redondeadas consistentes

---

**Última actualización**: Noviembre 2025

