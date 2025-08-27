<script lang="ts">
  // import "./app.css";
  import { onMount } from "svelte";
  import {
    setOptions,
    setCatalogue,
    getAst,
    clearSiteResults,
    buildLibrary,
    buildMeasure,
    querySpot,
    setSiteResult,
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
        // markSiteClaimed(site);
      } else if (result.status === "succeeded") {
        const siteResult = JSON.parse(atob(result.body));
        setSiteResult(site, siteResult);
      } else {
        console.error(
          `Site ${site} failed with status ${result.status}:`,
          result.body,
        );
      }
    });
  });
</script>

<!-- <lens-search-button></lens-search-button>
<lens-query-explain-button></lens-query-explain-button>
<lens-search-bar></lens-search-bar>
<lens-catalogue toggle={{collapsable: false}}></lens-catalogue>
<lens-chart
    title="Gender distribution"
    dataKey="gender"
    chartType="pie"
    displayLegends="{true}"
></lens-chart> -->

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
  <lens-search-button></lens-search-button>
</div>
<div id="main-grid">
  <div id="catalogue" class="card">
    <lens-catalogue toggle={{ collapsable: false }}></lens-catalogue>
  </div>
  <div id="result-summary" class="card">
    <lens-result-summary></lens-result-summary>
  </div>
  <div id="chart-gender" class="card">
    <lens-chart
      title="Gender distribution"
      dataKey="gender"
      chartType="pie"
      displayLegends={true}
    ></lens-chart>
  </div>
  <div id="chart-age" class="card">
    <lens-chart
      title="Age distribution"
      dataKey="age_at_diagnosis"
      chartType="bar"
      xAxisTitle="Age"
      yAxisTitle="Patients"
    ></lens-chart>
  </div>
  <div id="chart-therapy" class="card">
    <lens-chart
      title="Type of therapy"
      dataKey="therapy_of_tumor"
      chartType="bar"
      xAxisTitle="Type of Therapy"
      yAxisTitle="Therapies"
    ></lens-chart>
  </div>
</div>
<footer class="card">
  <p>
    Made with ♥ and <a href="https://github.com/samply/lens">samply/lens</a>
  </p>
  <img src="../dktk-en.png" alt="DKTK" />
</footer>

<style>
  :root {
    background-color: #f8f8ff;
  }

  .card {
    background-color: white;
    border-radius: var(--border-radius-small);
    border: 1px solid var(--lightest-gray);
    padding: var(--gap-xs);
  }

  header {
    margin: var(--gap-xs);
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
    margin: var(--gap-xs);
    display: flex;
    gap: var(--gap-xs);
    lens-search-bar {
      flex-grow: 1;
    }
  }

  #main-grid {
    margin: var(--gap-xs);
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: var(--gap-xs);

    #catalogue {
      grid-column: 1 / 2;
      grid-row: 1 / 3;
    }

    #result-summary {
      grid-column: 2 / -1;
      grid-row: 1 / 2;
    }
  }

  footer {
    margin: var(--gap-xs);
    display: flex;
    justify-content: space-between;
    align-items: center;

    img {
      max-height: 3rem;
    }
  }
</style>
