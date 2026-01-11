<script>
  import { onMount } from 'svelte';
  import { cssVariables } from '../../stores/theme.js';
  
  export let title = 'Jin Kuan';
  export let description = '';
  export let currentPath = '';
  
  let mounted = false;
  
  onMount(() => {
    mounted = true;
    // Apply theme variables to document root
    const root = document.documentElement;
    // Use setProperty to ensure CSS variables are properly set
    const vars = $cssVariables.trim().split('\n').filter(line => line.includes(':'));
    vars.forEach(varLine => {
      const [name, value] = varLine.split(':').map(s => s.trim());
      if (name && value && value.endsWith(';')) {
        root.style.setProperty(name, value.slice(0, -1));
      }
    });
  });
  
  $: isActive = (path) => {
    const cleanCurrent = currentPath.replace('/portfolio-site', '');
    const cleanPath = path.replace('/portfolio-site', '');
    return cleanCurrent === cleanPath || 
           (cleanPath !== '/' && cleanCurrent.startsWith(cleanPath));
  };
</script>

<svelte:head>
  <title>{title}</title>
  {#if description}
    <meta name="description" content={description} />
  {/if}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      {$cssVariables}
    }
  </style>
</svelte:head>

<div class="layout" class:mounted>
  <nav class="site-nav">
    <div class="nav-logo">JK</div>
    <div class="nav-links">
      <a href="/portfolio-site/" class:active={currentPath === '/portfolio-site/'}>Home</a>
      <a href="/portfolio-site/about" class:active={isActive('/about')}>About</a>
      <a href="/portfolio-site/practice" class:active={isActive('/practice')}>Practice</a>
      <a href="/portfolio-site/field-notes" class:active={isActive('/field-notes')}>Field Notes</a>
    </div>
  </nav>
  
  <div class="content-wrapper">
    <main>
      <slot />
    </main>
  </div>
</div>

<style>
  :global(html) {
    font-family: var(--font-serif);
    font-size: 18px;
    line-height: 1.6;
    color: var(--color-text);
    background-color: var(--color-bg);
  }
  
  :global(body) {
    margin: 0;
    padding: 2rem 1rem;
    font-family: var(--font-serif);
    color: var(--color-text);
    background-color: var(--color-bg);
  }

  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  .layout {
    display: flex;
    min-height: 100vh;
    opacity: 0;
    transition: opacity var(--transition-base);
  }
  
  .layout.mounted {
    opacity: 1;
  }
  
  .site-nav {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 250px;
    padding: 3rem 2rem;
    background-color: var(--color-bg);
    border-right: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    font-family: var(--font-sans);
    font-size: 0.9rem;
  }

  .nav-logo {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 3rem;
    color: var(--color-text);
  }

  .nav-links {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .site-nav a {
    color: var(--color-text);
    text-decoration: none;
    padding: 0.75rem 1rem;
    opacity: 0.6;
    transition: all 0.2s ease;
    position: relative;
    border-radius: 4px;
  }

  .site-nav a:hover {
    opacity: 1;
    background-color: var(--color-muted);
  }

  .site-nav a.active {
    opacity: 1;
    font-weight: 500;
    background-color: var(--color-muted);
  }

  .site-nav a.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 60%;
    background: var(--color-accent);
    border-radius: 2px;
  }

  .nav-footer {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding-top: 2rem;
    border-top: 1px solid var(--color-border);
  }

  .nav-footer a {
    font-size: 0.85rem;
  }

  .content-wrapper {
    margin-left: 250px;
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 0 2rem;
  }
  
  main {
    width: 100%;
    max-width: 900px;
    padding: 3rem 0;
  }

  /* Global typography styles that used to be in the old layout */
  :global(h1), :global(h2), :global(h3) {
    font-family: var(--font-serif);
    font-weight: 400;
    line-height: 1.3;
    margin: 2rem 0 1rem;
  }

  :global(h1) {
    font-size: 2.2rem;
    margin-bottom: 2rem;
  }

  :global(h2) {
    font-size: 1.8rem;
    margin-top: 3rem;
  }

  :global(h3) {
    font-size: 1.4rem;
  }

  :global(p) {
    margin-bottom: 1.5rem;
  }

  :global(a) {
    color: var(--color-accent);
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: border-color 0.2s ease;
  }

  :global(a:hover) {
    border-bottom-color: var(--color-accent);
  }

  :global(code) {
    font-family: 'Menlo', 'Monaco', monospace;
    font-size: 0.9em;
    background: rgba(0,0,0,0.04);
    padding: 0.1em 0.3em;
    border-radius: 3px;
  }

  :global(blockquote) {
    margin: 1.5rem 0;
    padding-left: 1.5rem;
    border-left: 3px solid var(--color-border);
    font-style: italic;
  }

  :global(hr) {
    border: none;
    border-top: 1px solid var(--color-border);
    margin: 3rem 0;
  }

  :global(ul), :global(ol) {
    margin-bottom: 1.5rem;
    padding-left: 1.5rem;
  }

  :global(li) {
    margin-bottom: 0.5rem;
  }
  
  footer {
    margin-top: 4rem;
    font-family: var(--font-sans);
    font-size: 0.9rem;
    text-align: center;
    opacity: 0.7;
  }

  footer hr {
    margin: 2rem 0 1rem;
  }

  footer a {
    color: inherit;
  }
  
  @media (max-width: 768px) {
    .site-nav a {
      margin-right: 1rem;
      font-size: 0.85rem;
    }
  }
</style>