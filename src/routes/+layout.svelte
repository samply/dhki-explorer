<script lang="ts">
  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href="/favicon.png" />
  <title>DKFZ-Hector Krebsinstitut - Explorer</title>
</svelte:head>

{@render children?.()}
