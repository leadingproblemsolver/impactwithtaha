const button = document.getElementById('copy-prompt');
const prompt = document.getElementById('prompt');
const status = document.getElementById('status');

button?.addEventListener('click', async () => {
  const text = prompt?.innerText || '';
  if (!text) return;

  try {
    if (!navigator.clipboard || !window.isSecureContext) throw new Error('clipboard unavailable');
    await navigator.clipboard.writeText(text);
    status.textContent = 'Copied — paste it into your reply.';
  } catch {
    status.textContent = 'Select the five lines above and copy them.';
  }
});
