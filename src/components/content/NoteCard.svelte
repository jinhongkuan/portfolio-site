<script>
  export let title;
  export let description;
  export let href;
  export let type = '';
</script>

<a href={href} class="note-card" class:fieldwork={type === 'fieldwork'} class:armchair={type === 'armchair'}>
  <h3>{title}</h3>
  <p class="note-preview">{description}</p>
  <span class="note-link">Read more →</span>
</a>

<style>
  .note-card {
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
    background: var(--color-muted);
    border-radius: 4px;
    text-decoration: none;
    color: inherit;
    transition: all var(--transition-fast);
    border: 1px solid transparent;
    height: 100%;
  }

  .note-card:hover {
    background: var(--color-muted);
    border-color: var(--color-border);
  }

  .note-card h3 {
    margin: 0 0 1rem 0;
    font-size: 1.3rem;
    font-weight: 500;
    line-height: 1.3;
    font-family: var(--font-serif);
  }

  .note-preview {
    flex: 1;
    font-size: 0.95rem;
    line-height: 1.6;
    opacity: 0.75;
    margin-bottom: 1rem;
  }

  .note-link {
    font-family: var(--font-sans);
    font-size: 0.85rem;
    color: var(--color-accent);
    font-weight: 500;
  }
</style>