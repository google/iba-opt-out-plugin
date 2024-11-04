/**
 * @license
 * Copyright 2010 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** @const */
const DOUBLECLICK_DOMAIN = 'doubleclick.net';

/** @const */
const DOUBLECLICK_URL = 'https://' + DOUBLECLICK_DOMAIN;

/** @const */
const OPT_OUT_COOKIE_NAME = 'id';

/** @const */
const OPT_OUT_COOKIE_VALUE = 'OPT_OUT';

/** @const */
const IDE_COOKIE_NAME = 'IDE';

/**
 * Opt-out cookie expiration time.
 * 2042-06-09 06:09:42
 *
 * @const
 */
const COOKIE_EXPIRATION_DATE = 2285906982;

/**
 * Main class of the plugin. After initialization listens to events of cookie
 * changes and keeps the IDE cookie removed and the id cookie set to "OPT_OUT".
 * @unrestricted
 */
class AdvertisingOptOutPlugin {
  constructor() {
    // Search all stores & opt out and remove IDE cookie from each
    chrome.cookies.getAllCookieStores(function(cookieStores) {
      for (let i = 0; i < cookieStores.length; i++) {
        const storeId = cookieStores[i].id;

        this.removeIdeCookie_(storeId);
        this.setIdCookie_(storeId);
      }
    }.bind(this));

    // Add cookie change event listener
    chrome.cookies.onChanged.addListener(
        this.cookieChangedListener_.bind(this));
  }

  /**
   * Set the opt-out cookie.
   *
   * @param {string} storeId Cookie store where the cookie should be stored.
   * @private
   */
  setIdCookie_(storeId) {
    const details = {
      name: OPT_OUT_COOKIE_NAME,
      url: DOUBLECLICK_URL,
      storeId: storeId
    };

    chrome.cookies.get(details, function(cookie) {
      if (cookie && cookie.value == OPT_OUT_COOKIE_VALUE) {
        return;
      }

      const optOutCookie = {
        name: OPT_OUT_COOKIE_NAME,
        value: OPT_OUT_COOKIE_VALUE,
        domain: '.' + DOUBLECLICK_DOMAIN,
        url: DOUBLECLICK_URL,
        expirationDate: COOKIE_EXPIRATION_DATE,
        sameSite: 'no_restriction',
        secure: true,
        storeId: storeId
      };

      chrome.cookies.set(optOutCookie);
    }.bind(this));
  }

  /**
   * Removes the IDE cookie from given cookie store.
   *
   * @param {string} storeId Cookie store from which cookie should be removed.
   * @private
   */
  removeIdeCookie_(storeId) {
    const details = {
      name: IDE_COOKIE_NAME,
      url: DOUBLECLICK_URL,
      storeId: storeId
    };

    chrome.cookies.get(details, function(cookie) {
      if (!cookie) {
        return;
      }

      const cookieToRemove = {
        url: DOUBLECLICK_URL + cookie.path,
        name: cookie.name,
        storeId: storeId
      };

      chrome.cookies.remove(cookieToRemove);
    }.bind(this));
  }

  /**
   * Listener for cookies.onChanged.
   *
   * @param {!object} event Information about the cookie that was changed.
   * @private
   */
  cookieChangedListener_(event) {
    if (event.cookie.domain != '.' + DOUBLECLICK_DOMAIN) {
      return;
    }

    if (event.cookie.name == IDE_COOKIE_NAME && !event.removed) {
      // In case IDE cookie is set, remove it immediately and set OPT_OUT
      // cookie.
      this.removeIdeCookie_(event.cookie.storeId);
      this.setIdCookie_(event.cookie.storeId);
    } else if (
        event.cookie.name == OPT_OUT_COOKIE_NAME &&
        (event.cookie.value != OPT_OUT_COOKIE_VALUE || event.removed)) {
      // When OPT_OUT cookie is changed or removed, set it back immediately.
      this.setIdCookie_(event.cookie.storeId);
    }
  }
}

const plugin = new AdvertisingOptOutPlugin();
