chrome.action.onClicked.addListener(async (tab) => {
  try {
    // Read clipboard text
    const text = await navigator.clipboard.readText();
    
    // Check for empty clipboard
    if (!text.trim()) {
      alert('Clipboard is empty!');
      return;
    }

    // Enhanced regex to handle multi-line values
    const values = text.match(/\[([^\]]+)\]/g)?.map(m => m.slice(1, -1)) || [];
    
    if (values.length === 0) {
      alert('No bracketed values found in clipboard!');
      return;
    }

    // Execute content script
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      args: [values],
      func: (values) => {
        // Enhanced input detection
        const inputs = Array.from(document.querySelectorAll('input, textarea, select'))
          .filter(el => {
            const type = el.type.toLowerCase();
            return !el.hidden && 
                   !el.disabled && 
                   type !== 'hidden' && 
                   type !== 'submit' && 
                   type !== 'button';
          });

        if (inputs.length === 0) {
          alert('No form fields found!');
          return;
        }

        // Fill values with better error handling
        values.forEach((value, index) => {
          try {
            if (inputs[index]) {
              inputs[index].value = value;
              inputs[index].dispatchEvent(new Event('input', { bubbles: true }));
              inputs[index].dispatchEvent(new Event('change', { bubbles: true }));
            }
          } catch (err) {
            console.error(`Error filling field ${index}:`, err);
          }
        });

        alert(`Successfully filled ${Math.min(values.length, inputs.length)} fields!`);
      }
    });
  } catch (err) {
    console.error('Auto-fill error:', err);
    alert(`Error: ${err.message}`);
  }
});