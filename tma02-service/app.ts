/**
 * Express.js implementation of the TMA02 ridesharing API. This is a prototype
 * implementation with a number of limiations. It is enough to demonstrate that
 * a client works. 
 *
 * This server can be started from the installed directory with:
 * npm run dev
 * 
 * The following routes are supported:
 * 
 * GET /openstack/taxi/orders?userid=<USERID>
 * GET /openstack/taxi/orders/<ID>?userid=<USERID>
 * GET /openstack/taxi/matches?userid=<USERID>
 * POST /openstack/taxi/orders
 * POST /openstack/taxi/users
 * DELETE /openstack/taxi/orders/<ID>?userid=<USERID>
 *
 * Change log:
 * Version 1.0, 1 October 2023, C Thomson, Intial version
 * Version 1.1, 8 December 2023, C Thomson, Corrected comment on POST Order
 * Version 1.2, 10 January 2024, C Thomson, Corrected users POST to allow a userid via the body
 *
 * Packages:
 * npm i -D typescript @types/express @types/node
 * npm install -D concurrently nodemon
 *
 * Project intialisation tasks:
 * npx tsc --init
 */

const express = require('express');
const cors = require('cors'); 

/**
 * Used to represent an order. This is a simple class that just stores the
 * data. It does not do any checking of the data. The start and end dates
 * are stored as Date objects.
 */
class Order {
    id: string = "";
    start: Date = new Date();
    end: Date = new Date();
    type: string = "";
    address: string = "";
    userid: string = "";
    
    /**
     * Creates a new Order object. During this process teh start and end dates are parsed.
     * @param id       the id of the order
     * @param start    the start date and time
     * @param end      the end date and time
     * @param type     the type of order (0-offer, 1-request)
     * @param address  the address of the order
     * @param userid   the userid of the order
     * @return         a new Order object
     * 
     * @throws         an error if the start or end dates are not valid
     */
    constructor(id:string, start:string, end:string, type:string, address:string, userid:string) {  // Constructor
        this.id = id;
        this.start = new Date(start);
        if (end !== "")
            this.end = new Date(end);
        this.type = type;
        this.address = address;
        this.userid = userid;
    }
    
    /**
     * Turns this order into a JSON string.
     * 
     * @return         a JSON string representing this order
     */
    stringify():string {
        return "{    \"id\": \""+this.id+
                  "\", \"start\": \""+this.start.toISOString()+
                  "\", \"end\": \""+this.end.toISOString()+
                  "\", \"type\": \""+this.type+
                  "\", \"address\": \""+this.address+
                  "\", \"userid\": \""+this.userid+"\"}";
    }
}

// Create the express app
const app = express();
app.use(cors());
app.use(express.json());

// Set up the routes
const base = "/openstack/taxi/";
const port = 3000;
app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});

// The data is stored in an array of Order objects
let orders:Order[] = [];
let orderCount = 0;
let orderIDCounter = 0;

/**
 * The handler for the GET /openstack/taxi/orders/<ID>?userid=<USERID> route.
 * 
 * @param request   the request object. 
 * @param response  the response object
 */
app.get(base+"orders/:id", (request:any, response:any) => {
   response.send(getImp(request.query.userid, request.params.id.toString()));
});

/**
 * The handler for the GET /openstack/taxi/orders?userid=<USERID> route.
 * 
 * @param request   the request object
 * @param response  the response object
 */
app.get(base+"orders", (request:any, response:any) => {
   response.send(getImp(request.query.userid, ""));
});

/**
 * The handler for the POST /openstack/taxi/orders route.
 * 
 * @param request   the request object
 * @param response  the response object
 */
app.post(base+"orders", (request:any, response:any) => {
   response.send(postImp(request.body.userid, 
                       request.body.type,  
                       request.body.address,
                       request.body.start,
                       request.body.end));
});

/**
 * The handler for the DELETE /openstack/taxi/orders/<ID>?userid=<USERID> route.
 * 
 * @param request   the request object
 * @param response  the response object
 */
app.delete(base+"orders/:id", (request:any, response:any) => {
   response.send(deleteImp(request.query.userid, request.params.id.toString()));
});

/**
 * The handler for the GET /openstack/taxi/matches?userid=<USERID> route.
 * 
 * @param request   the request object
 * @param response  the response object
 */
app.get(base+"matches", (request:any, response:any) => {
   response.send(matchesImp(request.query.userid));
});

/**
 * The handler for the POST /openstack/taxi/users route.
 * 
 * @param request   the request object
 * @param response  the response object
 */
app.post(base+"users", (request:any, response:any) => {
   let userid = request.body.userid;
   if (userid === undefined || userid === null || userid === "") {
      userid = request.query.userid;
   }
   response.send(userImp(userid));
});


/**
 * GET always requires an USERID to be supplied, but an ID is optional. 
 * GET with no ID will retrieve all the orders for the USERID. GET with 
 * an ID value will retrieve just the single record matching the ID if 
 * it also matches the supplied USERID. If an ID is provided and there is 
 * no matching record then an error is returned. A successful GET with 
 * an ID returns the record with that ID. For example, the GET request
 * 
 *
 *   /openstack/taxi/orders/110919?userid=<USERID>
 *
 *   will return the order record with an ID value of 110919:
 *
 *   {
 *    "status": "success",
 *    "data": [
 *       {
 *       "id": "110919",
 *        "start": "2018-12-05T18:09:00",
 *        "end": null,
 *        "type": "1",
 *        "address": "Virunum"
 *        }
 *     ]
 *   }
 *
 *   In this example, the type ‘1’ indicates it is a ‘request’ record, 
 *   hence the ‘end’ date and time is unspecified (as a ‘null’ value). 
 *   Type ‘0’ records are used for ‘offers’, for these the ‘end’ date 
 *   and time will need to be specified for the API call, and this value 
 *   should derive from ‘start time + duration’ using computation in 
 *   JavaScript from the inputs provided by the user in the HTML form.
 *
 *   The most common reason for these requests to fail is because the 
 *   date and time is incorrectly formatted, either in the request or 
 *   as entered by the user in the webform. Therefore, if something is 
 *   not working please check very carefully what you have entered and 
 *   how it has been manipulated by the code.
 *
 *   The case of all the parameters can be important, for example userid 
 *   is in lowercase here.
 * 
 * 
 * @param userid   the user for which we want to list orders
 * @param id       a specific order to retrive (optional)
 * @return         all orders (or the specified order) for the supplied userid
 */
function getImp(userid:string, id:string): string{
    console.log("Request to GET orders: "+userid+", "+id);
    let response ="";
    
    let result:string = "";
    orders.forEach(function (order){
        if (order!= null && (id==="" || order.id === id) && (order.userid===userid)) {
            if (result!=="") {
                result += ", ";
            }
            result += order.stringify();
        };
    });
    if (result != ""){
        response = "{ \"status\": \"success\", \"data\": ["+result+"]}";
    }
    else {
        response = "{\"status\" : \"error\",\"message\" : \" 404 - No matching records\"}";
    }
    
    console.log("Response from GET orders: "+response);
    return response;
}

/**
 * POST will create a new record. The record should have 
 * appropriate values for the fields (userid, type, address, 
 * start and end) but no ID should be passed to the API 
 * because the server will generate a new unique ID value 
 * for the record. The address is the location where the 
 * taxi will pick up the riders. The value of USERID as 
 * provided by the user. The value of type is 0 for an offer 
 * or 1 for a request. The start and end values are 
 * datetime-local (e.g. “2018-12-05T18:09:00”), and 
 * end is required only when type is 0.
 * 
 * Note this implementation does absoutely no checking of the 
 *      date field!
 * 
 *    A POST
 * 
 *     /openstack/taxi/orders
 * 
 *     with additional body elements, e.g.
 * 
 *     userid=<USERID>
 *     type=1
 *     address=”Virunum”
 *     start=”2018-12-05T18:09:00”
 * 
 *     can be sent to the API (these parameters should be provided 
 *     as json) to return a success message and the new record, 
 *     including the generated ID.
 * 
 *
 * @param userid   the user making ther offer or request.
 * @param type     0-offer 1-request
 * @param address  the pickup locaction
 * @param start    the start time of the period that is acceptable
 * @param end      the end time of the period that is acceptable
 * @return         a status message
 */
function postImp(userid:string, type:string, address:string, start:string, end:string):string{
    console.log("Request to POST orders: "+userid+", "+type+", "+address+", "+start+", "+end);
    let response ="";
    
    if (orderCount >= 10) {
        response = "{\"status\" : \"error\",\"message\" : \"404 - Out of memory\"}";
        console.log("Response from POST orders: "+response);
        return response;
    }
    
    let order = new Order(orderIDCounter.toString(), start, end, type, address, userid);
    orders[orderCount] = order;
    orderCount++;
    orderIDCounter++;
    
    let result = JSON.stringify(order); 
    response = "{ \"status\": \"success\", \"data\": ["+result+"]}";
    console.log("Response from POST orders: "+response);
    return response;
}

/**
 * A DELETE will remove a single record from the server. The unique 
 * ID of the record must be provided. To DELETE an order with an ID 
 * value of 110919, the following call can be made:
 * /openstack/taxi/orders/110919?userid=<userid>
 * 
 * This will return a message (if the record exists):
 * {"status" : "success"}
 *
 * @param userid   the user deleteing the order
 * @param id       the id of the order to delete
 * @return         a status message
 */
function deleteImp(userid:string, id:string):string{
    console.log("Request to DELETE orders: "+userid+", "+id);
    let response = "{\"status\" : \"error\",\"message\" : \" 404 - No matching records\"}";
    
    let i = 0;
    let j = 0;
    for (i = 0; i < orderCount; i++) {
        if (orders[i].id === id) {
            for (j = i; j < orderCount-1; j++){
                orders[j] = orders[j+1];
            }
            orderCount--;
            orders.pop();
            response = "{\"status\" : \"success\"}";
        }
    }
    
    console.log("Response from DELETE orders: "+response);
    return response;
}  

/**
 * You can use this API to get a list of matching offers and 
 * requests where a given userid has either made an offer or 
 * request. A taxi_matches record represents a matching pair 
 * of an offer and a request. The API only provides the GET 
 * operation.
 *
 * To retrieve all the matching pairs belonging to user’s USERID we can use the following GET:
 * 
 * /openstack/taxi/matches?userid=<USERID>
 * 
 * which returns, for example:
 * 
 * {
 *      "status": "success",
 *      "data": [
 * {
 *  "start": "2018-12-05T18:12:00",
 *   "hire_userid": "<userid1>",
 *   "hire_address": "Virunum",
 *   "offer_userid": "<userid2>",
 *   "offer_address": "Virunum"
 * },
 * {
 *   "start": "2018-12-05T18:09:00",
 *   "hire_userid": "<userid1>",
 *   "hire_address": "Virunum",
 *   "offer_userid": "<userid2>",
 *   "offer_address": "Virunum"
 *   }
 * ]
 * }
 * 
 * Note that the word ‘hire’ is used instead of ‘request’.
 * 
 * @param userid   the user making ther offer or request.
 * @return         the matched rides for that user
 */
function matchesImp(userid:string):string{
    console.log("Request to matches: "+userid);
    
    let matches = "";
    orders.forEach(function (order) {
        if (order!=null && order.type === "0") {                                // needs to be an offer
            orders.forEach( function(order2) {                
                if (order2!=null &&                                             // not an empty order
                    order.id !== order2.id &&                                   // not the same order
                    order2.type === "1" &&                                      // needs to be a request
                    (order.userid === userid || order2.userid === userid) &&    // one order must belong to this user
                    order.address === order2.address &&                         // both orders need to be at the same location
                    (order2.start.valueOf() >= order.start.valueOf() && order2.start.valueOf() <= order.end.valueOf())   // the request must be between the offer times 
                   ){
                    if (matches !=="") matches +=",";
                    matches += "{ \"start\": \""+order.start.toISOString()+"\", \"hire_userid\": \""+order2.userid+"\", \"hire_address\": \""+
                        order2.address+"\", \"offer_userid\": \""+order.userid+"\", \"offer_address\": \""+order.address+"\"}";
                }
            });
        }
    });
    
    let response = "";
    if (matches !== "")
        response =  "{\"status\": \"success\", \"data\": ["+matches+"]}";
    else 
        response =  "{\"status\" : \"error\",\"message\" : \"404 - No matching records\"}";

    console.log("Response from matches: "+response);
    return response;
}

/**
 * A POST will add a userid to the database
 * /openstack/taxi/users/
 *
 * This implementation does not keep track of userids
 * so any user id will be permitted, even if not registered.
 *
 * This will return a message (if the record exists):
 * {"status" : "success"}
 *
 * @param userid the userid to register
 */
function userImp(userid:string):string{
    console.log("Request to users: "+userid);
    const response = "{\"status\" : \"success\"}";
            
    console.log("Response from users: "+response);
    return response;
}
