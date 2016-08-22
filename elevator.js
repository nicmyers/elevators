{
  init: function(elevators, floors) {

    //// Configuration
    // Load Factor Config, above this the elevator goes directly
    var maxLoad = 0.5;
    var maxLargeLoad = 0.5;

    // Turn on Elevator lights
    var directionLights = true;

    // Enable or disable console logging of elevator and queue activity
    var logging = true;

    //// Defaults
    var floorCount = floors.length - 1;

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


      // Set the next floor that the elevator should go to.
      function nextFloor() {
        // Update the unified up down queue
        updatePickupQueue();

        if (elevator.travelDirection == 'up' && floorButtonsQueue.length > 0) {

          // Find people on other floors in the direction we are going.
          pickupHitchkikers();
          // Make sure the Queue is properly sorted.
          sortQueue();
          // Clean the current floor from the queue.
          cleanGlobalQueues();

          if (floorButtonsQueue.length > 0) {
            elevator.goToFloor(floorButtonsQueue[0], checkLoad());
          } else if (requestedQueue.length > 0) {
            elevator.goToFloor(requestedQueue[0], checkLoad());
          }

        } else if (elevator.travelDirection == 'down' && floorButtonsQueue.length > 0) {

          // Find people on other floors in the direction we are going.
          pickupHitchkikers();
          // Make sure the Queue is properly sorted.
          sortQueue();
          // Clean the current floor from the queue.
          cleanGlobalQueues();

          if (floorButtonsQueue.length > 0) {
            elevator.goToFloor(floorButtonsQueue[0], checkLoad());
          } else if (requestedQueue.length > 0) {
            elevator.goToFloor(requestedQueue[0], checkLoad());
          }

        } else if (downQueue.length > 0) {
          elevator.goToFloor(downQueue[0], checkLoad());
        } else if (upQueue.length > 0) {
          elevator.goToFloor(upQueue[0], checkLoad());
        } else if (requestedQueue.length > 0) {
          elevator.goToFloor(requestedQueue[0], checkLoad());
        } else {
          elevator.goToFloor(0);
        }
      }


      // Sort the floor buttons queue
      function sortQueue() {
        if (elevator.travelDirection == "up") {
          floorButtonsQueue = floorButtonsQueue.sort(function (a, b) { return a - b });
        } else {
          floorButtonsQueue = floorButtonsQueue.sort(function (a, b) { return b - a });
        }
      }


      // Basic logging of individual elevator activity.
      function logStatus() {
        if (logging) {
          console.log("Elevator " + index + " | Queue: " + floorButtonsQueue + " | Current Floor: " + elevator.currentFloor() + " | Direction: " + elevator.travelDirection + " | Current Load: " + elevator.loadFactor() + " | Capacity: " + elevator.maxPassengerCount());
        }
      }


      // Check Load - See if both large and small elevators are full
      function checkLoad() {
        if (elevator.loadFactor() < maxLoad && elevator.maxPassengerCount() <= 5) {
          var elevatorFull = false;
        } else if (elevator.loadFactor() < maxLargeLoad && elevator.maxPassengerCount() > 5) {
          var elevatorFull = false;
        } else if (elevator.loadFactor() > maxLoad && elevator.maxPassengerCount() <= 5) {
          var elevatorFull = true;
        } else if (elevator.loadFactor() > maxLargeLoad && elevator.maxPassengerCount() >= 5) {
          var elevatorFull = true;
        } else {
          var elevatorFull = false;
        }
        return elevatorFull;
      };


      // Find the next passengers to pick up, if idle
      function findNextPickupArray() {
        requestedQueue = _.union(upQueue, downQueue);
        return (requestedQueue[0]);
      }


      // Find stops on the way and add them to the queue, if not full 
      function pickupHitchkikers() {
        if (checkLoad() == false) {
          if (elevator.travelDirection == 'up' && upQueue.length > 0) {
            var floorsAbove = _.filter(upQueue, function (n) { return n > elevator.currentFloor() });
            floorButtonsQueue = _.union(floorsAbove, floorButtonsQueue);
            sortQueue();
            upQueue = _.difference(floorButtonsQueue, upQueue);
          }

          else if (elevator.travelDirection == 'down' && downQueue.length > 0) {
            var floorsBelow = _.filter(downQueue, function (n) { return n < elevator.currentFloor() });
            floorButtonsQueue = _.union(floorsBelow, floorButtonsQueue);
            sortQueue();
            downQueue = _.difference(floorButtonsQueue, downQueue);
          }
        }
      }


      // Max and Min Floors 
      function getMaxFloor(numArray) {
        if (numArray.length > 0) {
          return _.max(numArray);
        } else {
          return floorCount;
        }
      }

      function getMinFloor(numArray) {
        if (numArray.length > 0) {
          return _.min(numArray);
        } else {
          return 0;
        }
      }


      // This sets the travel direction: up or down
      function setTravelDirection() {
        if (elevator.currentFloor() <= getMinFloor(upQueue)) {
          elevator.travelDirection = "up";
          // Set up the lights
          if (directionLights) {
            elevator.goingDownIndicator(false);
            elevator.goingUpIndicator(true);
          }
        }
        else if (elevator.currentFloor() >= getMaxFloor(downQueue)) {
          elevator.travelDirection = "down";
          if (directionLights) {
            elevator.goingDownIndicator(true);
            elevator.goingUpIndicator(false);
          }
        }
        else {
          elevator.travelDirection = "down";
          if (directionLights) {
            elevator.goingDownIndicator(true);
            elevator.goingUpIndicator(false);
          }
        }
      };


      // Clear the Queue when the elevator is at the requested floor
      function cleanGlobalQueues() {
        if (floorButtonsQueue.length > 0) {
          if (elevator.currentFloor() == floorButtonsQueue[0]) {
            floorButtonsQueue.shift();
            return floorButtonsQueue;
          } else {
            return floorButtonsQueue;
          }
        }

        // Clear the current floor from the downQueue, if elevator is at it
        if (elevator.currentFloor() == downQueue[0]) {
          downQueue.shift();
        }
        // Remove the current floor from the UpQueue, if elevator is at it
        if (elevator.currentFloor() == upQueue[0]) {
          upQueue.shift();
        }
      }

      // Update the elevator queue stats area.
      function updateStats() {
        $(".elevator-" + index + " .value").text(floorButtonsQueue);
      }


      ///////////////////////////////////////////////////////////
      // Whenever the elevator is idle (has no more queued destinations) ...
      elevator.on("idle", function () {
        // Display logging if enabled
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
        // Display logging if enabled
        logStatus();

        // Display the queue in the stats area
        updateStats();

        // Update the unified up down queue
        updatePickupQueue();

        // Check the load of the elevators
        checkLoad();

        // Cleanup the global queues
        cleanGlobalQueues();

        // Sort the elevator queue
        sortQueue()

        // Set the direction of travel
        setTravelDirection();
      });


      // What to do When the elevator is moving
      elevator.on("passing_floor", function (floorNum, direction) {
        // Find people on other floors in the direction we are going
        pickupHitchkikers();
      });

      // When the button is pressed in the elevator
      elevator.on("floor_button_pressed", function (floorNum) {
        floorButtonsQueue.push(floorNum);
        sortQueue();
      });

    } // End Main Elevator


    // Elevator Dispatcher - 
    function requestDispatcher(direction){
      
   }


    //  Update the next passengers to pick up queue
    function updatePickupQueue() {
      requestedQueue = _.union(upQueue, downQueue);
      if (logging) {
        console.log("Requested: " + requestedQueue + " | Up: " + upQueue + " | Down: " + downQueue);
      }
    }


    // Find who is waiting on each floor for the elevator
    function floorPanels(floor) {
      floor.on("up_button_pressed", function () {
        upQueue.push(floor.level);
        updatePickupQueue();
      });

      floor.on("down_button_pressed", function () {
        downQueue.push(floor.level);
        updatePickupQueue();
      });
    }


        var top = 140;
        function setupStats() {
          for (var i = 0, len = elevators.length; i < len; i++) {
            $(".statscontainer").append('<div style="top:' + top + 'px" class="elevator-' + i + '"><span class="key">Elevator ' + i + ' Queue</span><span class="value">-</span>');
            top = top + 20;
          }
        }



    ///////////////////////////////////////////////////////////
    // --------- Power up the Elevator and Floor Panels -----------------------

    // Get all the elevators moving    
    elevators.forEach(powerOnElevator);

    // Turn on the panels at each floor
    floors.forEach(floorPanels);

    setupStats();

  },
  update: function(dt, elevators, floors) {
    // We normally don't need to do anything here
  }
}