# SEO Suite para Codex y OpenCode

Adaptador reproducible del checkout local de claude-seo (MIT, AgriciDaniel). Conserva scripts, referencias, agentes como listas de comprobación, extensiones y el runtime aislado; añade una entrada independiente del host y un launcher portable. No modifica la skill `seo-audit` existente ni activa hooks de Claude.

## Construir

```sh
python3 tools/seo-portable/build.py /ruta/claude-seo /ruta/nueva/seo-suite
```

El destino debe ser nuevo y externo al checkout original. Incluye `LICENSE` y `MANIFEST.json` con hashes para poder revisar el paquete.

## Instalar

Copia la carpeta resultante en `.agents/skills/seo-suite` del proyecto. Codex y OpenCode reconocen esa ubicación compartida. Para otros equipos utiliza el ZIP entregado, extráelo y copia esa carpeta; no copies el enlace simbólico de esta máquina.

En esta máquina quedó enlazada desde `.agents/skills/seo-suite` a la carpeta de artefactos de esta conversación. Abre una sesión nueva para que se descubra automáticamente. En esta sesión ya se leyó y aplicó su flujo de auditoría.

Uso en ambos hosts:

> Usa seo-suite para auditar https://spsatt.com.mx y el repositorio local. Guarda evidencia y separa hallazgos publicados de cambios locales.

## Dependencias y límites

Python 3.11–3.14. Antes de ejecutar los analizadores incluidos:

```sh
/ruta/seo-suite/scripts/seo-suite doctor --json
```

Si autorizas instalar sus dependencias aisladas, ejecuta:

```sh
/ruta/seo-suite/scripts/seo-suite setup
```

`SEO_SUITE_DATA_DIR` permite elegir una caché dedicada y escribible. `SEO_SUITE_PYTHON` selecciona un intérprete compatible. El adaptador no instala dependencias automáticamente ni requiere variables de Claude. Los nombres internos `CLAUDE_SEO_*` se conservan para compatibilidad del runtime original.

La comprobación de esta entrega encontró Python 3.12, pero aún no el entorno gestionado ni Chromium del paquete. La auditoría se realizó con herramientas del host, HTTP público, código y pruebas locales; no se ejecutaron Lighthouse/CrUX ni se accedió a Search Console autenticado. No se garantiza posicionamiento ni resultados enriquecidos.

Referencias de compatibilidad: [OpenCode Skills](https://opencode.ai/docs/skills/). Codex usa las skills locales con `SKILL.md` de `.agents/skills/`.
