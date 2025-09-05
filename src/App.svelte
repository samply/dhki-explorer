<script lang="ts">
  import { onMount } from "svelte";
  import {
    setOptions,
    setCatalogue,
    getAst,
    clearSiteResults,
    resetDiagrams,
    buildLibrary,
    buildMeasure,
    querySpot,
    setSiteResult,
    markSiteClaimed,
    getQueryStore,
    type SpotResult,
    type LensOptions,
    type Catalogue,
  } from "@samply/lens";
  import options from "./config/options.json";
  import catalogue from "./config/catalogue.json";
  import { measures } from "./lib/measures";
  import { translateAstToCql } from "$lib/ast-to-cql-translator";
  import { env } from "$env/dynamic/public";

  onMount(() => {
    let opt: LensOptions = options;
    if (env.PUBLIC_SPOT_URL) {
      opt.spotUrl = env.PUBLIC_SPOT_URL;
    }
    setOptions(opt);

    setCatalogue(catalogue as Catalogue);
  });

  let consentSpecificChartsVisible = $state(false);
  let departments: Record<string, number> = $state({});

  function updateDepartments(depts: Record<string, number>) {
    const mapping = {
      "UMM/ Chirurgische Klinik": "Surgery",
      "UMM/Dermatologie, Venerologie, Allergologie":
        "Dermatology, Venereology and Allergology",
      "UMM/ Frauenklinik": "Gynecology & Obstetrics",
      "UMM/ Klinik fÃ¼r Urologie": "Urology",
      "UMM/ Klinik fÃ¼r Strahlentherapie und Radioonkologie":
        "Radiotherapy and radiooncology",
      "UMM/ 2. Medizinische Klinik/Gastroenterologie":
        "II. Department of Medicine",
      "UMM/ 3. Medizinische Klinik/ TTZ":
        "III. Department of Medicine / TTZ / Personalized Medical Oncology",
      "UMM/ Radiologie und Nuklearmedizin": "Radiology and nuclear medicine",
      // "???": "Transfusion Medicine and Immunology",
      "UMM/ Klinik für Urologie": "Urology",
      // manually set in ETL Prozess for onkostar datasets
      "HKI - Personalisierte Onkologie":
        "Translational Clinical Trial Unit at DKFZ Hector CI",
      // right now not associated with hector
      // "UMM/ Augenklinik": "Augenklinik",
      // "UMM/ Hals-Nasen-Ohren-Klinik": "Ear, nose and throat department",
      // "UMM/ Neurochirurgische Klinik": "Neurosurgery",
      // "UMM/Neurologie": "Neurology",
      // "UMM/ OrthopÃ¤disch-Unfallchirurgisches Zentrum (OUZ)": "Orthopaedic Surgery",
      // "UMM/PÃ¤diatrie": "Pediatrics",
      // "UMM/Zentrale InterdisziplinÃ¤re Endoskopie": "Zentrale Interdisziplinäre Endoskopie",
      // "Externer Melder": "Externer Melder",
    };

    for (const [key, mappedKey] of Object.entries(mapping)) {
      if (depts[key]) {
        departments[mappedKey] = departments[mappedKey]
          ? departments[mappedKey] + depts[key]
          : depts[key];
      }
    }
  }

  function groupDiagnoses(
    diagnoses: Record<string, number>,
  ): Record<string, number> {
    const mapping: Record<string, string> = {
      C32: "Larynx",
      C15: "Esophagus",
      C16: "Stomach",
      C18: "Intestine",
      C19: "Intestine",
      C20: "Intestine",
      C21: "Intestine",
      C22: "Liver",
      C23: "Gall Bladder",
      C24: "Gall Bladder",
      C25: "Pancreas",
      C33: "Lung",
      C34: "Lung",
      C43: "Malignant Melanoma",
      C40: "Tissue",
      C41: "Tissue",
      C45: "Tissue",
      C46: "Tissue",
      C47: "Tissue",
      C48: "Tissue",
      C49: "Tissue",
      D05: "DCIS",
      C50: "Breast",
      C51: "Vulva",
      C53: "Cervix",
      C54: "Uterus",
      C55: "Uterus",
      C56: "Ovary",
      C61: "Prostate",
      C62: "Testes",
      C64: "Kidney",
      C67: "Urinary Bladder",
      C70: "CNS",
      C71: "CNS",
      C72: "CNS",
      C73: "Thyroid",
      C81: "Morbus Hodgkin",
      C82: "NHL",
      C83: "NHL",
      C84: "NHL",
      C85: "NHL",
      C90: "Plasmocytoma",
      C91: "Leukemias",
      C92: "Leukemias",
      C93: "Leukemias",
      C94: "Leukemias",
      C95: "Leukemias",
      C86: "Hematological",
      C87: "Hematological",
      C88: "Hematological",
      C96: "Hematological",
      C44: "Skin other",
    };

    const grouped: Record<string, number> = {};
    for (const [diagnosis, count] of Object.entries(diagnoses)) {
      const category = diagnosis.split(".")[0];
      const mappedCategory = mapping[category];
      if (mappedCategory) {
        grouped[mappedCategory] = (grouped[mappedCategory] ?? 0) + count;
      }
    }
    return grouped;
  }

  function updateChartVisibility() {
    const query = getQueryStore();
    // Only one search bar
    const bar = query[0];

    consentSpecificChartsVisible = bar.some(
      (item) => item.key === "consent-hki",
    );
  }

  let abortController = new AbortController();
  window.addEventListener("lens-search-triggered", () => {
    console.log("AST:", JSON.stringify(getAst()));

    abortController.abort();
    abortController = new AbortController();

    // AST to CQL translation
    const cql = translateAstToCql(
      getAst(),
      false,
      "DKTK_STRAT_DEF_IN_INITIAL_POPULATION",
      measures,
    );
    const lib = buildLibrary(cql);
    const measure = buildMeasure(
      lib.url,
      measures.map((m) => m.measure),
    );

    clearSiteResults();
    resetDiagrams();
    updateChartVisibility();
    departments = {};
    const query = btoa(
      JSON.stringify({
        lang: "cql",
        lib,
        measure,
      }),
    );
    querySpot(query, abortController.signal, (result: SpotResult) => {
      const site = result.from.split(".")[1];
      if (result.status === "claimed") {
        markSiteClaimed(site);
      } else if (result.status === "succeeded") {
        const siteResult = JSON.parse(atob(result.body));
        console.log(siteResult);
        siteResult.stratifiers.diagnosis = groupDiagnoses(
          siteResult.stratifiers.diagnosis,
        );
        setSiteResult(site, siteResult);
        updateDepartments(siteResult.stratifiers.Departments);
      } else {
        console.error(
          `Site ${site} failed with status ${result.status}:`,
          result.body,
        );
      }
    });
  });
</script>

<div id="main-wrapper">
  <header class="card">
    <h1>DKFZ Hector Cancer Institute at the University Medicine Mannheim</h1>
    <img src="../logo-dkfz.svg" alt="DKFZ" />
    <img src="../logo_umm.svg" alt="UMM" />
    <img src="../logo_mfm_ukm.svg" alt="MFM" />
    <img src="../logo-hector.png" alt="Hector" />
  </header>
  <div id="search-wrapper">
    <lens-search-bar></lens-search-bar>
    <lens-query-explain-button></lens-query-explain-button>
    <lens-query-spinner></lens-query-spinner>
    <lens-search-button></lens-search-button>
  </div>
  <div id="catalogue-and-grid-wrapper">
    <div id="catalogue" class="card">
      <lens-catalogue toggle={{ collapsable: false }}></lens-catalogue>
    </div>
    <div id="main-grid">
      <div id="result-summary" class="card">
        <lens-result-summary></lens-result-summary>
        <!-- <lens-search-modified-display></lens-search-modified-display> -->
      </div>
      <div id="department-table" class="card">
        <h4>Associated Members</h4>
        <table>
          <thead>
            <tr>
              <th>Site</th>
              <th>Cases</th>
            </tr>
          </thead>
          <tbody>
            {#each Object.entries(departments).sort((a, b) => b[1] - a[1]) as [dept, count] (dept)}
              <tr>
                <td>{dept}</td>
                <td>{count}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      <div class="card">
        <lens-chart
          title="Gender distribution"
          dataKey="Gender"
          chartType="pie"
          displayLegends={true}
        ></lens-chart>
      </div>
      <div class="card">
        <lens-chart
          title="Age distribution"
          dataKey="Age"
          chartType="bar"
          backgroundColor={["#4dc9f6", "#3da4c7"]}
          xAxisTitle="Age"
          yAxisTitle="Patients"
          groupRange={10}
        ></lens-chart>
      </div>
      <div class="card">
        <lens-chart
          title="Type of therapy"
          dataKey="ProcedureType"
          chartType="bar"
          backgroundColor={["#4dc9f6", "#3da4c7"]}
          xAxisTitle="Type of Therapy"
          yAxisTitle="Therapies"
        ></lens-chart>
      </div>
      <div class="card">
        <lens-chart
          title="Systemic Therapy"
          dataKey="MedicationType"
          chartType="bar"
          backgroundColor={["#4dc9f6", "#3da4c7"]}
          xAxisTitle="Type of Therapy"
          yAxisTitle="Therapies"
        ></lens-chart>
      </div>

      {#if consentSpecificChartsVisible}
        <div class="card">
          <lens-chart
            title="Medications"
            dataKey="AppliedMedications"
            chartType="bar"
            backgroundColor={["#4dc9f6", "#3da4c7"]}
            xAxisTitle="Medication"
            yAxisTitle="Therapies"
          ></lens-chart>
        </div>
        <div class="card">
          <lens-chart
            title="Specimen"
            dataKey="sample_kind"
            chartType="bar"
            backgroundColor={["#4dc9f6", "#3da4c7"]}
            xAxisTitle="Specimen Type"
            yAxisTitle="Specimen"
          ></lens-chart>
        </div>
        <div class="card">
          <lens-chart
            title="Specimen Subtypes"
            dataKey="sample_subtype"
            chartType="bar"
            backgroundColor={["#4dc9f6", "#3da4c7"]}
            xAxisTitle="Specimen Subtype"
            yAxisTitle="Specimen"
          ></lens-chart>
        </div>
      {/if}

      <div id="chart-diagnosis" class="card">
        <lens-chart
          title="Diagnosis"
          dataKey="diagnosis"
          chartType="bar"
          backgroundColor={["#4dc9f6", "#3da4c7"]}
          xAxisTitle="ICD-10 Code"
          yAxisTitle="Diagnoses"
        ></lens-chart>
      </div>
    </div>
  </div>
  <footer class="card">
    <p>
      Made with ♥ and <a href="https://github.com/samply/lens">samply/lens</a>
    </p>
    <img src="../dktk-en.png" alt="DKTK" />
  </footer>
</div>

<style>
  #main-wrapper {
    padding: var(--gap-xs);
    gap: var(--gap-xs);
    background-color: #f8f8ff;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .card {
    background-color: white;
    border-radius: var(--border-radius-small);
    border: 1px solid var(--lightest-gray);
    padding: var(--gap-xs);
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h1 {
      color: var(--blue);
    }
    img {
      max-height: 5rem;
    }
  }

  #search-wrapper {
    display: flex;
    gap: var(--gap-xs);
    align-items: center;
    lens-search-bar {
      flex: 1;
    }
  }

  #catalogue-and-grid-wrapper {
    flex: 1;
    overflow: hidden;
    display: flex;
    gap: var(--gap-xs);
  }

  #catalogue {
    flex: 1;
    max-width: 30rem;
    overflow-y: auto;
  }

  #main-grid {
    flex: 1;
    overflow-y: auto;

    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--gap-xs);

    #result-summary {
      grid-column: 1 / -1;
    }

    #department-table {
      table {
        width: 100%;
        border-collapse: collapse;
        td,
        th {
          text-align: left;
          padding: var(--gap-xs);
          border-top: 1px solid var(--lightest-gray);
          border-bottom: 1px solid var(--lightest-gray);
        }
      }
    }

    #chart-diagnosis {
      grid-column: span 3;
      /* min-height: 25rem; */
    }
  }

  footer {
    display: flex;
    justify-content: space-between;
    align-items: center;

    img {
      max-height: 3rem;
    }
  }
</style>
