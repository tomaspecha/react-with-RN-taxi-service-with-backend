/**
 * TM352 23J TMA02 Q1, code
 *
 * 24/10/2023 Intial version Chris Thomson
 * 04/12/2023 Fixed server address Chris Thomson
 *
 * This is the code to connect to the taxi service API provided seprately.
 *
 **/

// Modify the following line to replace USERID with your userid.
// To find the USERID, click on Open in new Tab at the top of the screen and then look at the URL 
// in the new browser tab. You will see that it contains the text /user/USERID/. Use that number 
// in the configuration file and you are ready to go.
const apibase = "https://ocl-jhub-tm352.open.ac.uk/user/559/proxy/3000/openstack/taxi/";

/**
 * Retrieves matches from the service
 *
 * @param userid the userid of the user
 * @return a list of matches
 */
export async function getMatches(userid: string): Promise<any> {
    const response = await fetch(apibase + "matches/?userid=" + userid);
    if (!response.ok) {
        const message = "An error has occured: " + response.status;
        throw (message);
    }
    const json = await response.json();
    return checkResponse(json);
}

/**
 * Posts an order to the service
 *
 * @param userid  the userid of the user
 * @param start   the start of a window to match in formated as a datetime-local
 * @param end     the end of a window to match in formated as a datetime-local
 * @param type
 * @param address
 * @return a list of matches
 */
export async function postOrders(userid: string, start: string, end: string, type: string, address: string): Promise<any> {
    const details = {
        "userid": userid,
        "start": start,
        "end": end,
        "type": type,
        "address": address
    };

    const response = await fetch(apibase + "orders", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(details)
    });

    if (!response.ok) {
        const message = "An error has occured" + response.status;
        throw (message);
    }
    const json = await response.json();
    return checkResponse(json)[0];
}

/**
 * Deletes an order from the service
 *
 * @param userid  the userid of the user
 * @param orderid the orderid to delete
 * @return a status
 */
export async function deleteOrders(userid: string, orderid: string): Promise<any> {
    const response = await fetch(apibase + "orders/" + orderid + "?userid=" + userid, {
        method: 'DELETE'
    });

    if (!response.ok) {
        const message = "An error has occured" + response.status;
        throw (message);
    }
    const json = await response.json();
    return checkResponse(json);
}

/**
 * Checks the JSON response for errors and handles them
 *
 * @param  response  the JSON object recived from the service
 * @return processes response
 */
function checkResponse(response: any): any {
    if (response.status != "success") {
        throw (response.message);
    } else if (response.data) {
        return response.data;
    } else {
        return response;
    }
}