// popup.js
document.getElementById('fillForm').addEventListener('click', async () => {
    try {
        // Directly read from clipboard
        const text = await navigator.clipboard.readText();
        
        // Parse bracketed values
        const regex = /\[([\s\S]*?)\]/g;
        const matches = [...text.matchAll(regex)];
        const values = matches.map(match => match[1].trim());

        if (values.length === 0) {
            alert('No bracketed values found in the clipboard!');
            return;
        }

        // Send message to content script
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: fillForm,
                args: [values],
            });
        });

    } catch (err) {
        console.error('Failed to read clipboard:', err);
        alert('Unable to access clipboard. Please check permissions.');
    }
});

function fillForm(values) {
    // Helper function to check if a value was successfully set
    function isValueSet(element, value) {
        return element.value === value;
    }

    // Helper function to attempt setting a value
    function trySetValue(element, value) {
        try {
            const originalValue = element.value;
            element.value = value;
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));
            
            // Return true if value was successfully set
            return isValueSet(element, value);
        } catch (err) {
            console.error('Error setting value:', err);
            return false;
        }
    }

    // Get all potential input fields
    const inputs = Array.from(document.querySelectorAll('input, textarea, select, [contenteditable="true"]'))
        .filter(el => {
            if (el.tagName.toLowerCase() === 'input') {
                const type = el.type.toLowerCase();
                return !el.hidden && 
                       !el.disabled && 
                       type !== 'hidden' && 
                       type !== 'submit' && 
                       type !== 'button' && 
                       type !== 'file' &&
                       el.offsetParent !== null; // Check if element is visible
            }
            return !el.hidden && 
                   !el.disabled && 
                   el.offsetParent !== null;
        });

    if (inputs.length === 0) {
        alert('No form fields found!');
        return;
    }

    let successCount = 0;
    let currentInputIndex = 0;

    // Try to fill each value
    for (let value of values) {
        let success = false;
        
        // Keep trying next input fields until we successfully set the value
        while (currentInputIndex < inputs.length && !success) {
            const input = inputs[currentInputIndex];
            success = trySetValue(input, value);
            
            if (success) {
                successCount++;
            }
            currentInputIndex++;
        }
    }

    alert(`Successfully filled ${successCount} out of ${values.length} values!`);
}
