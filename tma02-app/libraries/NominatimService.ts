/**
 * OU TM352 Block 2: NominatimService.ts
 *
 * Released by Chris Thomson / Stephen Rice: Dec 2020
 * Modified by Chris Thomson: November 2021, July 2023
 *
 * Use the OpenStreetMap REST API without flooding the server.
 * The API has antiflood protection on it that means we must not submit more than one request per second.
 * This function restricts requests to every five seconds, and caches responses to further reduce requests.
 */

// PRIVATE VARIABLES AND FUNCTIONS - available only to code inside the function
type QueueItem = {
    address?: string;
    lat?: number;
    long?: number;
    resolve: (data: any) => void;
    reject: (error: any) => void;
};

type Map = {
    [id: string]: string;
}

let queue: QueueItem[] = [];
let addressCache: Map = {}; // cache of responses from the API
let coordsCache: Map = {}; // cache of responses from the API
let timeout: ReturnType<typeof setTimeout> | undefined = undefined;

function scheduleRequest(delay: number) {
    console.log(
        "Nominatim: Processing next request in " + delay + "ms",
        Object.assign({}, queue)
    );
    timeout = setTimeout(processRequest, delay);
}

function safeCallback(item: QueueItem | undefined, delay: number) {
    try {
        // Callback with cached data
        if (item && item.address) item.resolve(addressCache[item.address]);
        if (item && item.lat && item.long) item.resolve(coordsCache[item.lat + "," + item.long]);
    } finally {
        // Schedule next request even if callback fails
        scheduleRequest(delay);
    }
}

async function processRequest() {
    // Stop if queue is empty
    if (queue.length === 0) {
        console.log("Nominatim: Queue complete");
        timeout = undefined;
        return;
    } else {
        // Get the next item from the queue
        const item: QueueItem | undefined = queue.shift();

        // Check that we have an item
        if (item) {
            // Check for cached data for this address
            if (item.address && addressCache[item.address]) {
                console.log("Nominatim: Data found in cache", addressCache[item.address]);

                // Callback and schedule the next request immediately as we did not call the API this time
                safeCallback(item, 0);
            } else if (item.lat && item.long && coordsCache[item.lat + "," + item.long]) {
                console.log("Nominatim: Data found in cache", coordsCache[item.lat + "," + item.long]);

                // Callback and schedule the next request immediately as we did not call the API this time
                safeCallback(item, 0);
            } else {
                try {
                    let url: string = "";

                    if (item.address) {
                        // Address is not cached so call the OpenStreetMap REST API - forward lookup
                        url =
                            "https://nominatim.openstreetmap.org/search/" +
                            encodeURI(item.address) +
                            "?format=json&countrycodes=gb";
                    } else if (item.lat && item.long) {
                        // Coords are not cached so call the OpenStreetMap REST API - reverse lookup
                        url =
                            "https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=" +
                            item.lat +
                            "&lon=" +
                            item.long;
                    }

                    // Call the OpenStreetMap REST API
                    console.log("Nominatim: Sending GET to " + url);
                    const response: Response = await fetch(url);
                    const json: any = await response.json();

                    console.log("Nominatim: Received data from " + url, json);

                    // Cache the response data
                    if (item.address) addressCache[item.address] = json;
                    if (item.lat && item.long) coordsCache[item.lat + "," + item.long] = json;

                    // Callback and schedule the next request in 5 seconds time:
                    // This avoids flooding the API and getting locked out. 1 second should be
                    // enough, but if you have several pages open then you need to wait longer
                    safeCallback(item, 5000);
                } catch (error) {
                    // resolve the promise with the error
                    item.reject("Call to Nominatim failed: " + error);

                    // Schedule the next request immediately as we did not call the API this time
                    safeCallback(undefined, 5000);
                }
            }
        }
    }
}

// PUBLIC FUNCTIONS 

/**
 * A queued/cached call to the OpenStreetMap REST API to look up an location of an address.
 * See: https://nominatim.org/release-docs/develop/api/Search/ .
 * This is a Promise based function that returns a promise that resolves to the parsed JSON response from the API.
 *
 * @param address the address to look up
 * @returns the JSON responce from nominatim
 *
 * @author Chris Thomson
 * @version 2.0 July 2023
 */
export function getAddressLocation(address: string): Promise<any> {
    const promise = new Promise((resolve, reject) => {
        const item: QueueItem = {'address': address, 'resolve': resolve, 'reject': reject};

        // Add the item to the queue
        queue.push(item);
        console.log("Nominatim: Queued request", Object.assign({}, queue));

        // Schedule the next request immediately if not already scheduled
        if (!timeout) scheduleRequest(0);
    });

    return promise;
}


/**
 * A queued/cached call to the OpenStreetMap REST API to look up an address from a location.
 * See: https://nominatim.org/release-docs/develop/api/Reverse/ .
 * This is a Promise based function that returns a promise that resolves to the parsed JSON response from the API.
 *
 * @param lat the latitude of the location
 * @param long the longitude of the location
 * @returns the JSON responce from nominatim
 *
 * @author Chris Thomson
 * @version 2.0 July 2023
 */
export function getLocationAddress(lat: number, long: number): Promise<any> {
    const promise = new Promise((resolve, reject) => {
        const item: QueueItem = {'lat': lat, 'long': long, 'resolve': resolve, 'reject': reject};

        // Add the item to the queue
        queue.push(item);
        console.log("Nominatim: Queued request", Object.assign({}, queue));

        // Schedule the next request immediately if not already scheduled
        if (!timeout) scheduleRequest(0);
    });

    return promise;
}


