<script>
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  
  let visible = false;
  
  onMount(() => {
    visible = true;
  });
</script>

{#if visible}
  <div transition:fade={{ duration: 200 }}>
    <slot />
  </div>
{/if}