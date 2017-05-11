/**
 * @param {string} callback - Called when the selected text is obtained
 */
function getSelectedIp(callback) {
  chrome.tabs.executeScript({
    code: "window.getSelection().toString();"
  }, (selection) => {
    if (selection) {
      callback(selection[0] || 'google.com');
    } else {
      renderStatus(`
          <h1>No IP Selected</h1>
          <p>Highlight a host or IP and then click the icon again for reverse-lookup information.  Happy stalking!</p>
      `);
    }
  });
}

/**
 * @param {string} searchAddress - IP or host being searched.
 * @param {function(string)} callback - Called when a location has been resolved
 * @param {function(string)} errorCallback - Called when the location is not found.
 *   The callback gets a string that describes the failure reason.
 */
function getIpLocation(searchAddress, callback, errorCallback) {
  let searchUrl = 'http://ip-api.com/json/' + searchAddress;
  let x = new XMLHttpRequest();
  x.open('GET', searchUrl);
  x.responseType = 'json';
  x.onload = () => {
    const response = x.response;
    if (!response) {
      errorCallback('No response!');
      return;
    }
    callback(response);
  };
  x.onerror = () => {
    errorCallback('Network error.');
  };
  x.send();
}

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
      renderStatus('Cannot locate host. ' + errorMessage);
    });
  });
});