
{
  init: function(elevators, floors) {

    //// Configuration
    // Load Factor Config, above this the elevator goes directly
    var maxLoad = 0.5;
    var maxLargeLoad = 0.5;

    // Turn on Elevator lights
    var directionLights = false;

    // Uncomment to disable logging
    // console.log = function() {}
    var logging = true;

    //// Defaults
    var floorCount = floors.length-1;
    console.log("Number of Floors: " + floorCount);

    // Queues for the up and down passengers. 
    var upQueue = [];
    var downQueue = [];

    // Combined queue of up and down passengers
    var requestedQueue = [];


    ///////////////////////////////////////////////////////////
    // Power on the elevators
    function powerOnElevator(elevator, index) {

      // Set the elevator to be not full by default.
      var elevatorFull = false;

      // Create a queue to register floor presses
      var floorButtonsQueue = [];


      ///////////////////////////////////////////////////////////
      // Set the next floor that the elevator should go to.
      function nextFloor() {

        updatePickupQueue();

        if (elevator.travelDirection == 'up' && floorButtonsQueue.length > 0) {

          // Find people on other floors in the direction we are going
          pickupHitchkikers();
          // Make sure the Queue is properly sorted
          sortQueue();
          // Make sure we are not trying to go to the place we are already at.
          cleanGlobalQueues();

          if (floorButtonsQueue.length > 0) {
            elevator.goToFloor(floorButtonsQueue[0], checkLoad());
          } else if (requestedQueue.length > 0) {
            elevator.goToFloor(requestedQueue[0], checkLoad());
          }

        } else if (elevator.travelDirection == 'down' && floorButtonsQueue.length > 0) {

          // Find people on other floors
          pickupHitchkikers();
          // Make sure the Queue is properly sorted
          sortQueue();
          // Make sure we are not trying to go to the place we are already at.
          cleanGlobalQueues();

          if (floorButtonsQueue.length > 0) {
            elevator.goToFloor(floorButtonsQueue[0], checkLoad());
          } else if (requestedQueue.length > 0) {
            elevator.goToFloor(requestedQueue[0], checkLoad());
          }

        } else if (downQueue.length > 0) {
          //console.log("Grab someone who wants to go down");
          elevator.goToFloor(downQueue[0], checkLoad());

        } else if (upQueue.length > 0) {
          //console.log("Grab someone who wants to go up");
          elevator.goToFloor(upQueue[0], checkLoad());

        } else if (requestedQueue.length > 0) {
          //console.log("No pushed anything inside, go to a requested floor : " + requestedQueue);
          elevator.goToFloor(requestedQueue[0], checkLoad());

        } else {
          elevator.goToFloor(0);
          
        }
      }


      ///////////////////////////////////////////////////////////
      // Sort the floor buttons queue
      function sortQueue() {
        if (elevator.travelDirection == "up") {
          floorButtonsQueue = floorButtonsQueue.sort(function (a, b) { return a - b });
          //console.log("Elevator " + index + " Next Floors (Up, Sorted): " + floorButtonsQueue);
        } else {
          floorButtonsQueue = floorButtonsQueue.sort(function (a, b) { return b - a });
          //console.log("Elevator " + index + " Next Floors (Down, Sorted): " + floorButtonsQueue);
        }
      }

      function logStatus(){
        if(logging) {
          console.log("Elevator " + index + " | Queue: " + floorButtonsQueue + " | Current Floor: "+ elevator.currentFloor() + "| Direction: " + elevator.travelDirection + " | Current Load: " + elevator.loadFactor() + " | Capacity: " + elevator.maxPassengerCount());
        }
      }


      ///////////////////////////////////////////////////////////
      // Check Load - See if both large and small elevators are full
      function checkLoad() {
        //console.log("Elevator " + index + " Current Load: " + elevator.loadFactor() + " | Capacity: " + elevator.maxPassengerCount());

        if (elevator.loadFactor() < maxLoad && elevator.maxPassengerCount() <= 5) {
          var elevatorFull = false;
          //console.log("Elevator " + index + "(Small) is not full");
        } else if (elevator.loadFactor() < maxLargeLoad && elevator.maxPassengerCount() > 5) {
          var elevatorFull = false;
          //console.log("Elevator " + index + "(Large) is not full");
        } else if (elevator.loadFactor() > maxLoad && elevator.maxPassengerCount() <= 5) {
          var elevatorFull = true;
          //console.log("Elevator " + index + "(Small) is full");
        } else if (elevator.loadFactor() > maxLargeLoad && elevator.maxPassengerCount() >= 5) {
          var elevatorFull = true;
          //console.log("Elevator " + index + "(Large) is full");
        } else {
          var elevatorFull = false;
        }
        return elevatorFull;
      };


      ///////////////////////////////////////////////////////////
      // Find the next passengers to pick up, if idle
      function findNextPickupArray() {
        requestedQueue = _.union(upQueue, downQueue);
        //console.log("Combined Pickup Queue:" + requestedQueue);

        //requestedQueue = _.uniq(requestedQueue);
        //console.log("requested queue after:" + requestedQueue); 

        //console.log('Idle, so adding a destination from the requsted queue: ' + requestedQueue);
        return (requestedQueue[0]);
      }


      ///////////////////////////////////////////////////////////
      // Find stops on the way and add them to the queue, if not full 
      function pickupHitchkikers() {

        if (checkLoad() == false) {
          if (elevator.travelDirection == 'up' && upQueue.length > 0) {
            var floorsAbove = _.filter(upQueue, function (n) { return n > elevator.currentFloor() });
            //console.log("Elevator " + index + " has requested Floors Above: " + floorsAbove);
            console.log("Elevator " + index + " New Global Queue before Hitchhikers: " + floorButtonsQueue);
            floorButtonsQueue = _.union(floorsAbove, floorButtonsQueue);
            sortQueue();
            console.log("Elevator " + index + " New Global Queue with Hitchhikers: " + floorButtonsQueue);
            upQueue = _.difference(floorButtonsQueue, upQueue);
            //console.log("Queue of upwards requests: " + _.difference(floorButtonsQueue, upQueue));
          }

          else if (elevator.travelDirection == 'down' && downQueue.length > 0) {
            var floorsBelow = _.filter(downQueue, function (n) { return n < elevator.currentFloor() });
            //console.log("Elevator " + index + " has requested Floors Above: " + floorsBelow);
            console.log("Elevator " + index + " New Global Queue before Hitchhikers: " + floorButtonsQueue);
            floorButtonsQueue = _.union(floorsBelow, floorButtonsQueue);
            sortQueue();
            console.log("Elevator " + index + " New Global Queue with Hitchhikers: " + floorButtonsQueue);
            downQueue = _.difference(floorButtonsQueue, downQueue);
           //console.log("Queue of downwards requests: " + _.difference(floorButtonsQueue, downQueue));
          }
        } else {
          console.log("Elevator " + index + " is full, skipping Hitchhikers");
        }
      }


      //////////////////////////////////////////////////////////
      // Max and Min Floors 
      function getMaxFloor(numArray) {
        if (numArray.length > 0) {
          //console.log("Elevator " + index + " Max Floor: " + _.max(numArray));
          return _.max(numArray);
        } else {
          //console.log("Elevator " + index + " Array Empty Setting Max Floor: " + floorCount);
          return floorCount;
        }
      }

      function getMinFloor(numArray) {
        if (numArray.length > 0) {
          //console.log("Elevator " + index + " Min Floor: " + _.min(numArray));
          return _.min(numArray);
        } else {
          //console.log("Elevator " + index + " Array Empty Setting Min Floor: 0 ");
          return 0;
        }
      }


      ///////////////////////////////////////////////////////////
      // This sets the up or down travel direction
      function setTravelDirection() {
        if (elevator.currentFloor() <= getMinFloor(upQueue)) {
          elevator.travelDirection = "up";
          // Set up the lights
          if (directionLights) {
            elevator.goingDownIndicator(false);
            elevator.goingUpIndicator(true);
          }
          //console.log("Elevator " + index + " Changed Direction: " + elevator.travelDirection);
        }
        else if (elevator.currentFloor() >= getMaxFloor(downQueue)) {
          elevator.travelDirection = "down";
          if (directionLights) {
            elevator.goingDownIndicator(true);
            elevator.goingUpIndicator(false);
          }
          //console.log("Elevator " + index + " Changed Direction: " + elevator.travelDirection);
        }
        else {
          elevator.travelDirection = "down";
          if (directionLights) {
            elevator.goingDownIndicator(true);
            elevator.goingUpIndicator(false);
          }
        }
      };


      ///////////////////////////////////////////////////////////
      // Clear the Queue when the elevator is at the requested floor
      function cleanGlobalQueues() {

        if (floorButtonsQueue.length > 0) {
          if (elevator.currentFloor() == floorButtonsQueue[0]) {
            //console.log("Elevator " + index + " Removing Floor from Global Queue: " + floorButtonsQueue[0]);
            floorButtonsQueue.shift();
            //console.log("Elevator " + index + " New Global Queue: " + floorButtonsQueue);
            return floorButtonsQueue;
          } else {
            return floorButtonsQueue;
          }
        }

        // Clear the current floor from the downQueue, if elevator is at it
        if (elevator.currentFloor() == downQueue[0]) {
          //console.log("Removing " + downQueue[0] + " from downQueue, Remaining Requested:" + downQueue);
          downQueue.shift();
        }
        // Remove the current floor from the UpQueue, if elevator is at it
        if (elevator.currentFloor() == upQueue[0]) {
          //console.log("Removing " + upQueue[0] + " from upQueue, Remaining Requested:" + upQueue);
          upQueue.shift();
        }
      }


      ///////////////////////////////////////////////////////////
      // Whenever the elevator is idle (has no more queued destinations) ...
      elevator.on("idle", function () {
        //console.log("Elevator " + index + " is Idle On Floor: " + elevator.currentFloor());

        // Output a log of what the elevator is doing
        logStatus();

        // Find people on other floors in the direction we are going
        pickupHitchkikers();

        // Set the direction of travel
        setTravelDirection();

        // Set the next floor
        nextFloor();

      });


      ///////////////////////////////////////////////////////////
      // What to do When the elevator is stopped at a floor
      elevator.on("stopped_at_floor", function (floorNum) {
        //console.log("Elevator " + index + " Stoped at Floor: " + floorNum);

        logStatus();

        // Find people on other floors in the direction we are going
        // pickupHitchkikers();
        updatePickupQueue();

        // Check the load of the elevators
        checkLoad();

        // Cleanup the Global Queue
        cleanGlobalQueues();

        // Sort the global Queue
        sortQueue()

        // Set the direction of travel
        setTravelDirection();

      });


      ///////////////////////////////////////////////////////////
      // What to do When the elevator is moving
      elevator.on("passing_floor", function(floorNum, direction) { 
        pickupHitchkikers();
      
     });


      ///////////////////////////////////////////////////////////
      // When the button is pressed in the elevator
      elevator.on("floor_button_pressed", function (floorNum) {
        floorButtonsQueue.push(floorNum);
        sortQueue();

        //console.log("Elevator " + index + " Inside Button Pressed: " + floorButtonsQueue);
      });

    } // End Main Elevator


    ///////////////////////////////////////////////////////////
    //  Update the next passengers to pick up queue
    function updatePickupQueue() {
      requestedQueue = _.union(upQueue, downQueue);
      console.log("Requested: " + requestedQueue + " | Up: " + upQueue + " | Down: " + downQueue);
    }


    // Find who is waiting on each floor for the elevator
    function floorPanels(floor) {

      floor.on("up_button_pressed", function () {
        upQueue.push(floor.level);
        updatePickupQueue();
        //console.log("Request (Up) at Floor: " + upQueue);
      });

      floor.on("down_button_pressed", function () {
        downQueue.push(floor.level);
        //downQueue = _.uniq(downQueue);
        updatePickupQueue();
        //console.log("Request (Down) at Floor: " + downQueue);
      });
    }


    // --------- Initalize the Elevator -----------------------

    // Get all the elevators moving    
    elevators.forEach(powerOnElevator);

    // Turn on the panels at each floor
    floors.forEach(floorPanels);

  },
  update: function(dt, elevators, floors) {
    // We normally don't need to do anything here
  }
}