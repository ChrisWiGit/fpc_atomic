module.exports = {
    // Verzeichnis, in dem sich die Tests befinden
    roots: ['<rootDir>/tests'],
    preset: 'ts-jest',
    verbose: true,
  
    // Dateimuster, die für Testdateien verwendet werden sollen
    testMatch: ['**/*.spec.ts'],
  
    // Transformationskonfiguration für TypeScript-Dateien
    transform: {
      '^.+\\.ts$':  '@swc/jest'
    //   '^.+\\.ts$': [
    //     'ts-jest', {
    //       tsconfig: 'tsconfig.json'
    //     }
    // ]
    },
  
    // Moduldateien, die für den Testbetrieb benötigt werden
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  
    // Setup-Datei vor dem Testlauf ausführen
    // setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
  
    // Berichterstattungskonfiguration
    coverageDirectory: '<rootDir>/coverage',
    collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
    


  };
  