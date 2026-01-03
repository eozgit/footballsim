import { Project } from 'ts-morph';

const project = new Project({ tsConfigFilePath: 'tsconfig.json' });
const hubs = [
  'common',
  'actions',
  'ballMovement',
  'playerMovement',
  'setPositions',
  'setVariables',
  'injury',
  'validate',
  'initiate_team',
  'set_freekicks',
];

project.getSourceFiles().forEach((sourceFile) => {
  sourceFile.getImportDeclarations().forEach((imp) => {
    const specifier = imp.getModuleSpecifierValue();
    const fileName = specifier.split('/').pop()?.replace('.js', '');

    if (fileName && hubs.includes(fileName)) {
      const identifier = imp.getDefaultImport()?.getText() || fileName;

      // Clean up duplicate/named imports and replace with a clean Namespace
      imp.removeDefaultImport();
      imp.removeNamedImports();
      imp.setNamespaceImport(identifier);
    }
  });
});

project.saveSync();
