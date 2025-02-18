# One-Click Form Filler Chrome Extension

A Chrome extension that automatically fills form fields using bracketed values from your clipboard. Available in two versions: with a popup interface and without (click-to-fill).

## Features

- Automatically fills form fields with values from clipboard
- Supports multiple input types (text inputs, textareas, select elements, contenteditable fields)
- Smart field detection (ignores hidden, disabled, and non-input elements)
- Event simulation for proper form behavior
- Error handling and success notifications
- Two implementation variants:
  - Popup interface version
  - Direct click-to-fill version

## Installation

1. Clone the repository:
```bash
git clone https://github.com/SakibAhmedShuva/One-Click-Form-Filler-Chrome-Extension.git
```

2. Choose your preferred version:
   - `with-popup/`: Version with popup interface
   - `without-popup/`: Version with direct click functionality

3. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked"
   - Select either the `with-popup` or `without-popup` directory

## Usage

### Data Format
The extension expects clipboard data in the following format:
```
[value1][value2][value3]
```
Each value should be enclosed in square brackets.

### With Popup Version
1. Copy your bracketed values to clipboard
2. Click the extension icon to open the popup
3. Click "Fill Form from Clipboard"
4. The extension will automatically fill the form fields

### Without Popup Version
1. Copy your bracketed values to clipboard
2. Simply click the extension icon
3. The form fields will be filled automatically

## Technical Details

### File Structure

#### With Popup Version
```
with-popup/
├── manifest.json
├── popup.html
├── popup.js
├── icon.png
```

#### Without Popup Version
```
without-popup/
├── manifest.json
├── background.js
├── icon.png
```

### Permissions
The extension requires the following permissions:
- `activeTab`: To access the current tab's content
- `scripting`: To inject and execute scripts
- `clipboardRead`: To access clipboard content

### Key Components

#### Form Field Detection
The extension identifies fillable form fields using the following criteria:
```javascript
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
                   el.offsetParent !== null;
        }
        return !el.hidden && 
               !el.disabled && 
               el.offsetParent !== null;
    });
```

#### Value Setting
The extension uses a robust value-setting mechanism:
```javascript
function trySetValue(element, value) {
    try {
        element.value = value;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        return element.value === value;
    } catch (err) {
        console.error('Error setting value:', err);
        return false;
    }
}
```

### Error Handling
The extension implements comprehensive error handling:
- Clipboard access errors
- Empty clipboard detection
- Invalid data format handling
- Form field access errors
- Value setting failures

## Limitations

- Cannot fill file input fields
- Requires values to be in correct bracket format
- May not work with dynamically generated forms that use custom input implementations
- Cannot access fields in iframes or shadow DOM
- Limited to visible and enabled form fields

## Browser Compatibility

- Chrome 88+
- Compatible with Manifest V3
- May work in other Chromium-based browsers (Edge, Brave, etc.)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
