<script>
  export let notes = [];
  export let threads = [];
</script>

<aside class="related-content">
  <h3>Related Content</h3>
  
  {#if notes.length > 0}
    <section>
      <h4>Field Notes</h4>
      <ul>
        {#each notes as note}
          <li>
            <a href={note.url}>{note.title}</a>
          </li>
        {/each}
      </ul>
    </section>
  {/if}
  
  {#if threads.length > 0}
    <section>
      <h4>Threads</h4>
      <ul>
        {#each threads as thread}
          <li>
            <a href={thread.url}>{thread.title}</a>
          </li>
        {/each}
      </ul>
    </section>
  {/if}
  
  {#if notes.length === 0 && threads.length === 0}
    <p>No related content yet.</p>
    <nav>
      <a href="/portfolio-site/field-notes">Browse Field Notes</a>
      <a href="/portfolio-site/threads">Explore Threads</a>
    </nav>
  {/if}
</aside>

<style>
  .related-content {
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid var(--color-border);
  }
  
  h3 {
    font-size: 1.3rem;
    margin-bottom: 1.5rem;
  }
  
  section {
    margin-bottom: 2rem;
  }
  
  h4 {
    font-family: var(--font-sans);
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    opacity: 0.6;
    margin-bottom: 1rem;
  }
  
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  li {
    margin-bottom: 0.75rem;
  }
  
  a {
    color: var(--color-accent);
    text-decoration: none;
    transition: opacity var(--transition-fast);
  }
  
  a:hover {
    opacity: 0.8;
    text-decoration: underline;
  }
  
  p {
    opacity: 0.6;
    margin-bottom: 1rem;
  }
  
  nav {
    display: flex;
    gap: 2rem;
    font-family: var(--font-sans);
    font-size: 0.9rem;
  }
</style>