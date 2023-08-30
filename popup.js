/**
 * Select the current tab and its respective highlighted text.
 * @param {string} callback - Called when the selected text is obtained
 */
async function getSelectedIp(callback) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const tabId = tab.id;
    let result;

    try {
      [{ result }] = await chrome.scripting.executeScript({
        target: {tabId, allFrames: true},
        function: () => getSelection().toString(),
      });
    } catch (e) {
      renderStatus(`
          <h1>No IP Selected</h1>
          <p>Highlight a host or IP and then click the icon again for reverse-lookup information.  Happy stalking!</p>
      `);
      return; // ignoring an unsupported page like chrome://extensions
    }

    callback(result)
}

/**
 * Get the location of an IP address.
 * @param {string} searchAddress - IP or host being searched.
 * @param {function(string)} callback - Called when a location has been resolved
 * @param {function(string)} errorCallback - Called when the location is not found.
 *   The callback gets a string that describes the failure reason.
 */
async function getIpLocation(searchAddress, callback, errorCallback) {
  let searchUrl = 'http://ip-api.com/json/' + searchAddress;
  try {
    const response = await fetch(searchUrl);
    const data = await response.json();
    if (!data) {
      errorCallback('No response!');
      return;
    } else if (data.status === 'fail') {
      errorCallback('No response!');
      return;
    }
    callback(data);
  } catch (err) {
    errorCallback('Network error.');
  }
}

/**
 * Render results to the popup.
 * @param {*} statusText 
 */
function renderStatus(statusText) {
  const statusEl = document.getElementById('status');
  statusEl.innerHTML = statusText;
  statusEl.className += 'is-active';
}

document.addEventListener('DOMContentLoaded', () => {
  getSelectedIp((url) => {
    getIpLocation(url, (response) => {
      renderStatus(`
          <h1>Results For ${response.query}</h1>
          <table>
          <tr>
            <td class="label">Location:</td>
            <td title="${ response.city ? response.city + ', ' : ''} ${ response.regionName ? response.regionName + ', ' : ''} ${ response.countryCode ? response.countryCode : ''}">${ response.city ? response.city + ', ' : ''} ${ response.regionName ? response.regionName + ', ' : ''} ${ response.countryCode ? response.countryCode : ''}</td>
          </tr>
          <tr>
            <td class="label">ISP:</td>
            <td title="${ response.isp ? response.isp + ', ' : ''} ${ response.org ? response.org : ''}">${ response.isp ? response.isp + ', ' : ''} ${ response.org ? response.org : ''}</td>
          </tr>
          <tr>
            <td class="label">Google Maps:</td>
            <td><a href="https://www.google.com/maps/@${response.lat},${response.lon},13z" target="_blank">View Location</a></td>
          </tr>
          </table>
      `);
    }, (errorMessage) => {
      renderStatus(`
          <h1>Cannot locate host</h1>
          <p>Highlight a host or IP and then click the icon again for reverse-lookup information.  Happy stalking!</p>
      `);
    });
  });
});