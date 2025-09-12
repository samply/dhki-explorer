import type { FhirMeasureItem } from "@samply/lens";

const dktkPatientsMeasure: FhirMeasureItem = {
  key: "patients",
  measure: {
    code: {
      text: "patients",
    },
    population: [
      {
        code: {
          coding: [
            {
              system:
                "http://terminology.hl7.org/CodeSystem/measure-population",
              code: "initial-population",
            },
          ],
        },
        criteria: {
          language: "text/cql-identifier",
          expression: "InInitialPopulation",
        },
      },
    ],
    stratifier: [
      {
        code: {
          text: "Gender",
        },
        criteria: {
          language: "text/cql",
          expression: "Gender",
        },
      },
      {
        code: {
          text: "75186-7",
        },
        criteria: {
          language: "text/cql",
          expression: "Deceased",
        },
      },
      {
        code: {
          text: "Age",
        },
        criteria: {
          language: "text/cql",
          expression: "AgeClass",
        },
      },
    ],
  },
  cql: `
DKTK_STRAT_GENDER_STRATIFIER

DHKI_STRAT_AGE_STRATIFIER

DKTK_STRAT_DECEASED_STRATIFIER
`,
};

const dktkDiagnosisMeasure: FhirMeasureItem = {
  key: "diagnosis",
  measure: {
    code: {
      text: "diagnosis",
    },
    extension: [
      {
        url: "http://hl7.org/fhir/us/cqfmeasures/StructureDefinition/cqfm-populationBasis",
        valueCode: "Condition",
      },
    ],
    population: [
      {
        code: {
          coding: [
            {
              system:
                "http://terminology.hl7.org/CodeSystem/measure-population",
              code: "initial-population",
            },
          ],
        },
        criteria: {
          language: "text/cql-identifier",
          expression: "Diagnosis",
        },
      },
    ],
    stratifier: [
      {
        code: {
          text: "diagnosis",
        },
        criteria: {
          language: "text/cql-identifier",
          expression: "DiagnosisCode",
        },
      },
    ],
  },
  cql: `
DKTK_STRAT_DIAGNOSIS_STRATIFIER
`,
};

// const dktkSpecimenMeasure: FhirMeasureItem = {
//   key: "specimen",
//   measure: {
//     code: {
//       text: "specimen",
//     },
//     extension: [
//       {
//         url: "http://hl7.org/fhir/us/cqfmeasures/StructureDefinition/cqfm-populationBasis",
//         valueCode: "Specimen",
//       },
//     ],
//     population: [
//       {
//         code: {
//           coding: [
//             {
//               system:
//                 "http://terminology.hl7.org/CodeSystem/measure-population",
//               code: "initial-population",
//             },
//           ],
//         },
//         criteria: {
//           language: "text/cql-identifier",
//           expression: "Specimen",
//         },
//       },
//     ],
//     stratifier: [
//       {
//         code: {
//           text: "sample_kind",
//         },
//         criteria: {
//           language: "text/cql",
//           expression: "SampleType",
//         },
//       },
//     ],
//   },
//   cql: `
// DKTK_STRAT_SPECIMEN_STRATIFIER
// `,
// };

const dktkProceduresMeasure: FhirMeasureItem = {
  key: "procedures",
  measure: {
    code: {
      text: "procedures",
    },
    extension: [
      {
        url: "http://hl7.org/fhir/us/cqfmeasures/StructureDefinition/cqfm-populationBasis",
        valueCode: "Procedure",
      },
    ],
    population: [
      {
        code: {
          coding: [
            {
              system:
                "http://terminology.hl7.org/CodeSystem/measure-population",
              code: "initial-population",
            },
          ],
        },
        criteria: {
          language: "text/cql-identifier",
          expression: "Procedure",
        },
      },
    ],
    stratifier: [
      {
        code: {
          text: "ProcedureType",
        },
        criteria: {
          language: "text/cql",
          expression: "ProcedureType",
        },
      },
    ],
  },
  cql: `
DKTK_STRAT_PROCEDURE_STRATIFIER
`,
};

// const dktkMedicationStatementsMeasure: FhirMeasureItem = {
//   key: "medicationStatements",
//   measure: {
//     code: {
//       text: "medicationStatements",
//     },
//     extension: [
//       {
//         url: "http://hl7.org/fhir/us/cqfmeasures/StructureDefinition/cqfm-populationBasis",
//         valueCode: "MedicationStatement",
//       },
//     ],
//     population: [
//       {
//         code: {
//           coding: [
//             {
//               system:
//                 "http://terminology.hl7.org/CodeSystem/measure-population",
//               code: "initial-population",
//             },
//           ],
//         },
//         criteria: {
//           language: "text/cql-identifier",
//           expression: "MedicationStatement",
//         },
//       },
//     ],
//     stratifier: [
//       {
//         code: {
//           text: "MedicationType",
//         },
//         criteria: {
//           language: "text/cql",
//           expression: "ProcedureType",
//         },
//       },
//     ],
//   },
//   cql: `
// DKTK_STRAT_MEDICATION_STRATIFIER
// `,
// };

// const dhkiEncountersMeasure: FhirMeasureItem = {
//   key: "encounters",
//   measure: {
//     code: {
//       text: "Encounters",
//     },
//     extension: [
//       {
//         url: "http://hl7.org/fhir/us/cqfmeasures/StructureDefinition/cqfm-populationBasis",
//         valueCode: "Encounter",
//       },
//     ],
//     population: [
//       {
//         code: {
//           coding: [
//             {
//               system:
//                 "http://terminology.hl7.org/CodeSystem/measure-population",
//               code: "initial-population",
//             },
//           ],
//         },
//         criteria: {
//           language: "text/cql-identifier",
//           expression: "Encounter",
//         },
//       },
//     ],
//     stratifier: [
//       {
//         code: {
//           text: "Departments",
//         },
//         criteria: {
//           language: "text/cql",
//           expression: "Departments",
//         },
//       },
//     ],
//   },
//   cql: `
// define Encounter:
// if InInitialPopulation then [Encounter] else {} as List<Encounter>

// define function Departments(encounter FHIR.Encounter):
// encounter.identifier.where(system = 'http://dktk.dkfz.de/fhir/sid/hki-department').value.first()

// `,
// };

const dhkiEncountersMeasureProd: FhirMeasureItem = {
  key: "encounters",
  measure: {
    code: {
      text: "Encounters",
    },
    extension: [
      {
        url: "http://hl7.org/fhir/us/cqfmeasures/StructureDefinition/cqfm-populationBasis",
        valueCode: "Encounter",
      },
    ],
    population: [
      {
        code: {
          coding: [
            {
              system:
                "http://terminology.hl7.org/CodeSystem/measure-population",
              code: "initial-population",
            },
          ],
        },
        criteria: {
          language: "text/cql-identifier",
          expression: "Encounter",
        },
      },
    ],
    stratifier: [
      {
        code: {
          text: "Departments",
        },
        criteria: {
          language: "text/cql",
          expression: "Departments",
        },
      },
    ],
  },
  cql: `
DHKI_STRAT_ENCOUNTER_STRATIFIER
`,
};

// const dhkiSpecimenMeasure: FhirMeasureItem = {
//   key: "specimen",
//   measure: {
//     code: {
//       text: "specimen",
//     },
//     extension: [
//       {
//         url: "http://hl7.org/fhir/us/cqfmeasures/StructureDefinition/cqfm-populationBasis",
//         valueCode: "Specimen",
//       },
//     ],
//     population: [
//       {
//         code: {
//           coding: [
//             {
//               system:
//                 "http://terminology.hl7.org/CodeSystem/measure-population",
//               code: "initial-population",
//             },
//           ],
//         },
//         criteria: {
//           language: "text/cql-identifier",
//           expression: "Specimen",
//         },
//       },
//     ],
//     stratifier: [
//       {
//         code: {
//           text: "sample_kind",
//         },
//         criteria: {
//           language: "text/cql",
//           expression: "SampleType",
//         },
//       },
//       {
//         code: {
//           text: "sample_subtype",
//         },
//         criteria: {
//           language: "text/cql",
//           expression: "SampleSubtype",
//         },
//       },
//       // {
//       //   code: {
//       //     text: 'sample_technology',
//       //   },
//       //   criteria: {
//       //     language: 'text/cql',
//       //     expression: 'SampleTechnology',
//       //   },
//       // },
//     ],
//   },
//   cql: `
// define Specimen:
// if InInitialPopulation then [Specimen] else {} as List<Specimen>

// define function SampleType(specimen FHIR.Specimen):
// specimen.type.coding.where(system = 'https://fhir.bbmri.de/CodeSystem/SampleMaterialType').code.first()

// define function SampleSubtype(specimen FHIR.Specimen):
// specimen.type.text.first()

// `,
// };

const dhkiSpecimenMeasureProd: FhirMeasureItem = {
  key: "specimen",
  measure: {
    code: {
      text: "specimen",
    },
    extension: [
      {
        url: "http://hl7.org/fhir/us/cqfmeasures/StructureDefinition/cqfm-populationBasis",
        valueCode: "Specimen",
      },
    ],
    population: [
      {
        code: {
          coding: [
            {
              system:
                "http://terminology.hl7.org/CodeSystem/measure-population",
              code: "initial-population",
            },
          ],
        },
        criteria: {
          language: "text/cql-identifier",
          expression: "Specimen",
        },
      },
    ],
    stratifier: [
      {
        code: {
          text: "sample_kind",
        },
        criteria: {
          language: "text/cql",
          expression: "SampleType",
        },
      },
      {
        code: {
          text: "sample_subtype",
        },
        criteria: {
          language: "text/cql",
          expression: "SampleSubtype",
        },
      },
      // {
      //   code: {
      //     text: 'sample_technology',
      //   },
      //   criteria: {
      //     language: 'text/cql',
      //     expression: 'SampleTechnology',
      //   },
      // },
    ],
  },
  cql: `
DHKI_STRAT_SPECIMEN_STRATIFIER
`,
};

// const dhkiMedicationStatementsMeasure: FhirMeasureItem = {
//   key: "medicationStatements",
//   measure: {
//     code: {
//       text: "medicationStatements",
//     },
//     extension: [
//       {
//         url: "http://hl7.org/fhir/us/cqfmeasures/StructureDefinition/cqfm-populationBasis",
//         valueCode: "MedicationStatement",
//       },
//     ],
//     population: [
//       {
//         code: {
//           coding: [
//             {
//               system:
//                 "http://terminology.hl7.org/CodeSystem/measure-population",
//               code: "initial-population",
//             },
//           ],
//         },
//         criteria: {
//           language: "text/cql-identifier",
//           expression: "MedicationStatement",
//         },
//       },
//     ],
//     stratifier: [
//       {
//         code: {
//           text: "MedicationType",
//         },
//         criteria: {
//           language: "text/cql",
//           expression: "ProcedureType",
//         },
//       },
//       {
//         code: {
//           text: "AppliedMedications",
//         },
//         criteria: {
//           language: "text/cql",
//           expression: "AppliedMedications",
//         },
//       },
//     ],
//   },
//   cql: `
// define MedicationStatement:
// if InInitialPopulation then [MedicationStatement] else {} as List <MedicationStatement>

// define function AppliedMedications(medication FHIR.MedicationStatement):
// medication.medication.coding.code.last()
// `,
// };

const dhkiMedicationStatementsMeasureProd: FhirMeasureItem = {
  key: "medicationStatements",
  measure: {
    code: {
      text: "medicationStatements",
    },
    extension: [
      {
        url: "http://hl7.org/fhir/us/cqfmeasures/StructureDefinition/cqfm-populationBasis",
        valueCode: "MedicationStatement",
      },
    ],
    population: [
      {
        code: {
          coding: [
            {
              system:
                "http://terminology.hl7.org/CodeSystem/measure-population",
              code: "initial-population",
            },
          ],
        },
        criteria: {
          language: "text/cql-identifier",
          expression: "MedicationStatement",
        },
      },
    ],
    stratifier: [
      {
        code: {
          text: "MedicationType",
        },
        criteria: {
          language: "text/cql",
          expression: "ProcedureType",
        },
      },
      {
        code: {
          text: "AppliedMedications",
        },
        criteria: {
          language: "text/cql",
          expression: "AppliedMedications",
        },
      },
    ],
  },
  cql: `
DHKI_STRAT_MEDICATION_STRATIFIER
`,
};

export const measures: FhirMeasureItem[] = [
  dktkPatientsMeasure,
  dktkDiagnosisMeasure,
  dhkiSpecimenMeasureProd,
  dktkProceduresMeasure,
  dhkiMedicationStatementsMeasureProd,
  dhkiEncountersMeasureProd,
];
