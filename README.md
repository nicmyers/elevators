

#Elevator Saga Attept
http://play.elevatorsaga.com/

My attempt at Elevator Saga seeks to recreate how I think elevators should work. The basic idea is that the elevators should go from bottom to top, picking up passengers if they are not full, and then return when they reach their calculated top point. The elevator indicator lights are working, though in some of the challenges disabling them allows the code to pass, as then the patrons are not as picky about which elevator they choose. There are improvements I can make, which are listed in the ideas section below.

## Challenges Completed
The code in elevator.js has passed all of the levels listed below at least once. Though currently it won't pass 100% of the time. Sometimes there are events that the current queue system is not optimised for.

1.  Pass
2.  Pass
3.  Pass
4.  Pass
5.  Pass
6.  Pass
7.  Pass
8.  Close: Usually one person that gets stuck, usually on a top floor
9.  Pass: Note, requires a maxLoad setting of around .1 and a very lucky queue
10. Pass
11. Not Passing: Not currently optimised for low wait times
12. Not Passing: Not currently optimised for low wait times
13. Not Passing: Not currently optimised for low wait times
14. Not Passing: Not currently optimised for low wait times
15. Not Passing: Not currently optimised for low wait times
16. Pass
17. Pass
18. Not Passing: Not currently optimised for low wait times and usually someone gets stuck on a floor


## Ideas & Improvements
1. The current versions scheduling of requested stops is not ideal. I'm thinking a priority system based upon waiting time per floor could be useful.
2. Ideally, when an elevator is idle, it will respond for pickup on a floor that it is closest to.
3. Currently, all elevators respond independently. Perhaps a system that chooses the closest idle elevator and then pushes a requested floor into its respective queue would be the best. This would solve the bug of having multiple idle elevators responding to a single call of the elevator. 

## Configuration
There are a few configuration options available. As the improvements are introduced, the need to change these values will be reduced and they may be removed.

**Maxload** 
These control the max load of the elevator before they will go directly to the destination without picking up people on the way.
'var maxLoad = 0.5;' (Default)
'var maxLargeLoad = 0.5;' (Default)

**Elevator Direction Lights** 
Enable or disable the elevator direction lights. This settings sometimes allows challenges pass.
'var directionLights = true;' (Default)

**Enable Logging**
Set to true to enable console logging of elevator activity.
'var logging = false;' (Default)