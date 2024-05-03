import _template from '@babel/template'

// No idea why this happens. 🤷 mjs?
const template = _template.default

const buildLoader = template(`export default (React, deps) => {
  BODY;\n
  return Promise.resolve(EXPORTS)
}`)

export default function({ types: t }) {
  let exports = {};

  return {
    visitor: {
      ImportDefaultSpecifier(path) {
        if (path.node.specifiers) {
          path.node.specifiers.forEach(specifier => {
            if (specifier.imported.name === 'React') {
              path.remove()
            }
          })
        }
      },
      ExportNamedDeclaration(path) {
        path.node.specifiers.forEach(specifier => {
          exports[specifier.exported.name] = specifier.local.name
        })

        if (path.node.declaration) {
          path.replaceWith(path.node.declaration)
        } else {
          path.remove()
        }
      },
      Program: {
        exit(path) {
          if (!this.runLazy) {
            this.runLazy = true
            const loader = buildLoader({
              BODY: path.node.body,
              EXPORTS: t.ObjectExpression(Object.keys(exports).map(key => {
                return t.ObjectProperty(t.identifier(key), t.identifier(exports[key]))
              }))
            })

            path.replaceWith(t.program([loader]))
          }
        }
      }
    }
  }
}
