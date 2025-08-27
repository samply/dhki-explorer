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

<header>
  <div class="header-wrapper">
    <h1>
      DKFZ Hector Cancer Institute <br /> at the University Medicine Mannheim
    </h1>
    <div class="logo">
      <img src="../logo-dkfz.svg" alt="DKFZ" />
    </div>
    <div class="logo">
      <img src="../logo_umm.svg" alt="UMM" />
    </div>
    <div class="logo">
      <img src="../logo_mfm_ukm.svg" alt="MFM" />
    </div>
    <div class="logo">
      <img src="../logo-hector.png" alt="Hector" />
    </div>
  </div>
</header>
<main>
  <div class="search">
    <div class="search-wrapper">
      <lens-search-bar noMatchesFoundMessage="keine Ergebnisse gefunden"
      ></lens-search-bar>
      <lens-query-explain-button></lens-query-explain-button>
      <lens-search-button title="Suchen"></lens-search-button>
    </div>
  </div>
  <div class="grid">
    <div class="catalogue-wrapper">
      <div class="catalogue">
        <lens-catalogue
          toggleIconUrl="right-arrow-svgrepo-com.svg"
          toggle={{ collapsable: false }}
          addIconUrl="long-right-arrow-svgrepo-com.svg"
        ></lens-catalogue>
      </div>
    </div>
    <div class="charts">
      <div class="chart-wrapper result-summary">
        <lens-result-summary></lens-result-summary>
        <lens-search-modified-display
          >Diagramme repräsentieren nicht mehr die aktuelle Suche!</lens-search-modified-display
        >
      </div>
      <div class="chart-wrapper chart-diagnosis">
        <lens-chart
          title="Diagnose"
          catalogueGroupCode="diagnosis"
          chartType="bar"
          indexAxis="y"
          groupingDivider="."
          groupingLabel=".%"
          filterRegex="^[CD].*"
          xAxisTitle="Anzahl der Diagnosen"
          yAxisTitle="ICD-10-Codes"
        ></lens-chart>
      </div>
      <div class="chart-wrapper">
        <lens-chart
          title="Geschlecht"
          catalogueGroupCode="gender"
          chartType="pie"
          displayLegends={true}
        ></lens-chart>
      </div>
      <div class="chart-wrapper chart-age-distribution">
        <lens-chart
          title="Alter bei Erstdiagnose"
          catalogueGroupCode="age_at_diagnosis"
          chartType="bar"
          groupRange={10}
          filterRegex="^(([0-9]?[0-9]$)|(1[0-2]0))"
          xAxisTitle="Alter"
          yAxisTitle="Anzahl der Primärdiagnosen"
        ></lens-chart>
      </div>
      <div class="chart-wrapper">
        <lens-chart
          title="Vitalstatus"
          catalogueGroupCode="75186-7"
          chartType="pie"
          displayLegends={true}
        ></lens-chart>
      </div>
      <div class="chart-wrapper">
        <lens-chart
          title="Therapieart"
          catalogueGroupCode="therapy_of_tumor"
          chartType="bar"
          xAxisTitle="Art der Therapie"
          yAxisTitle="Anzahl der Therapieeinträge"
        ></lens-chart>
      </div>
      <div class="chart-wrapper">
        <lens-chart
          title="Proben"
          catalogueGroupCode="sample_kind"
          chartType="bar"
          xAxisTitle="Probentypen"
          yAxisTitle="Probenanzahl"
          filterRegex="^(?!(tissue-other|buffy-coat|peripheral-blood-cells|dried-whole-blood|swab|ascites|stool-faeces|saliva|liquid-other|derivative-other))"
        >
        </lens-chart>
      </div>
    </div>
  </div>
</main>

<footer>
  <div>
    Made with ♥ and <a href="https://github.com/samply/lens">samply/lens</a>.
  </div>
  <div class="logo logo-footer">
    <img src="../dktk-en.png" alt="DKTK" />
  </div>
</footer>
