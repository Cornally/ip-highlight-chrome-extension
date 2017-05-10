/**
 * @param {string} callback - Called when the selected text is obtained
 */
function getSelectedIp(callback) {
  chrome.tabs.executeScript({
    code: "window.getSelection().toString();"
  }, (selection) => {
    callback(selection[0] || 'google.com');
  });
}

/**
 * @param {string} searchAddress - IP or host being searched.
 * @param {function(string)} callback - Called when a location has been resolved
 * @param {function(string)} errorCallback - Called when the location is not found.
 *   The callback gets a string that describes the failure reason.
 */
function getIpLocation(searchAddress, callback, errorCallback) {
  let searchUrl = 'http://freegeoip.net/json/' + searchAddress;
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
  statusEl.textContent = statusText;
  statusEl.className += 'is-active';
}

document.addEventListener('DOMContentLoaded', () => {
  getSelectedIp((url) => {
    getIpLocation(url, (response) => {
      renderStatus(`${response.city}, ${response.region_code}, ${response.country_code}`);
    }, (errorMessage) => {
      renderStatus('Cannot locate host. ' + errorMessage);
    });
  });
});