OrbitML corrects a satellite's orbit predictions with a small neural network. Two weeks out, the error of SGP4 (the standard model) drops from 1.9 km to 750 m. Some steps of the project are visualized with the Aurora rendering engine.

![Sentinel-6A's orbit around the globe and its ground track, rendered with Aurora](/projects/orbitml/orbite.webp)

### Where it started

OrbitML grew out of a gap in my CV: several of the final-year internships I was interested in involved machine learning, and none of my projects really did.

I also wanted something visual, to make use of Aurora. Satellites ticked both boxes, and two papers by Peng and Bai[1][2] provided a concrete problem: predict an orbit with SGP4, then learn to correct its error.

### Picking a satellite

The first step is to pick a satellite whose exact position is public (or at least known far more precisely than SGP4's error). The European Sentinel satellites fit the bill.

I started with Sentinel-1A, the first of the series, but a problem showed up quickly: the satellite made dozens of manoeuvres in 2024. The trouble with manoeuvres is that they can't be predicted. You have to work around them, which makes the task harder and probably degrades the data.

So I switched to Sentinel-6A: at an altitude of 1,336 km, the atmosphere is so thin it barely slows the satellite down, and it only manoeuvred 4 times that year.

![Semi-major axis of Sentinel-1A over 2024, with its manoeuvres](/projects/orbitml/manoeuvres.webp "Sentinel-1A's semi-major axis in 2024, with the 75 clearest burns.")

### The method

I didn't reproduce either paper as is. The 2018 one[1] works on simulated data, a layer of complexity that added little here. The 2019 one[2] uses real data, but with SVMs (Support Vector Machines), whereas my goal was to work with neural networks.

The project combines the two: the method and real data of the second, the network of the first.

I measure the error in three directions: radial (too high or too low), along-track (ahead or behind) and cross-track (off to the side). The percentages below are the share of SGP4's error left after correction, over 14 days.

### Overfitting

My first models all ran into the same problem: overfitting. That was what surprised me most. I pictured models as boxes you feed as much data as possible, and they figure things out on their own. Instead, they just memorized the data.

The fix came down to fewer inputs (and better-chosen ones), proper validation, and stopping training at the right moment.

![Remaining along-track error, on the training and test sets](/projects/orbitml/surapprentissage.webp "The error keeps falling on the training set, but climbs back up on the test set after a few epochs.")

Each input I kept comes from an observation about the error. B\*, the TLE's drag coefficient, closely follows the along-track drift: a B\* that is too large slows the satellite down too much in SGP4. What remains after that oscillates with a 60-day period, the period of the angle between the orbit plane and the Sun, which I added as an input too.

### Longitude

Even after all that, the models still weren't very good: 63% of the along-track error remained. The network knows the satellite's position in a frame that doesn't rotate with the Earth, so it can't tell which place it is flying over. Yet SGP4 treats the Earth as symmetric around its axis, while gravity also varies from one longitude to another.

The map below confirms it: it shows the error depending on where the satellite is above the Earth. It reveals that the equator isn't a perfect circle: the Earth is slightly oval, hence the two lobes.

Adding longitude as an input cuts the along-track error from 63% to 39%, and the radial error from 36% to 13%.

![Map of the radial error averaged over 3-degree cells, forming two opposite lobes](/projects/orbitml/longitude.webp "The mean radial error, before the network knows where the satellite is.")

### Results and limits

Over 14 days, the final network leaves 13% of the radial error, 39% of the along-track error and 18% of the cross-track error. I then rewrote it in PyTorch, which I wanted to try and which taught me quite a lot: it reaches the same scores.

![Cloud of the 96 test TLEs at 14 days, stretched along the orbit](/projects/orbitml/derive.webp "SGP4's drift at 14 days, from 96 TLEs held out for testing.")

![The same cloud, with the corrected points in green, pulled in tight](/projects/orbitml/correction.webp "The same cloud after correction, in green.")

These numbers have their limits: one satellite, one year… Complex physical effects such as solar radiation pressure, or that oval equator (the C22 term), would be worth digging into.

Other satellites and other years would be the logical next step, but that would be more orbit determination than machine learning, and neural networks were what I set out to work on.

### References

[1] H. Peng and X. Bai, *Artificial Neural Network–Based Machine Learning Approach to Improve Orbit Prediction Accuracy*, Journal of Spacecraft and Rockets, 55(5), 2018.

[2] H. Peng and X. Bai, *Machine Learning Approach to Improve Satellite Orbit Prediction Accuracy Using Publicly Available Data*, The Journal of the Astronautical Sciences, 2019.
