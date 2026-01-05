<script>
  export let title;
  export let showLine = true;
  export let count = '';
</script>

<div class="section-header">
  <h2>{title}</h2>
  {#if count}
    <span class="section-count">{count}</span>
  {/if}
  {#if showLine}
    <div class="section-line"></div>
  {/if}
</div>

<style>
  .section-header {
    display: flex;
    align-items: center;
    margin-bottom: 2rem;
    margin-top: 4rem;
  }

  .section-header h2 {
    margin: 0;
    margin-right: 1.5rem;
    font-size: 1.2rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-family: var(--font-sans);
    font-weight: 500;
    white-space: nowrap;
  }

  .section-count {
    font-family: var(--font-sans);
    font-size: 0.9rem;
    opacity: 0.6;
    margin-right: 1.5rem;
  }

  .section-line {
    flex: 1;
    height: 1px;
    background: var(--color-border);
  }
</style>