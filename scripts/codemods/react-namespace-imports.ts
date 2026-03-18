import { Project, SyntaxKind } from 'ts-morph'

const project = new Project({ tsConfigFilePath: 'tsconfig.json' })

for (const sourceFile of project.getSourceFiles('src/**/*.{ts,tsx}')) {
  const reactTypes: Set<string> = new Set()

  // QualifiedName = dotted names in type positions (e.g. `param: React.MouseEvent`)
  // .getLeft() is "React", .getRight() is "MouseEvent"
  for (const qn of sourceFile.getDescendantsOfKind(SyntaxKind.QualifiedName)) {
    if (qn.getLeft().getText() === 'React') {
      const typeName = qn.getRight().getText()
      reactTypes.add(typeName)
      qn.replaceWithText(typeName)
    }
  }

  // PropertyAccessExpression = dotted names in value positions (e.g. `React.createElement`)
  // .getExpression() is "React", .getName() is "createElement"
  for (const pa of sourceFile.getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)) {
    if (pa.getExpression().getText() === 'React') {
      const name = pa.getName()
      reactTypes.add(name)
      pa.replaceWithText(name)
    }
  }

  if (reactTypes.size === 0) continue

  // Merge into existing 'react' import, or create a new one.
  // addNamedImport({ isTypeOnly: true }) produces per-specifier `type` keyword:
  //   import { useState, type MouseEvent } from 'react'
  const existing = sourceFile.getImportDeclaration('react')
  if (existing) {
    for (const t of reactTypes) {
      // Skip if already imported (avoids duplicates)
      if (!existing.getNamedImports().some((n) => n.getName() === t)) {
        existing.addNamedImport({ name: t, isTypeOnly: true })
      }
    }
  } else {
    sourceFile.addImportDeclaration({
      moduleSpecifier: 'react',
      namedImports: [...reactTypes].map((name) => ({ name, isTypeOnly: true })),
    })
  }

  sourceFile.saveSync()
}

// Key points:
// 1. QualifiedName handles type positions (React.MouseEvent in type annotations)
// 2. PropertyAccessExpression handles value positions (React.createElement etc.)
// 3. Merges into existing 'react' import — adds per-specifier `type` keyword
//    so `import { useState, type MouseEvent } from 'react'`
// 4. Creates a new import if none exists
