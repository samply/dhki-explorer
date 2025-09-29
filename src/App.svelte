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
    hideFailedSite,
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
  let includeTestDataChecked = $state(false);
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
      "HKI - Personalisierte Onkologie": "Test data",
      // manually set in ETL Prozess for onkostar datasets
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
      C32: "Malignant neoplasm of larynx",
      C15: "Malignant neoplasm of esophagus",
      C16: "Malignant neoplasm of stomach",
      C18: "Malignant neoplasm of colon",
      C19: "Malignant neoplasm of rectosigmoid junction",
      C20: "Malignant neoplasm of rectum",
      C21: "Malignant neoplasm of anus and anal canal",
      C22: "Malignant neoplasm of liver and intrahepatic bile ducts",
      C23: "Malignant neoplasm of gallbladder",
      C24: "Malignant neoplasm of other and unspecified parts of biliary tract",
      C25: "Malignant neoplasm of pancreas",
      C33: "Malignant neoplasm of trachea",
      C34: "Malignant neoplasm of bronchus and lung",
      C37: "Malignant neoplasm of thymus",
      C43: "Malignant melanoma of skin",
      C40: "Malignant neoplasm of bone and articular cartilage of limbs",
      C41: "Malignant neoplasm of bone and articular cartilage of other and unspecified sites",
      C45: "Mesothelioma",
      C46: "Kaposi's sarcoma",
      C47: "Malignant neoplasm of peripheral nerves and autonomic nervous system",
      C48: "Malignant neoplasm of retroperitoneum and peritoneum",
      C49: "Malignant neoplasm of other connective and soft tissue",
      C50: "Malignant neoplasms of breast",
      C51: "Malignant neoplasm of vagina",
      C53: "Malignant neoplasm of cervix uteri",
      C54: "Malignant neoplasm of corpus uteri",
      C55: "Malignant neoplasm of uterus, part unspecified",
      C56: "Malignant neoplasm of ovary",
      C61: "Malignant neoplasm of prostate",
      C62: "Malignant neoplasm of testis",
      C64: "Malignant neoplasm of kidney, except renal pelvis",
      C67: "Malignant neoplasm of bladder",
      C70: "Malignant neoplasm of meninges",
      C71: "Malignant neoplasm of brain",
      C72: "Malignant neoplasm of spinal cord, cranial nerves and other parts of central nervous system",
      C73: "Malignant neoplasm of thyroid gland",
      C80: "Malignant neoplasm without specification of site",
      C81: "Hodgkin lymphoma",
      C82: "Follicular lymphoma",
      C83: "Non-follicular lymphoma",
      C84: "Mature T/NK-cell lymphomas",
      C85: "Other specified and unspecified types of non-Hodgkin lymphoma",
      C86: "Other specified types of T/NK-cell lymphoma",
      // Does not seem to exist: https://www.icd-code.de/suche/icd/recherche.html?sp=0&sp=SC87
      // C87: "Hematological",
      C88: "Malignant immunoproliferative diseases and certain other B-cell lymphomas",
      C90: "Multiple myeloma and malignant plasma cell neoplasms",
      C91: "Lymphoid leukemia",
      C92: "Myeloid leukemia",
      C93: "Monocytic leukemia",
      C94: "Other leukemias of specified cell type",
      C95: "Leukemia of unspecified cell type",
      C96: "Other and unspecified malignant neoplasms of lymphoid, hematopoietic and related tissue",
      C44: "Other and unspecified malignant neoplasm of skin",
      D05: "Carcinoma in situ of breast",
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

    /** Helper function to base64 encode a UTF-8 string */
    const base64Encode = (utf8String: string) =>
      btoa(String.fromCharCode(...new TextEncoder().encode(utf8String)));

    const query = base64Encode(
      JSON.stringify({
        lang: "cql",
        lib,
        measure,
      }),
    );

    // Copy the value so it doesn't change mid-query
    const includeTestData = includeTestDataChecked;
    querySpot(query, abortController.signal, (result: SpotResult) => {
      const site = result.from.split(".")[1];

      if (site === "dkfz-test" && !includeTestData) {
        return;
      }

      if (result.status === "claimed") {
        markSiteClaimed(site);
      } else if (result.status === "succeeded") {
        const siteResult = JSON.parse(atob(result.body));
        console.log(`Site ${site} succeeded:`, siteResult);
        siteResult.stratifiers.diagnosis = groupDiagnoses(
          siteResult.stratifiers.diagnosis,
        );
        setSiteResult(site, siteResult);
        updateDepartments(siteResult.stratifiers.Departments);
      } else {
        hideFailedSite(site);
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
    <label>
      <input type="checkbox" bind:checked={includeTestDataChecked} />
      Include test data
    </label>
    <lens-query-spinner></lens-query-spinner>
    <lens-search-button></lens-search-button>
  </div>
  <div id="catalogue-and-grid-wrapper">
    <div id="catalogue" class="card">
      <lens-catalogue toggle={{ collapsable: false }}></lens-catalogue>
    </div>
    <div id="main-grid">
      <!-- <div id="result-summary" class="card"> -->
      <!-- <lens-result-summary></lens-result-summary> -->
      <!-- <!-- <lens-search-modified-display></lens-search-modified-display> -->
      <!-- </div> -->
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
      <!-- <div class="card">
        <lens-chart
          title="Gender distribution"
          dataKey="Gender"
          chartType="pie"
          displayLegends={true}
        ></lens-chart>
      </div> -->
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

<lens-toast></lens-toast>

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
