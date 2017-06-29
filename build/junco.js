(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @license
	 * Copyright 2016 Google Inc. All Rights Reserved.
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

	'use strict';

	// Primary namespace for Junco library.
	exports.Junco = __webpack_require__(1);

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @license
	 * Copyright 2016 Google Inc. All Rights Reserved.
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

	/**
	 * @fileOverview Junco library name space and common utilities.
	 */

	'use strict';

	/**
	 * @class Junco main namespace.
	 */
	var Junco = {};

	// Internal dependencies.
	var Listener = __webpack_require__(2);
	var Source = __webpack_require__(10);

	/**
	 * @class Listener
	 * @description Listener model to spatialize sources in an environment.
	 * @param {AudioContext} context            Associated AudioContext.
	 * @param {Object} options
	 * @param {Number} options.ambisonicOrder   Desired Ambisonic Order.
	 * @param {Number} options.speedOfSound     Speed of Sound (in meters / second).
	 * @param {Array} options.roomDimensions    Size dimensions in meters (w, h, d).
	 * @param {Array} options.roomMaterials     Absorption coeffs (L,R,U,D,F,B).
	 */
	Junco.createListener = function (context, options) {
	  return new Listener(context, options);
	}

	/**
	 * @class Source
	 * @description Source model to spatialize an AudioBuffer.
	 * @param {AudioContext} context        Associated AudioContext.
	 * @param {Object} options
	 * @param {Number} options.ambisonicOrder   Desired Ambisonic Order.
	 * @param {Number} options.minDistance      Min. distance (in meters).
	 * @param {Number} options.maxDistance      Max. distance (in meters).
	 */
	Junco.createSource = function(listener, options) {
	  return new Source(listener, options);
	}

	module.exports = Junco;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @license
	 * Copyright 2016 Google Inc. All Rights Reserved.
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

	/**
	 * @fileOverview Listener model to spatialize sources in an environment.
	 */

	'use strict';

	// Internal dependencies.
	var RoomReflectionsFilter = __webpack_require__(3);
	var LateReverbFilter = __webpack_require__(9);

	/**
	 * @class Listener
	 * @description Listener model to spatialize sources in an environment.
	 * @param {AudioContext} context            Associated AudioContext.
	 * @param {Object} options
	 * @param {Number} options.ambisonicOrder   Desired Ambisonic Order.
	 * @param {Number} options.speedOfSound     Speed of Sound (in meters / second).
	 * @param {Array} options.roomDimensions    Size dimensions in meters (w, h, d).
	 * @param {Array} options.roomMaterials     Absorption coeffs (L,R,U,D,F,B).
	 */
	function Listener (context, options) {
	  this._context = context;

	  this._options = options;

	  this.early = this._context.createGain();
	  this.late = this._context.createGain();
	  this._earlyReflections =
	    new RoomReflectionsFilter(this._context, this._options);
	  this._lateReflections = new LateReverbFilter(this._context, this._options);
	  this.output = this._context.createGain();

	  this.early.connect(this._earlyReflections.input);
	  this.late.connect(this._lateReflections.input);
	  this._earlyReflections.output.connect(this.output);
	  this._lateReflections.output.connect(this.output);

	  // Initialize listener state.
	  this.position = [this._options.roomDimensions[0] / 2,
	                   this._options.roomDimensions[1] / 2,
	                   this._options.roomDimensions[2] / 2];
	  this.velocity = [0, 0, 0];
	}

	Listener.prototype.setPosition = function (x, y, z) {
	  this.position[0] = x;
	  this.position[1] = y;
	  this.position[2] = z;
	  this._earlyReflections.setListenerPosition(x, y, z);
	}

	Listener.prototype.setRoomProperties = function(dimensions, materials) {
	  // Set new properties.
	  this._options.roomDimensions = dimensions;
	  this._options.roomMaterials = materials;

	  // Disconnect reverb from pipeline.
	  this.early.disconnect(this._earlyReflections);
	  this._earlyReflections.output.disconnect(this.output);
	  this.late.disconnect(this._lateReflections);
	  this._lateReflections.output.disconnect(this.output);

	  // Delete previous references.
	  delete this._earlyReflections;
	  delete this._lateReflections;

	  // Replace with new objects.
	  this._earlyReflections = new RoomReflectionsFilter(this._context, this._options);
	  this._lateReflections = new LateReverbFilter(this._context, this._options);

	  // Reconnect to the pipeline.
	  this.early.connect(this._earlyReflections.input);
	  this.late.connect(this._lateReflections.input);
	  this._earlyReflections.output.connect(this.output);
	  this._lateReflections.output.connect(this.output);
	}

	Listener.prototype.setRoomDimensions = function(w, h, d) {
	  this.setRoomProperties([w, h, d], this._options.roomMaterials);
	}

	Listener.prototype.setRoomMaterials = function(l, r, b, f, d, u) {
	  this.setRoomProperties(this._options.roomDimensions, [l, r, b, f, d, u]);
	}

	module.exports = Listener;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @license
	 * Copyright 2016 Google Inc. All Rights Reserved.
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

	/**
	 * @fileOverview Ray-based Room Reflections model.
	 */

	'use strict';

	// Internal dependencies.
	var AttenuationFilter = __webpack_require__(4);
	var PropagationFilter = __webpack_require__(5);
	var AmbisonicEncoder = __webpack_require__(6);

	/**
	 * @class RoomReflectionsFilter
	 * @description Ray-based Room Reflections model.
	 * @param {AudioContext} context            Associated AudioContext
	 * @param {Object} options
	 * @param {Number} options.ambisonicOrder   Desired Ambisonic Order.
	 * @param {Number} options.speedOfSound     Speed of Sound (in meters / second).
	 * @param {Array} options.roomDimensions    Size dimensions in meters (w, h, d).
	 * @param {Array} options.roomMaterials     Absorption coeffs (L,R,U,D,F,B).
	 */
	function RoomReflectionsFilter (context, options) {
	  var maxDistance;
	  var minDistance = 1;
	  var azimuths = [90, -90, 0, 0, 0, 180];
	  var elevations = [0, 0, 90, -90, 0, 0];
	  this._context = context;

	  this._roomDimensions = options.roomDimensions;
	  this._roomMaterials = options.roomMaterials;

	  maxDistance = Math.sqrt(this._roomDimensions[0] * this._roomDimensions[0] +
	                          this._roomDimensions[1] * this._roomDimensions[1] +
	                          this._roomDimensions[2] * this._roomDimensions[2]);

	  this.input = context.createGain();
	  this.output = context.createGain();

	  this._absorptions = Array(6);
	  this._attenuations = Array(6);
	  this._propagations = Array(6);
	  this._encoders = Array(6);
	  for (var i = 0; i < 6; i++) {
	    // Construct nodes.
	    this._absorptions[i] = context.createGain();
	    this._attenuations[i] =
	      new AttenuationFilter(context, minDistance, maxDistance);
	    this._propagations[i] =
	      new PropagationFilter(context, maxDistance, options.speedOfSound);
	    this._encoders[i] = new AmbisonicEncoder(context, options.ambisonicOrder);

	    // Constant intializations.
	    this._absorptions[i].gain.value = Math.sqrt(1 - this._roomMaterials[i]);
	    this._encoders[i].setDirection(azimuths[i], elevations[i]);

	    // Connect in parallel.
	    this.input.connect(this._absorptions[i]);
	    this._absorptions[i].connect(this._attenuations[i].input);
	    this._attenuations[i].output.connect(this._propagations[i].input);
	    this._propagations[i].output.connect(this._encoders[i].input);
	    this._encoders[i].output.connect(this.output);
	  }

	  // Place the listener in the middle of the room.
	  this.setListenerPosition(this._roomDimensions[0] / 2,
	                           this._roomDimensions[1] / 2,
	                           this._roomDimensions[2] / 2);
	}

	RoomReflectionsFilter.prototype.setListenerPosition = function(x, y, z) {
	  var distances = Array(6);
	  distances[0] = 2 * x;
	  distances[1] = 2 * this._roomDimensions[0] - distances[0];
	  distances[2] = 2 * y;
	  distances[3] = 2 * this._roomDimensions[1] - distances[2];
	  distances[4] = 2 * z;
	  distances[5] = 2 * this._roomDimensions[2] - distances[4];
	  for (var i = 0; i < 6; i++) {
	    this._attenuations[i].setDistance(distances[i]);
	    this._propagations[i].setDistance(distances[i]);
	  }
	}

	module.exports = RoomReflectionsFilter;

/***/ }),
/* 4 */
/***/ (function(module, exports) {

	/**
	 * @license
	 * Copyright 2016 Google Inc. All Rights Reserved.
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

	/**
	 * @fileOverview Distance-based Attenuation Filter for an AudioBuffer.
	 */

	'use strict';

	//TODO(bitllama) Add rolloff options.

	/**
	 * @class AttenuationFilter
	 * @description Distance-based Attenuation Filter for an AudioBuffer.
	 * @param {AudioContext} context            Associated AudioContext.
	 * @param {Number} minDistance              Min. distance (in meters).
	 * @param {Number} maxDistance              Max. distance (in meters).
	 */
	function AttenuationFilter (context, minDistance, maxDistance) {
	  this._context = context;

	  this._minDistance = Math.max(0, minDistance);
	  this._maxDistance = Math.min(Number.MAX_VALUE, maxDistance);
	  this._distance = 0;

	  this._gainNode = this._context.createGain();

	  this.setDistance(this._maxDistance);

	  // Input/Output proxy.
	  this.input = this._gainNode;
	  this.output = this._gainNode;
	}

	AttenuationFilter.prototype.setDistance = function(distance) {
	  var attenuation = 0;
	  this._distance = Math.min(this._maxDistance, Math.max(this._minDistance, distance));
	  if (this._distance > 0) {
	    attenuation = 1 / this._distance;
	  }
	  this._gainNode.gain.value = attenuation;
	}

	module.exports = AttenuationFilter;

/***/ }),
/* 5 */
/***/ (function(module, exports) {

	/**
	 * @license
	 * Copyright 2016 Google Inc. All Rights Reserved.
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

	/**
	 * @fileOverview Propagation-delay Filter for an AudioBuffer.
	 */

	'use strict';

	/**
	 * @class PropagationFilter
	 * @description Propagation-delay Filter for an AudioBuffer.
	 * @param {AudioContext} context        Associated AudioContext.
	 * @param {Number} maxDistance          Max. distance (in meters).
	 * @param {Number} speedOfSound         Speed of Sound (in meters / second).
	 *                                      Set to 0 to disable delayline.
	 */
	function PropagationFilter (context, maxDistance, speedOfSound) {
	  var maxDelayInSecs;

	  this._context = context;
	  if (speedOfSound > 0) {
	    this._recipSpeedOfSound = 1 / speedOfSound;
	  } else {
	    this._recipSpeedOfSound = 0;
	  }

	  this._maxDistance = maxDistance;
	  this._distance = 0;

	  maxDelayInSecs = this._maxDistance * this._recipSpeedOfSound;
	  this._delayNode = this._context.createDelay(maxDelayInSecs);

	  this.setDistance(maxDistance);

	  // Input/Output proxy.
	  this.input = this._delayNode;
	  this.output = this._delayNode;
	}

	PropagationFilter.prototype.setDistance = function(distance) {
	  var delay = 0;
	  this._distance = Math.min(this._maxDistance, Math.max(0, distance));
	  if (this._distance > 0) {
	    delay = this._distance * this._recipSpeedOfSound;
	  }
	  this._delayNode.delayTime.value = delay;
	}

	module.exports = PropagationFilter;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @license
	 * Copyright 2016 Google Inc. All Rights Reserved.
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

	/**
	 * @fileOverview Ambisonic Encoder of AudioBuffer.
	 */

	'use strict';

	// Internal dependencies.
	var AmbisonicEncoderTable = __webpack_require__(7);
	var AmbisonicEncoderTableMaxOrder = AmbisonicEncoderTable[0][0].length / 2;
	var Utils = __webpack_require__(8);

	/**
	 * @class AmbisonicEncoder
	 * @description Ambisonic Encoder of AudioBuffer.
	 * @param {AudioContext} context        Associated AudioContext.
	 * @param {Number} ambisonicOrder       Desired Ambisonic Order.
	 */
	function AmbisonicEncoder (context, ambisonicOrder) {
	  this._active = false;

	  this._context = context;
	  this._ambisonicOrder = ambisonicOrder;
	  if (this._ambisonicOrder > AmbisonicEncoderTableMaxOrder) {
	    Utils.log('Junco (Error):\nUnable to render ambisonic order',
	      ambisonic_order, '(Max order is', AmbisonicEncoderTableMaxOrder,
	      ')\nUsing max order instead.');
	    this._ambisonicOrder = AmbisonicEncoderTableMaxOrder;
	  }

	  var num_channels = (this._ambisonicOrder + 1) * (this._ambisonicOrder + 1);
	  this._merger = this._context.createChannelMerger(num_channels);
	  this._masterGain = this._context.createGain();
	  this._channelGain = new Array(num_channels);
	  for (var i = 0; i < num_channels; i++) {
	    this._channelGain[i] = this._context.createGain();
	    this._masterGain.connect(this._channelGain[i]);
	    this._channelGain[i].connect(this._merger, 0, i);
	  }

	  // Input/Output proxy.
	  this.input = this._masterGain;
	  this.output = this._merger;
	}

	/**
	 * Set the direction of the encoded source signal.
	 * @param {Number} azimuth              Azimuth (in degrees)
	 * @param {Number} elevation            Elevation (in degrees)
	 */
	AmbisonicEncoder.prototype.setDirection = function(azimuth, elevation) {
	  var l, m;
	  var azi_index, ele_index, acn_index;
	  var val;

	  // Format input direction to nearest indices.
	  if (isNaN(azimuth)) {
	    azimuth = 0;
	  }
	  if (isNaN(elevation)) {
	    elevation = 0;
	  }

	  azimuth = Math.round(azimuth % 360);
	  if (azimuth < 0) {
	    azimuth += 360;
	  }
	  elevation = Math.round(elevation) + 90;

	  // Assign gains to each output.
	  for (l = 1; l <= this._ambisonicOrder; l++) {
	    for (m = -l; m <= l; m++) {
	      acn_index = (l * l) + l + m;
	      ele_index = l * (l + 1) / 2 + Math.abs(m) - 1;
	      val = AmbisonicEncoderTable[1][elevation][ele_index];
	      azi_index = NaN;
	      if (m != 0) {
	        if (m < 0) {
	          azi_index = AmbisonicEncoderTableMaxOrder + m;
	        } else {
	          azi_index = AmbisonicEncoderTableMaxOrder + m - 1;
	        }
	        val *= AmbisonicEncoderTable[0][azimuth][azi_index];
	      }
	      this._channelGain[acn_index].gain.value = val;
	    }
	  }
	}

	module.exports = AmbisonicEncoder;

/***/ }),
/* 7 */
/***/ (function(module, exports) {

	/**
	 * Copyright 2017 Google Inc. All Rights Reserved.
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

	/**
	 * @fileOverview Pre-computed lookup tables of spherical harmonics.
	 */

	'use strict';

	/**
	 * @var AmbisonicEncoderTable
	 * @description Pre-computed Spherical Harmonics Coefficients.
	 */
	var AmbisonicEncoderTable =
	[
	  [
	    [
	      0,
	      0,
	      0,
	      1,
	      1,
	      1
	    ],
	    [
	      0.0523359552,
	      0.0348994955,
	      0.0174524058,
	      0.99984771,
	      0.999390841,
	      0.99862951
	    ],
	    [
	      0.104528464,
	      0.0697564706,
	      0.0348994955,
	      0.999390841,
	      0.997564077,
	      0.994521916
	    ],
	    [
	      0.156434461,
	      0.104528464,
	      0.0523359552,
	      0.99862951,
	      0.994521916,
	      0.987688363
	    ],
	    [
	      0.207911685,
	      0.139173105,
	      0.0697564706,
	      0.997564077,
	      0.990268052,
	      0.978147626
	    ],
	    [
	      0.258819044,
	      0.173648179,
	      0.0871557444,
	      0.99619472,
	      0.98480773,
	      0.965925813
	    ],
	    [
	      0.309017,
	      0.207911685,
	      0.104528464,
	      0.994521916,
	      0.978147626,
	      0.95105654
	    ],
	    [
	      0.35836795,
	      0.241921902,
	      0.121869341,
	      0.992546141,
	      0.970295727,
	      0.933580399
	    ],
	    [
	      0.406736642,
	      0.275637358,
	      0.139173105,
	      0.990268052,
	      0.96126169,
	      0.91354543
	    ],
	    [
	      0.453990489,
	      0.309017,
	      0.156434461,
	      0.987688363,
	      0.95105654,
	      0.891006529
	    ],
	    [
	      0.5,
	      0.342020154,
	      0.173648179,
	      0.98480773,
	      0.939692616,
	      0.866025388
	    ],
	    [
	      0.544639051,
	      0.37460658,
	      0.190809,
	      0.981627166,
	      0.927183867,
	      0.838670552
	    ],
	    [
	      0.587785244,
	      0.406736642,
	      0.207911685,
	      0.978147626,
	      0.91354543,
	      0.809017
	    ],
	    [
	      0.629320383,
	      0.438371152,
	      0.224951059,
	      0.974370062,
	      0.898794055,
	      0.777146
	    ],
	    [
	      0.669130623,
	      0.469471574,
	      0.241921902,
	      0.970295727,
	      0.882947564,
	      0.74314481
	    ],
	    [
	      0.707106769,
	      0.5,
	      0.258819044,
	      0.965925813,
	      0.866025388,
	      0.707106769
	    ],
	    [
	      0.74314481,
	      0.529919267,
	      0.275637358,
	      0.96126169,
	      0.848048091,
	      0.669130623
	    ],
	    [
	      0.777146,
	      0.559192896,
	      0.29237169,
	      0.956304729,
	      0.829037547,
	      0.629320383
	    ],
	    [
	      0.809017,
	      0.587785244,
	      0.309017,
	      0.95105654,
	      0.809017,
	      0.587785244
	    ],
	    [
	      0.838670552,
	      0.615661502,
	      0.325568169,
	      0.945518553,
	      0.788010776,
	      0.544639051
	    ],
	    [
	      0.866025388,
	      0.642787635,
	      0.342020154,
	      0.939692616,
	      0.766044438,
	      0.5
	    ],
	    [
	      0.891006529,
	      0.669130623,
	      0.35836795,
	      0.933580399,
	      0.74314481,
	      0.453990489
	    ],
	    [
	      0.91354543,
	      0.694658399,
	      0.37460658,
	      0.927183867,
	      0.719339788,
	      0.406736642
	    ],
	    [
	      0.933580399,
	      0.719339788,
	      0.390731126,
	      0.920504868,
	      0.694658399,
	      0.35836795
	    ],
	    [
	      0.95105654,
	      0.74314481,
	      0.406736642,
	      0.91354543,
	      0.669130623,
	      0.309017
	    ],
	    [
	      0.965925813,
	      0.766044438,
	      0.42261827,
	      0.906307817,
	      0.642787635,
	      0.258819044
	    ],
	    [
	      0.978147626,
	      0.788010776,
	      0.438371152,
	      0.898794055,
	      0.615661502,
	      0.207911685
	    ],
	    [
	      0.987688363,
	      0.809017,
	      0.453990489,
	      0.891006529,
	      0.587785244,
	      0.156434461
	    ],
	    [
	      0.994521916,
	      0.829037547,
	      0.469471574,
	      0.882947564,
	      0.559192896,
	      0.104528464
	    ],
	    [
	      0.99862951,
	      0.848048091,
	      0.484809607,
	      0.874619722,
	      0.529919267,
	      0.0523359552
	    ],
	    [
	      1,
	      0.866025388,
	      0.5,
	      0.866025388,
	      0.5,
	      6.12323426e-17
	    ],
	    [
	      0.99862951,
	      0.882947564,
	      0.515038073,
	      0.857167304,
	      0.469471574,
	      -0.0523359552
	    ],
	    [
	      0.994521916,
	      0.898794055,
	      0.529919267,
	      0.848048091,
	      0.438371152,
	      -0.104528464
	    ],
	    [
	      0.987688363,
	      0.91354543,
	      0.544639051,
	      0.838670552,
	      0.406736642,
	      -0.156434461
	    ],
	    [
	      0.978147626,
	      0.927183867,
	      0.559192896,
	      0.829037547,
	      0.37460658,
	      -0.207911685
	    ],
	    [
	      0.965925813,
	      0.939692616,
	      0.57357645,
	      0.819152057,
	      0.342020154,
	      -0.258819044
	    ],
	    [
	      0.95105654,
	      0.95105654,
	      0.587785244,
	      0.809017,
	      0.309017,
	      -0.309017
	    ],
	    [
	      0.933580399,
	      0.96126169,
	      0.601815045,
	      0.798635483,
	      0.275637358,
	      -0.35836795
	    ],
	    [
	      0.91354543,
	      0.970295727,
	      0.615661502,
	      0.788010776,
	      0.241921902,
	      -0.406736642
	    ],
	    [
	      0.891006529,
	      0.978147626,
	      0.629320383,
	      0.777146,
	      0.207911685,
	      -0.453990489
	    ],
	    [
	      0.866025388,
	      0.98480773,
	      0.642787635,
	      0.766044438,
	      0.173648179,
	      -0.5
	    ],
	    [
	      0.838670552,
	      0.990268052,
	      0.656059,
	      0.754709601,
	      0.139173105,
	      -0.544639051
	    ],
	    [
	      0.809017,
	      0.994521916,
	      0.669130623,
	      0.74314481,
	      0.104528464,
	      -0.587785244
	    ],
	    [
	      0.777146,
	      0.997564077,
	      0.681998372,
	      0.7313537,
	      0.0697564706,
	      -0.629320383
	    ],
	    [
	      0.74314481,
	      0.999390841,
	      0.694658399,
	      0.719339788,
	      0.0348994955,
	      -0.669130623
	    ],
	    [
	      0.707106769,
	      1,
	      0.707106769,
	      0.707106769,
	      6.12323426e-17,
	      -0.707106769
	    ],
	    [
	      0.669130623,
	      0.999390841,
	      0.719339788,
	      0.694658399,
	      -0.0348994955,
	      -0.74314481
	    ],
	    [
	      0.629320383,
	      0.997564077,
	      0.7313537,
	      0.681998372,
	      -0.0697564706,
	      -0.777146
	    ],
	    [
	      0.587785244,
	      0.994521916,
	      0.74314481,
	      0.669130623,
	      -0.104528464,
	      -0.809017
	    ],
	    [
	      0.544639051,
	      0.990268052,
	      0.754709601,
	      0.656059,
	      -0.139173105,
	      -0.838670552
	    ],
	    [
	      0.5,
	      0.98480773,
	      0.766044438,
	      0.642787635,
	      -0.173648179,
	      -0.866025388
	    ],
	    [
	      0.453990489,
	      0.978147626,
	      0.777146,
	      0.629320383,
	      -0.207911685,
	      -0.891006529
	    ],
	    [
	      0.406736642,
	      0.970295727,
	      0.788010776,
	      0.615661502,
	      -0.241921902,
	      -0.91354543
	    ],
	    [
	      0.35836795,
	      0.96126169,
	      0.798635483,
	      0.601815045,
	      -0.275637358,
	      -0.933580399
	    ],
	    [
	      0.309017,
	      0.95105654,
	      0.809017,
	      0.587785244,
	      -0.309017,
	      -0.95105654
	    ],
	    [
	      0.258819044,
	      0.939692616,
	      0.819152057,
	      0.57357645,
	      -0.342020154,
	      -0.965925813
	    ],
	    [
	      0.207911685,
	      0.927183867,
	      0.829037547,
	      0.559192896,
	      -0.37460658,
	      -0.978147626
	    ],
	    [
	      0.156434461,
	      0.91354543,
	      0.838670552,
	      0.544639051,
	      -0.406736642,
	      -0.987688363
	    ],
	    [
	      0.104528464,
	      0.898794055,
	      0.848048091,
	      0.529919267,
	      -0.438371152,
	      -0.994521916
	    ],
	    [
	      0.0523359552,
	      0.882947564,
	      0.857167304,
	      0.515038073,
	      -0.469471574,
	      -0.99862951
	    ],
	    [
	      1.22464685e-16,
	      0.866025388,
	      0.866025388,
	      0.5,
	      -0.5,
	      -1
	    ],
	    [
	      -0.0523359552,
	      0.848048091,
	      0.874619722,
	      0.484809607,
	      -0.529919267,
	      -0.99862951
	    ],
	    [
	      -0.104528464,
	      0.829037547,
	      0.882947564,
	      0.469471574,
	      -0.559192896,
	      -0.994521916
	    ],
	    [
	      -0.156434461,
	      0.809017,
	      0.891006529,
	      0.453990489,
	      -0.587785244,
	      -0.987688363
	    ],
	    [
	      -0.207911685,
	      0.788010776,
	      0.898794055,
	      0.438371152,
	      -0.615661502,
	      -0.978147626
	    ],
	    [
	      -0.258819044,
	      0.766044438,
	      0.906307817,
	      0.42261827,
	      -0.642787635,
	      -0.965925813
	    ],
	    [
	      -0.309017,
	      0.74314481,
	      0.91354543,
	      0.406736642,
	      -0.669130623,
	      -0.95105654
	    ],
	    [
	      -0.35836795,
	      0.719339788,
	      0.920504868,
	      0.390731126,
	      -0.694658399,
	      -0.933580399
	    ],
	    [
	      -0.406736642,
	      0.694658399,
	      0.927183867,
	      0.37460658,
	      -0.719339788,
	      -0.91354543
	    ],
	    [
	      -0.453990489,
	      0.669130623,
	      0.933580399,
	      0.35836795,
	      -0.74314481,
	      -0.891006529
	    ],
	    [
	      -0.5,
	      0.642787635,
	      0.939692616,
	      0.342020154,
	      -0.766044438,
	      -0.866025388
	    ],
	    [
	      -0.544639051,
	      0.615661502,
	      0.945518553,
	      0.325568169,
	      -0.788010776,
	      -0.838670552
	    ],
	    [
	      -0.587785244,
	      0.587785244,
	      0.95105654,
	      0.309017,
	      -0.809017,
	      -0.809017
	    ],
	    [
	      -0.629320383,
	      0.559192896,
	      0.956304729,
	      0.29237169,
	      -0.829037547,
	      -0.777146
	    ],
	    [
	      -0.669130623,
	      0.529919267,
	      0.96126169,
	      0.275637358,
	      -0.848048091,
	      -0.74314481
	    ],
	    [
	      -0.707106769,
	      0.5,
	      0.965925813,
	      0.258819044,
	      -0.866025388,
	      -0.707106769
	    ],
	    [
	      -0.74314481,
	      0.469471574,
	      0.970295727,
	      0.241921902,
	      -0.882947564,
	      -0.669130623
	    ],
	    [
	      -0.777146,
	      0.438371152,
	      0.974370062,
	      0.224951059,
	      -0.898794055,
	      -0.629320383
	    ],
	    [
	      -0.809017,
	      0.406736642,
	      0.978147626,
	      0.207911685,
	      -0.91354543,
	      -0.587785244
	    ],
	    [
	      -0.838670552,
	      0.37460658,
	      0.981627166,
	      0.190809,
	      -0.927183867,
	      -0.544639051
	    ],
	    [
	      -0.866025388,
	      0.342020154,
	      0.98480773,
	      0.173648179,
	      -0.939692616,
	      -0.5
	    ],
	    [
	      -0.891006529,
	      0.309017,
	      0.987688363,
	      0.156434461,
	      -0.95105654,
	      -0.453990489
	    ],
	    [
	      -0.91354543,
	      0.275637358,
	      0.990268052,
	      0.139173105,
	      -0.96126169,
	      -0.406736642
	    ],
	    [
	      -0.933580399,
	      0.241921902,
	      0.992546141,
	      0.121869341,
	      -0.970295727,
	      -0.35836795
	    ],
	    [
	      -0.95105654,
	      0.207911685,
	      0.994521916,
	      0.104528464,
	      -0.978147626,
	      -0.309017
	    ],
	    [
	      -0.965925813,
	      0.173648179,
	      0.99619472,
	      0.0871557444,
	      -0.98480773,
	      -0.258819044
	    ],
	    [
	      -0.978147626,
	      0.139173105,
	      0.997564077,
	      0.0697564706,
	      -0.990268052,
	      -0.207911685
	    ],
	    [
	      -0.987688363,
	      0.104528464,
	      0.99862951,
	      0.0523359552,
	      -0.994521916,
	      -0.156434461
	    ],
	    [
	      -0.994521916,
	      0.0697564706,
	      0.999390841,
	      0.0348994955,
	      -0.997564077,
	      -0.104528464
	    ],
	    [
	      -0.99862951,
	      0.0348994955,
	      0.99984771,
	      0.0174524058,
	      -0.999390841,
	      -0.0523359552
	    ],
	    [
	      -1,
	      1.22464685e-16,
	      1,
	      6.12323426e-17,
	      -1,
	      -1.83697015e-16
	    ],
	    [
	      -0.99862951,
	      -0.0348994955,
	      0.99984771,
	      -0.0174524058,
	      -0.999390841,
	      0.0523359552
	    ],
	    [
	      -0.994521916,
	      -0.0697564706,
	      0.999390841,
	      -0.0348994955,
	      -0.997564077,
	      0.104528464
	    ],
	    [
	      -0.987688363,
	      -0.104528464,
	      0.99862951,
	      -0.0523359552,
	      -0.994521916,
	      0.156434461
	    ],
	    [
	      -0.978147626,
	      -0.139173105,
	      0.997564077,
	      -0.0697564706,
	      -0.990268052,
	      0.207911685
	    ],
	    [
	      -0.965925813,
	      -0.173648179,
	      0.99619472,
	      -0.0871557444,
	      -0.98480773,
	      0.258819044
	    ],
	    [
	      -0.95105654,
	      -0.207911685,
	      0.994521916,
	      -0.104528464,
	      -0.978147626,
	      0.309017
	    ],
	    [
	      -0.933580399,
	      -0.241921902,
	      0.992546141,
	      -0.121869341,
	      -0.970295727,
	      0.35836795
	    ],
	    [
	      -0.91354543,
	      -0.275637358,
	      0.990268052,
	      -0.139173105,
	      -0.96126169,
	      0.406736642
	    ],
	    [
	      -0.891006529,
	      -0.309017,
	      0.987688363,
	      -0.156434461,
	      -0.95105654,
	      0.453990489
	    ],
	    [
	      -0.866025388,
	      -0.342020154,
	      0.98480773,
	      -0.173648179,
	      -0.939692616,
	      0.5
	    ],
	    [
	      -0.838670552,
	      -0.37460658,
	      0.981627166,
	      -0.190809,
	      -0.927183867,
	      0.544639051
	    ],
	    [
	      -0.809017,
	      -0.406736642,
	      0.978147626,
	      -0.207911685,
	      -0.91354543,
	      0.587785244
	    ],
	    [
	      -0.777146,
	      -0.438371152,
	      0.974370062,
	      -0.224951059,
	      -0.898794055,
	      0.629320383
	    ],
	    [
	      -0.74314481,
	      -0.469471574,
	      0.970295727,
	      -0.241921902,
	      -0.882947564,
	      0.669130623
	    ],
	    [
	      -0.707106769,
	      -0.5,
	      0.965925813,
	      -0.258819044,
	      -0.866025388,
	      0.707106769
	    ],
	    [
	      -0.669130623,
	      -0.529919267,
	      0.96126169,
	      -0.275637358,
	      -0.848048091,
	      0.74314481
	    ],
	    [
	      -0.629320383,
	      -0.559192896,
	      0.956304729,
	      -0.29237169,
	      -0.829037547,
	      0.777146
	    ],
	    [
	      -0.587785244,
	      -0.587785244,
	      0.95105654,
	      -0.309017,
	      -0.809017,
	      0.809017
	    ],
	    [
	      -0.544639051,
	      -0.615661502,
	      0.945518553,
	      -0.325568169,
	      -0.788010776,
	      0.838670552
	    ],
	    [
	      -0.5,
	      -0.642787635,
	      0.939692616,
	      -0.342020154,
	      -0.766044438,
	      0.866025388
	    ],
	    [
	      -0.453990489,
	      -0.669130623,
	      0.933580399,
	      -0.35836795,
	      -0.74314481,
	      0.891006529
	    ],
	    [
	      -0.406736642,
	      -0.694658399,
	      0.927183867,
	      -0.37460658,
	      -0.719339788,
	      0.91354543
	    ],
	    [
	      -0.35836795,
	      -0.719339788,
	      0.920504868,
	      -0.390731126,
	      -0.694658399,
	      0.933580399
	    ],
	    [
	      -0.309017,
	      -0.74314481,
	      0.91354543,
	      -0.406736642,
	      -0.669130623,
	      0.95105654
	    ],
	    [
	      -0.258819044,
	      -0.766044438,
	      0.906307817,
	      -0.42261827,
	      -0.642787635,
	      0.965925813
	    ],
	    [
	      -0.207911685,
	      -0.788010776,
	      0.898794055,
	      -0.438371152,
	      -0.615661502,
	      0.978147626
	    ],
	    [
	      -0.156434461,
	      -0.809017,
	      0.891006529,
	      -0.453990489,
	      -0.587785244,
	      0.987688363
	    ],
	    [
	      -0.104528464,
	      -0.829037547,
	      0.882947564,
	      -0.469471574,
	      -0.559192896,
	      0.994521916
	    ],
	    [
	      -0.0523359552,
	      -0.848048091,
	      0.874619722,
	      -0.484809607,
	      -0.529919267,
	      0.99862951
	    ],
	    [
	      -2.44929371e-16,
	      -0.866025388,
	      0.866025388,
	      -0.5,
	      -0.5,
	      1
	    ],
	    [
	      0.0523359552,
	      -0.882947564,
	      0.857167304,
	      -0.515038073,
	      -0.469471574,
	      0.99862951
	    ],
	    [
	      0.104528464,
	      -0.898794055,
	      0.848048091,
	      -0.529919267,
	      -0.438371152,
	      0.994521916
	    ],
	    [
	      0.156434461,
	      -0.91354543,
	      0.838670552,
	      -0.544639051,
	      -0.406736642,
	      0.987688363
	    ],
	    [
	      0.207911685,
	      -0.927183867,
	      0.829037547,
	      -0.559192896,
	      -0.37460658,
	      0.978147626
	    ],
	    [
	      0.258819044,
	      -0.939692616,
	      0.819152057,
	      -0.57357645,
	      -0.342020154,
	      0.965925813
	    ],
	    [
	      0.309017,
	      -0.95105654,
	      0.809017,
	      -0.587785244,
	      -0.309017,
	      0.95105654
	    ],
	    [
	      0.35836795,
	      -0.96126169,
	      0.798635483,
	      -0.601815045,
	      -0.275637358,
	      0.933580399
	    ],
	    [
	      0.406736642,
	      -0.970295727,
	      0.788010776,
	      -0.615661502,
	      -0.241921902,
	      0.91354543
	    ],
	    [
	      0.453990489,
	      -0.978147626,
	      0.777146,
	      -0.629320383,
	      -0.207911685,
	      0.891006529
	    ],
	    [
	      0.5,
	      -0.98480773,
	      0.766044438,
	      -0.642787635,
	      -0.173648179,
	      0.866025388
	    ],
	    [
	      0.544639051,
	      -0.990268052,
	      0.754709601,
	      -0.656059,
	      -0.139173105,
	      0.838670552
	    ],
	    [
	      0.587785244,
	      -0.994521916,
	      0.74314481,
	      -0.669130623,
	      -0.104528464,
	      0.809017
	    ],
	    [
	      0.629320383,
	      -0.997564077,
	      0.7313537,
	      -0.681998372,
	      -0.0697564706,
	      0.777146
	    ],
	    [
	      0.669130623,
	      -0.999390841,
	      0.719339788,
	      -0.694658399,
	      -0.0348994955,
	      0.74314481
	    ],
	    [
	      0.707106769,
	      -1,
	      0.707106769,
	      -0.707106769,
	      -1.83697015e-16,
	      0.707106769
	    ],
	    [
	      0.74314481,
	      -0.999390841,
	      0.694658399,
	      -0.719339788,
	      0.0348994955,
	      0.669130623
	    ],
	    [
	      0.777146,
	      -0.997564077,
	      0.681998372,
	      -0.7313537,
	      0.0697564706,
	      0.629320383
	    ],
	    [
	      0.809017,
	      -0.994521916,
	      0.669130623,
	      -0.74314481,
	      0.104528464,
	      0.587785244
	    ],
	    [
	      0.838670552,
	      -0.990268052,
	      0.656059,
	      -0.754709601,
	      0.139173105,
	      0.544639051
	    ],
	    [
	      0.866025388,
	      -0.98480773,
	      0.642787635,
	      -0.766044438,
	      0.173648179,
	      0.5
	    ],
	    [
	      0.891006529,
	      -0.978147626,
	      0.629320383,
	      -0.777146,
	      0.207911685,
	      0.453990489
	    ],
	    [
	      0.91354543,
	      -0.970295727,
	      0.615661502,
	      -0.788010776,
	      0.241921902,
	      0.406736642
	    ],
	    [
	      0.933580399,
	      -0.96126169,
	      0.601815045,
	      -0.798635483,
	      0.275637358,
	      0.35836795
	    ],
	    [
	      0.95105654,
	      -0.95105654,
	      0.587785244,
	      -0.809017,
	      0.309017,
	      0.309017
	    ],
	    [
	      0.965925813,
	      -0.939692616,
	      0.57357645,
	      -0.819152057,
	      0.342020154,
	      0.258819044
	    ],
	    [
	      0.978147626,
	      -0.927183867,
	      0.559192896,
	      -0.829037547,
	      0.37460658,
	      0.207911685
	    ],
	    [
	      0.987688363,
	      -0.91354543,
	      0.544639051,
	      -0.838670552,
	      0.406736642,
	      0.156434461
	    ],
	    [
	      0.994521916,
	      -0.898794055,
	      0.529919267,
	      -0.848048091,
	      0.438371152,
	      0.104528464
	    ],
	    [
	      0.99862951,
	      -0.882947564,
	      0.515038073,
	      -0.857167304,
	      0.469471574,
	      0.0523359552
	    ],
	    [
	      1,
	      -0.866025388,
	      0.5,
	      -0.866025388,
	      0.5,
	      3.061617e-16
	    ],
	    [
	      0.99862951,
	      -0.848048091,
	      0.484809607,
	      -0.874619722,
	      0.529919267,
	      -0.0523359552
	    ],
	    [
	      0.994521916,
	      -0.829037547,
	      0.469471574,
	      -0.882947564,
	      0.559192896,
	      -0.104528464
	    ],
	    [
	      0.987688363,
	      -0.809017,
	      0.453990489,
	      -0.891006529,
	      0.587785244,
	      -0.156434461
	    ],
	    [
	      0.978147626,
	      -0.788010776,
	      0.438371152,
	      -0.898794055,
	      0.615661502,
	      -0.207911685
	    ],
	    [
	      0.965925813,
	      -0.766044438,
	      0.42261827,
	      -0.906307817,
	      0.642787635,
	      -0.258819044
	    ],
	    [
	      0.95105654,
	      -0.74314481,
	      0.406736642,
	      -0.91354543,
	      0.669130623,
	      -0.309017
	    ],
	    [
	      0.933580399,
	      -0.719339788,
	      0.390731126,
	      -0.920504868,
	      0.694658399,
	      -0.35836795
	    ],
	    [
	      0.91354543,
	      -0.694658399,
	      0.37460658,
	      -0.927183867,
	      0.719339788,
	      -0.406736642
	    ],
	    [
	      0.891006529,
	      -0.669130623,
	      0.35836795,
	      -0.933580399,
	      0.74314481,
	      -0.453990489
	    ],
	    [
	      0.866025388,
	      -0.642787635,
	      0.342020154,
	      -0.939692616,
	      0.766044438,
	      -0.5
	    ],
	    [
	      0.838670552,
	      -0.615661502,
	      0.325568169,
	      -0.945518553,
	      0.788010776,
	      -0.544639051
	    ],
	    [
	      0.809017,
	      -0.587785244,
	      0.309017,
	      -0.95105654,
	      0.809017,
	      -0.587785244
	    ],
	    [
	      0.777146,
	      -0.559192896,
	      0.29237169,
	      -0.956304729,
	      0.829037547,
	      -0.629320383
	    ],
	    [
	      0.74314481,
	      -0.529919267,
	      0.275637358,
	      -0.96126169,
	      0.848048091,
	      -0.669130623
	    ],
	    [
	      0.707106769,
	      -0.5,
	      0.258819044,
	      -0.965925813,
	      0.866025388,
	      -0.707106769
	    ],
	    [
	      0.669130623,
	      -0.469471574,
	      0.241921902,
	      -0.970295727,
	      0.882947564,
	      -0.74314481
	    ],
	    [
	      0.629320383,
	      -0.438371152,
	      0.224951059,
	      -0.974370062,
	      0.898794055,
	      -0.777146
	    ],
	    [
	      0.587785244,
	      -0.406736642,
	      0.207911685,
	      -0.978147626,
	      0.91354543,
	      -0.809017
	    ],
	    [
	      0.544639051,
	      -0.37460658,
	      0.190809,
	      -0.981627166,
	      0.927183867,
	      -0.838670552
	    ],
	    [
	      0.5,
	      -0.342020154,
	      0.173648179,
	      -0.98480773,
	      0.939692616,
	      -0.866025388
	    ],
	    [
	      0.453990489,
	      -0.309017,
	      0.156434461,
	      -0.987688363,
	      0.95105654,
	      -0.891006529
	    ],
	    [
	      0.406736642,
	      -0.275637358,
	      0.139173105,
	      -0.990268052,
	      0.96126169,
	      -0.91354543
	    ],
	    [
	      0.35836795,
	      -0.241921902,
	      0.121869341,
	      -0.992546141,
	      0.970295727,
	      -0.933580399
	    ],
	    [
	      0.309017,
	      -0.207911685,
	      0.104528464,
	      -0.994521916,
	      0.978147626,
	      -0.95105654
	    ],
	    [
	      0.258819044,
	      -0.173648179,
	      0.0871557444,
	      -0.99619472,
	      0.98480773,
	      -0.965925813
	    ],
	    [
	      0.207911685,
	      -0.139173105,
	      0.0697564706,
	      -0.997564077,
	      0.990268052,
	      -0.978147626
	    ],
	    [
	      0.156434461,
	      -0.104528464,
	      0.0523359552,
	      -0.99862951,
	      0.994521916,
	      -0.987688363
	    ],
	    [
	      0.104528464,
	      -0.0697564706,
	      0.0348994955,
	      -0.999390841,
	      0.997564077,
	      -0.994521916
	    ],
	    [
	      0.0523359552,
	      -0.0348994955,
	      0.0174524058,
	      -0.99984771,
	      0.999390841,
	      -0.99862951
	    ],
	    [
	      3.67394029e-16,
	      -2.44929371e-16,
	      1.22464685e-16,
	      -1,
	      1,
	      -1
	    ],
	    [
	      -0.0523359552,
	      0.0348994955,
	      -0.0174524058,
	      -0.99984771,
	      0.999390841,
	      -0.99862951
	    ],
	    [
	      -0.104528464,
	      0.0697564706,
	      -0.0348994955,
	      -0.999390841,
	      0.997564077,
	      -0.994521916
	    ],
	    [
	      -0.156434461,
	      0.104528464,
	      -0.0523359552,
	      -0.99862951,
	      0.994521916,
	      -0.987688363
	    ],
	    [
	      -0.207911685,
	      0.139173105,
	      -0.0697564706,
	      -0.997564077,
	      0.990268052,
	      -0.978147626
	    ],
	    [
	      -0.258819044,
	      0.173648179,
	      -0.0871557444,
	      -0.99619472,
	      0.98480773,
	      -0.965925813
	    ],
	    [
	      -0.309017,
	      0.207911685,
	      -0.104528464,
	      -0.994521916,
	      0.978147626,
	      -0.95105654
	    ],
	    [
	      -0.35836795,
	      0.241921902,
	      -0.121869341,
	      -0.992546141,
	      0.970295727,
	      -0.933580399
	    ],
	    [
	      -0.406736642,
	      0.275637358,
	      -0.139173105,
	      -0.990268052,
	      0.96126169,
	      -0.91354543
	    ],
	    [
	      -0.453990489,
	      0.309017,
	      -0.156434461,
	      -0.987688363,
	      0.95105654,
	      -0.891006529
	    ],
	    [
	      -0.5,
	      0.342020154,
	      -0.173648179,
	      -0.98480773,
	      0.939692616,
	      -0.866025388
	    ],
	    [
	      -0.544639051,
	      0.37460658,
	      -0.190809,
	      -0.981627166,
	      0.927183867,
	      -0.838670552
	    ],
	    [
	      -0.587785244,
	      0.406736642,
	      -0.207911685,
	      -0.978147626,
	      0.91354543,
	      -0.809017
	    ],
	    [
	      -0.629320383,
	      0.438371152,
	      -0.224951059,
	      -0.974370062,
	      0.898794055,
	      -0.777146
	    ],
	    [
	      -0.669130623,
	      0.469471574,
	      -0.241921902,
	      -0.970295727,
	      0.882947564,
	      -0.74314481
	    ],
	    [
	      -0.707106769,
	      0.5,
	      -0.258819044,
	      -0.965925813,
	      0.866025388,
	      -0.707106769
	    ],
	    [
	      -0.74314481,
	      0.529919267,
	      -0.275637358,
	      -0.96126169,
	      0.848048091,
	      -0.669130623
	    ],
	    [
	      -0.777146,
	      0.559192896,
	      -0.29237169,
	      -0.956304729,
	      0.829037547,
	      -0.629320383
	    ],
	    [
	      -0.809017,
	      0.587785244,
	      -0.309017,
	      -0.95105654,
	      0.809017,
	      -0.587785244
	    ],
	    [
	      -0.838670552,
	      0.615661502,
	      -0.325568169,
	      -0.945518553,
	      0.788010776,
	      -0.544639051
	    ],
	    [
	      -0.866025388,
	      0.642787635,
	      -0.342020154,
	      -0.939692616,
	      0.766044438,
	      -0.5
	    ],
	    [
	      -0.891006529,
	      0.669130623,
	      -0.35836795,
	      -0.933580399,
	      0.74314481,
	      -0.453990489
	    ],
	    [
	      -0.91354543,
	      0.694658399,
	      -0.37460658,
	      -0.927183867,
	      0.719339788,
	      -0.406736642
	    ],
	    [
	      -0.933580399,
	      0.719339788,
	      -0.390731126,
	      -0.920504868,
	      0.694658399,
	      -0.35836795
	    ],
	    [
	      -0.95105654,
	      0.74314481,
	      -0.406736642,
	      -0.91354543,
	      0.669130623,
	      -0.309017
	    ],
	    [
	      -0.965925813,
	      0.766044438,
	      -0.42261827,
	      -0.906307817,
	      0.642787635,
	      -0.258819044
	    ],
	    [
	      -0.978147626,
	      0.788010776,
	      -0.438371152,
	      -0.898794055,
	      0.615661502,
	      -0.207911685
	    ],
	    [
	      -0.987688363,
	      0.809017,
	      -0.453990489,
	      -0.891006529,
	      0.587785244,
	      -0.156434461
	    ],
	    [
	      -0.994521916,
	      0.829037547,
	      -0.469471574,
	      -0.882947564,
	      0.559192896,
	      -0.104528464
	    ],
	    [
	      -0.99862951,
	      0.848048091,
	      -0.484809607,
	      -0.874619722,
	      0.529919267,
	      -0.0523359552
	    ],
	    [
	      -1,
	      0.866025388,
	      -0.5,
	      -0.866025388,
	      0.5,
	      1.34773043e-15
	    ],
	    [
	      -0.99862951,
	      0.882947564,
	      -0.515038073,
	      -0.857167304,
	      0.469471574,
	      0.0523359552
	    ],
	    [
	      -0.994521916,
	      0.898794055,
	      -0.529919267,
	      -0.848048091,
	      0.438371152,
	      0.104528464
	    ],
	    [
	      -0.987688363,
	      0.91354543,
	      -0.544639051,
	      -0.838670552,
	      0.406736642,
	      0.156434461
	    ],
	    [
	      -0.978147626,
	      0.927183867,
	      -0.559192896,
	      -0.829037547,
	      0.37460658,
	      0.207911685
	    ],
	    [
	      -0.965925813,
	      0.939692616,
	      -0.57357645,
	      -0.819152057,
	      0.342020154,
	      0.258819044
	    ],
	    [
	      -0.95105654,
	      0.95105654,
	      -0.587785244,
	      -0.809017,
	      0.309017,
	      0.309017
	    ],
	    [
	      -0.933580399,
	      0.96126169,
	      -0.601815045,
	      -0.798635483,
	      0.275637358,
	      0.35836795
	    ],
	    [
	      -0.91354543,
	      0.970295727,
	      -0.615661502,
	      -0.788010776,
	      0.241921902,
	      0.406736642
	    ],
	    [
	      -0.891006529,
	      0.978147626,
	      -0.629320383,
	      -0.777146,
	      0.207911685,
	      0.453990489
	    ],
	    [
	      -0.866025388,
	      0.98480773,
	      -0.642787635,
	      -0.766044438,
	      0.173648179,
	      0.5
	    ],
	    [
	      -0.838670552,
	      0.990268052,
	      -0.656059,
	      -0.754709601,
	      0.139173105,
	      0.544639051
	    ],
	    [
	      -0.809017,
	      0.994521916,
	      -0.669130623,
	      -0.74314481,
	      0.104528464,
	      0.587785244
	    ],
	    [
	      -0.777146,
	      0.997564077,
	      -0.681998372,
	      -0.7313537,
	      0.0697564706,
	      0.629320383
	    ],
	    [
	      -0.74314481,
	      0.999390841,
	      -0.694658399,
	      -0.719339788,
	      0.0348994955,
	      0.669130623
	    ],
	    [
	      -0.707106769,
	      1,
	      -0.707106769,
	      -0.707106769,
	      3.061617e-16,
	      0.707106769
	    ],
	    [
	      -0.669130623,
	      0.999390841,
	      -0.719339788,
	      -0.694658399,
	      -0.0348994955,
	      0.74314481
	    ],
	    [
	      -0.629320383,
	      0.997564077,
	      -0.7313537,
	      -0.681998372,
	      -0.0697564706,
	      0.777146
	    ],
	    [
	      -0.587785244,
	      0.994521916,
	      -0.74314481,
	      -0.669130623,
	      -0.104528464,
	      0.809017
	    ],
	    [
	      -0.544639051,
	      0.990268052,
	      -0.754709601,
	      -0.656059,
	      -0.139173105,
	      0.838670552
	    ],
	    [
	      -0.5,
	      0.98480773,
	      -0.766044438,
	      -0.642787635,
	      -0.173648179,
	      0.866025388
	    ],
	    [
	      -0.453990489,
	      0.978147626,
	      -0.777146,
	      -0.629320383,
	      -0.207911685,
	      0.891006529
	    ],
	    [
	      -0.406736642,
	      0.970295727,
	      -0.788010776,
	      -0.615661502,
	      -0.241921902,
	      0.91354543
	    ],
	    [
	      -0.35836795,
	      0.96126169,
	      -0.798635483,
	      -0.601815045,
	      -0.275637358,
	      0.933580399
	    ],
	    [
	      -0.309017,
	      0.95105654,
	      -0.809017,
	      -0.587785244,
	      -0.309017,
	      0.95105654
	    ],
	    [
	      -0.258819044,
	      0.939692616,
	      -0.819152057,
	      -0.57357645,
	      -0.342020154,
	      0.965925813
	    ],
	    [
	      -0.207911685,
	      0.927183867,
	      -0.829037547,
	      -0.559192896,
	      -0.37460658,
	      0.978147626
	    ],
	    [
	      -0.156434461,
	      0.91354543,
	      -0.838670552,
	      -0.544639051,
	      -0.406736642,
	      0.987688363
	    ],
	    [
	      -0.104528464,
	      0.898794055,
	      -0.848048091,
	      -0.529919267,
	      -0.438371152,
	      0.994521916
	    ],
	    [
	      -0.0523359552,
	      0.882947564,
	      -0.857167304,
	      -0.515038073,
	      -0.469471574,
	      0.99862951
	    ],
	    [
	      -4.89858741e-16,
	      0.866025388,
	      -0.866025388,
	      -0.5,
	      -0.5,
	      1
	    ],
	    [
	      0.0523359552,
	      0.848048091,
	      -0.874619722,
	      -0.484809607,
	      -0.529919267,
	      0.99862951
	    ],
	    [
	      0.104528464,
	      0.829037547,
	      -0.882947564,
	      -0.469471574,
	      -0.559192896,
	      0.994521916
	    ],
	    [
	      0.156434461,
	      0.809017,
	      -0.891006529,
	      -0.453990489,
	      -0.587785244,
	      0.987688363
	    ],
	    [
	      0.207911685,
	      0.788010776,
	      -0.898794055,
	      -0.438371152,
	      -0.615661502,
	      0.978147626
	    ],
	    [
	      0.258819044,
	      0.766044438,
	      -0.906307817,
	      -0.42261827,
	      -0.642787635,
	      0.965925813
	    ],
	    [
	      0.309017,
	      0.74314481,
	      -0.91354543,
	      -0.406736642,
	      -0.669130623,
	      0.95105654
	    ],
	    [
	      0.35836795,
	      0.719339788,
	      -0.920504868,
	      -0.390731126,
	      -0.694658399,
	      0.933580399
	    ],
	    [
	      0.406736642,
	      0.694658399,
	      -0.927183867,
	      -0.37460658,
	      -0.719339788,
	      0.91354543
	    ],
	    [
	      0.453990489,
	      0.669130623,
	      -0.933580399,
	      -0.35836795,
	      -0.74314481,
	      0.891006529
	    ],
	    [
	      0.5,
	      0.642787635,
	      -0.939692616,
	      -0.342020154,
	      -0.766044438,
	      0.866025388
	    ],
	    [
	      0.544639051,
	      0.615661502,
	      -0.945518553,
	      -0.325568169,
	      -0.788010776,
	      0.838670552
	    ],
	    [
	      0.587785244,
	      0.587785244,
	      -0.95105654,
	      -0.309017,
	      -0.809017,
	      0.809017
	    ],
	    [
	      0.629320383,
	      0.559192896,
	      -0.956304729,
	      -0.29237169,
	      -0.829037547,
	      0.777146
	    ],
	    [
	      0.669130623,
	      0.529919267,
	      -0.96126169,
	      -0.275637358,
	      -0.848048091,
	      0.74314481
	    ],
	    [
	      0.707106769,
	      0.5,
	      -0.965925813,
	      -0.258819044,
	      -0.866025388,
	      0.707106769
	    ],
	    [
	      0.74314481,
	      0.469471574,
	      -0.970295727,
	      -0.241921902,
	      -0.882947564,
	      0.669130623
	    ],
	    [
	      0.777146,
	      0.438371152,
	      -0.974370062,
	      -0.224951059,
	      -0.898794055,
	      0.629320383
	    ],
	    [
	      0.809017,
	      0.406736642,
	      -0.978147626,
	      -0.207911685,
	      -0.91354543,
	      0.587785244
	    ],
	    [
	      0.838670552,
	      0.37460658,
	      -0.981627166,
	      -0.190809,
	      -0.927183867,
	      0.544639051
	    ],
	    [
	      0.866025388,
	      0.342020154,
	      -0.98480773,
	      -0.173648179,
	      -0.939692616,
	      0.5
	    ],
	    [
	      0.891006529,
	      0.309017,
	      -0.987688363,
	      -0.156434461,
	      -0.95105654,
	      0.453990489
	    ],
	    [
	      0.91354543,
	      0.275637358,
	      -0.990268052,
	      -0.139173105,
	      -0.96126169,
	      0.406736642
	    ],
	    [
	      0.933580399,
	      0.241921902,
	      -0.992546141,
	      -0.121869341,
	      -0.970295727,
	      0.35836795
	    ],
	    [
	      0.95105654,
	      0.207911685,
	      -0.994521916,
	      -0.104528464,
	      -0.978147626,
	      0.309017
	    ],
	    [
	      0.965925813,
	      0.173648179,
	      -0.99619472,
	      -0.0871557444,
	      -0.98480773,
	      0.258819044
	    ],
	    [
	      0.978147626,
	      0.139173105,
	      -0.997564077,
	      -0.0697564706,
	      -0.990268052,
	      0.207911685
	    ],
	    [
	      0.987688363,
	      0.104528464,
	      -0.99862951,
	      -0.0523359552,
	      -0.994521916,
	      0.156434461
	    ],
	    [
	      0.994521916,
	      0.0697564706,
	      -0.999390841,
	      -0.0348994955,
	      -0.997564077,
	      0.104528464
	    ],
	    [
	      0.99862951,
	      0.0348994955,
	      -0.99984771,
	      -0.0174524058,
	      -0.999390841,
	      0.0523359552
	    ],
	    [
	      1,
	      3.67394029e-16,
	      -1,
	      -1.83697015e-16,
	      -1,
	      5.5109107e-16
	    ],
	    [
	      0.99862951,
	      -0.0348994955,
	      -0.99984771,
	      0.0174524058,
	      -0.999390841,
	      -0.0523359552
	    ],
	    [
	      0.994521916,
	      -0.0697564706,
	      -0.999390841,
	      0.0348994955,
	      -0.997564077,
	      -0.104528464
	    ],
	    [
	      0.987688363,
	      -0.104528464,
	      -0.99862951,
	      0.0523359552,
	      -0.994521916,
	      -0.156434461
	    ],
	    [
	      0.978147626,
	      -0.139173105,
	      -0.997564077,
	      0.0697564706,
	      -0.990268052,
	      -0.207911685
	    ],
	    [
	      0.965925813,
	      -0.173648179,
	      -0.99619472,
	      0.0871557444,
	      -0.98480773,
	      -0.258819044
	    ],
	    [
	      0.95105654,
	      -0.207911685,
	      -0.994521916,
	      0.104528464,
	      -0.978147626,
	      -0.309017
	    ],
	    [
	      0.933580399,
	      -0.241921902,
	      -0.992546141,
	      0.121869341,
	      -0.970295727,
	      -0.35836795
	    ],
	    [
	      0.91354543,
	      -0.275637358,
	      -0.990268052,
	      0.139173105,
	      -0.96126169,
	      -0.406736642
	    ],
	    [
	      0.891006529,
	      -0.309017,
	      -0.987688363,
	      0.156434461,
	      -0.95105654,
	      -0.453990489
	    ],
	    [
	      0.866025388,
	      -0.342020154,
	      -0.98480773,
	      0.173648179,
	      -0.939692616,
	      -0.5
	    ],
	    [
	      0.838670552,
	      -0.37460658,
	      -0.981627166,
	      0.190809,
	      -0.927183867,
	      -0.544639051
	    ],
	    [
	      0.809017,
	      -0.406736642,
	      -0.978147626,
	      0.207911685,
	      -0.91354543,
	      -0.587785244
	    ],
	    [
	      0.777146,
	      -0.438371152,
	      -0.974370062,
	      0.224951059,
	      -0.898794055,
	      -0.629320383
	    ],
	    [
	      0.74314481,
	      -0.469471574,
	      -0.970295727,
	      0.241921902,
	      -0.882947564,
	      -0.669130623
	    ],
	    [
	      0.707106769,
	      -0.5,
	      -0.965925813,
	      0.258819044,
	      -0.866025388,
	      -0.707106769
	    ],
	    [
	      0.669130623,
	      -0.529919267,
	      -0.96126169,
	      0.275637358,
	      -0.848048091,
	      -0.74314481
	    ],
	    [
	      0.629320383,
	      -0.559192896,
	      -0.956304729,
	      0.29237169,
	      -0.829037547,
	      -0.777146
	    ],
	    [
	      0.587785244,
	      -0.587785244,
	      -0.95105654,
	      0.309017,
	      -0.809017,
	      -0.809017
	    ],
	    [
	      0.544639051,
	      -0.615661502,
	      -0.945518553,
	      0.325568169,
	      -0.788010776,
	      -0.838670552
	    ],
	    [
	      0.5,
	      -0.642787635,
	      -0.939692616,
	      0.342020154,
	      -0.766044438,
	      -0.866025388
	    ],
	    [
	      0.453990489,
	      -0.669130623,
	      -0.933580399,
	      0.35836795,
	      -0.74314481,
	      -0.891006529
	    ],
	    [
	      0.406736642,
	      -0.694658399,
	      -0.927183867,
	      0.37460658,
	      -0.719339788,
	      -0.91354543
	    ],
	    [
	      0.35836795,
	      -0.719339788,
	      -0.920504868,
	      0.390731126,
	      -0.694658399,
	      -0.933580399
	    ],
	    [
	      0.309017,
	      -0.74314481,
	      -0.91354543,
	      0.406736642,
	      -0.669130623,
	      -0.95105654
	    ],
	    [
	      0.258819044,
	      -0.766044438,
	      -0.906307817,
	      0.42261827,
	      -0.642787635,
	      -0.965925813
	    ],
	    [
	      0.207911685,
	      -0.788010776,
	      -0.898794055,
	      0.438371152,
	      -0.615661502,
	      -0.978147626
	    ],
	    [
	      0.156434461,
	      -0.809017,
	      -0.891006529,
	      0.453990489,
	      -0.587785244,
	      -0.987688363
	    ],
	    [
	      0.104528464,
	      -0.829037547,
	      -0.882947564,
	      0.469471574,
	      -0.559192896,
	      -0.994521916
	    ],
	    [
	      0.0523359552,
	      -0.848048091,
	      -0.874619722,
	      0.484809607,
	      -0.529919267,
	      -0.99862951
	    ],
	    [
	      6.123234e-16,
	      -0.866025388,
	      -0.866025388,
	      0.5,
	      -0.5,
	      -1
	    ],
	    [
	      -0.0523359552,
	      -0.882947564,
	      -0.857167304,
	      0.515038073,
	      -0.469471574,
	      -0.99862951
	    ],
	    [
	      -0.104528464,
	      -0.898794055,
	      -0.848048091,
	      0.529919267,
	      -0.438371152,
	      -0.994521916
	    ],
	    [
	      -0.156434461,
	      -0.91354543,
	      -0.838670552,
	      0.544639051,
	      -0.406736642,
	      -0.987688363
	    ],
	    [
	      -0.207911685,
	      -0.927183867,
	      -0.829037547,
	      0.559192896,
	      -0.37460658,
	      -0.978147626
	    ],
	    [
	      -0.258819044,
	      -0.939692616,
	      -0.819152057,
	      0.57357645,
	      -0.342020154,
	      -0.965925813
	    ],
	    [
	      -0.309017,
	      -0.95105654,
	      -0.809017,
	      0.587785244,
	      -0.309017,
	      -0.95105654
	    ],
	    [
	      -0.35836795,
	      -0.96126169,
	      -0.798635483,
	      0.601815045,
	      -0.275637358,
	      -0.933580399
	    ],
	    [
	      -0.406736642,
	      -0.970295727,
	      -0.788010776,
	      0.615661502,
	      -0.241921902,
	      -0.91354543
	    ],
	    [
	      -0.453990489,
	      -0.978147626,
	      -0.777146,
	      0.629320383,
	      -0.207911685,
	      -0.891006529
	    ],
	    [
	      -0.5,
	      -0.98480773,
	      -0.766044438,
	      0.642787635,
	      -0.173648179,
	      -0.866025388
	    ],
	    [
	      -0.544639051,
	      -0.990268052,
	      -0.754709601,
	      0.656059,
	      -0.139173105,
	      -0.838670552
	    ],
	    [
	      -0.587785244,
	      -0.994521916,
	      -0.74314481,
	      0.669130623,
	      -0.104528464,
	      -0.809017
	    ],
	    [
	      -0.629320383,
	      -0.997564077,
	      -0.7313537,
	      0.681998372,
	      -0.0697564706,
	      -0.777146
	    ],
	    [
	      -0.669130623,
	      -0.999390841,
	      -0.719339788,
	      0.694658399,
	      -0.0348994955,
	      -0.74314481
	    ],
	    [
	      -0.707106769,
	      -1,
	      -0.707106769,
	      0.707106769,
	      -4.28626385e-16,
	      -0.707106769
	    ],
	    [
	      -0.74314481,
	      -0.999390841,
	      -0.694658399,
	      0.719339788,
	      0.0348994955,
	      -0.669130623
	    ],
	    [
	      -0.777146,
	      -0.997564077,
	      -0.681998372,
	      0.7313537,
	      0.0697564706,
	      -0.629320383
	    ],
	    [
	      -0.809017,
	      -0.994521916,
	      -0.669130623,
	      0.74314481,
	      0.104528464,
	      -0.587785244
	    ],
	    [
	      -0.838670552,
	      -0.990268052,
	      -0.656059,
	      0.754709601,
	      0.139173105,
	      -0.544639051
	    ],
	    [
	      -0.866025388,
	      -0.98480773,
	      -0.642787635,
	      0.766044438,
	      0.173648179,
	      -0.5
	    ],
	    [
	      -0.891006529,
	      -0.978147626,
	      -0.629320383,
	      0.777146,
	      0.207911685,
	      -0.453990489
	    ],
	    [
	      -0.91354543,
	      -0.970295727,
	      -0.615661502,
	      0.788010776,
	      0.241921902,
	      -0.406736642
	    ],
	    [
	      -0.933580399,
	      -0.96126169,
	      -0.601815045,
	      0.798635483,
	      0.275637358,
	      -0.35836795
	    ],
	    [
	      -0.95105654,
	      -0.95105654,
	      -0.587785244,
	      0.809017,
	      0.309017,
	      -0.309017
	    ],
	    [
	      -0.965925813,
	      -0.939692616,
	      -0.57357645,
	      0.819152057,
	      0.342020154,
	      -0.258819044
	    ],
	    [
	      -0.978147626,
	      -0.927183867,
	      -0.559192896,
	      0.829037547,
	      0.37460658,
	      -0.207911685
	    ],
	    [
	      -0.987688363,
	      -0.91354543,
	      -0.544639051,
	      0.838670552,
	      0.406736642,
	      -0.156434461
	    ],
	    [
	      -0.994521916,
	      -0.898794055,
	      -0.529919267,
	      0.848048091,
	      0.438371152,
	      -0.104528464
	    ],
	    [
	      -0.99862951,
	      -0.882947564,
	      -0.515038073,
	      0.857167304,
	      0.469471574,
	      -0.0523359552
	    ],
	    [
	      -1,
	      -0.866025388,
	      -0.5,
	      0.866025388,
	      0.5,
	      -2.44991257e-15
	    ],
	    [
	      -0.99862951,
	      -0.848048091,
	      -0.484809607,
	      0.874619722,
	      0.529919267,
	      0.0523359552
	    ],
	    [
	      -0.994521916,
	      -0.829037547,
	      -0.469471574,
	      0.882947564,
	      0.559192896,
	      0.104528464
	    ],
	    [
	      -0.987688363,
	      -0.809017,
	      -0.453990489,
	      0.891006529,
	      0.587785244,
	      0.156434461
	    ],
	    [
	      -0.978147626,
	      -0.788010776,
	      -0.438371152,
	      0.898794055,
	      0.615661502,
	      0.207911685
	    ],
	    [
	      -0.965925813,
	      -0.766044438,
	      -0.42261827,
	      0.906307817,
	      0.642787635,
	      0.258819044
	    ],
	    [
	      -0.95105654,
	      -0.74314481,
	      -0.406736642,
	      0.91354543,
	      0.669130623,
	      0.309017
	    ],
	    [
	      -0.933580399,
	      -0.719339788,
	      -0.390731126,
	      0.920504868,
	      0.694658399,
	      0.35836795
	    ],
	    [
	      -0.91354543,
	      -0.694658399,
	      -0.37460658,
	      0.927183867,
	      0.719339788,
	      0.406736642
	    ],
	    [
	      -0.891006529,
	      -0.669130623,
	      -0.35836795,
	      0.933580399,
	      0.74314481,
	      0.453990489
	    ],
	    [
	      -0.866025388,
	      -0.642787635,
	      -0.342020154,
	      0.939692616,
	      0.766044438,
	      0.5
	    ],
	    [
	      -0.838670552,
	      -0.615661502,
	      -0.325568169,
	      0.945518553,
	      0.788010776,
	      0.544639051
	    ],
	    [
	      -0.809017,
	      -0.587785244,
	      -0.309017,
	      0.95105654,
	      0.809017,
	      0.587785244
	    ],
	    [
	      -0.777146,
	      -0.559192896,
	      -0.29237169,
	      0.956304729,
	      0.829037547,
	      0.629320383
	    ],
	    [
	      -0.74314481,
	      -0.529919267,
	      -0.275637358,
	      0.96126169,
	      0.848048091,
	      0.669130623
	    ],
	    [
	      -0.707106769,
	      -0.5,
	      -0.258819044,
	      0.965925813,
	      0.866025388,
	      0.707106769
	    ],
	    [
	      -0.669130623,
	      -0.469471574,
	      -0.241921902,
	      0.970295727,
	      0.882947564,
	      0.74314481
	    ],
	    [
	      -0.629320383,
	      -0.438371152,
	      -0.224951059,
	      0.974370062,
	      0.898794055,
	      0.777146
	    ],
	    [
	      -0.587785244,
	      -0.406736642,
	      -0.207911685,
	      0.978147626,
	      0.91354543,
	      0.809017
	    ],
	    [
	      -0.544639051,
	      -0.37460658,
	      -0.190809,
	      0.981627166,
	      0.927183867,
	      0.838670552
	    ],
	    [
	      -0.5,
	      -0.342020154,
	      -0.173648179,
	      0.98480773,
	      0.939692616,
	      0.866025388
	    ],
	    [
	      -0.453990489,
	      -0.309017,
	      -0.156434461,
	      0.987688363,
	      0.95105654,
	      0.891006529
	    ],
	    [
	      -0.406736642,
	      -0.275637358,
	      -0.139173105,
	      0.990268052,
	      0.96126169,
	      0.91354543
	    ],
	    [
	      -0.35836795,
	      -0.241921902,
	      -0.121869341,
	      0.992546141,
	      0.970295727,
	      0.933580399
	    ],
	    [
	      -0.309017,
	      -0.207911685,
	      -0.104528464,
	      0.994521916,
	      0.978147626,
	      0.95105654
	    ],
	    [
	      -0.258819044,
	      -0.173648179,
	      -0.0871557444,
	      0.99619472,
	      0.98480773,
	      0.965925813
	    ],
	    [
	      -0.207911685,
	      -0.139173105,
	      -0.0697564706,
	      0.997564077,
	      0.990268052,
	      0.978147626
	    ],
	    [
	      -0.156434461,
	      -0.104528464,
	      -0.0523359552,
	      0.99862951,
	      0.994521916,
	      0.987688363
	    ],
	    [
	      -0.104528464,
	      -0.0697564706,
	      -0.0348994955,
	      0.999390841,
	      0.997564077,
	      0.994521916
	    ],
	    [
	      -0.0523359552,
	      -0.0348994955,
	      -0.0174524058,
	      0.99984771,
	      0.999390841,
	      0.99862951
	    ]
	  ],
	  [
	    [
	      -1,
	      0,
	      1,
	      0,
	      0,
	      -1,
	      0,
	      0,
	      0
	    ],
	    [
	      -0.99984771,
	      0.0174524058,
	      0.99954313,
	      0.0302238502,
	      0.000263779628,
	      -0.99908632,
	      0.0427332148,
	      0.000589739357,
	      0.00000420248307
	    ],
	    [
	      -0.999390841,
	      0.0348994955,
	      0.998173058,
	      0.0604108796,
	      0.00105479721,
	      -0.996347725,
	      0.0853558108,
	      0.00235716137,
	      0.000033604505
	    ],
	    [
	      -0.99862951,
	      0.0523359552,
	      0.995891392,
	      0.0905243,
	      0.00237208884,
	      -0.991791308,
	      0.12775746,
	      0.00529688271,
	      0.000113328853
	    ],
	    [
	      -0.997564077,
	      0.0697564706,
	      0.992701054,
	      0.120527439,
	      0.00421405,
	      -0.985428751,
	      0.169828475,
	      0.00939994864,
	      0.000268345029
	    ],
	    [
	      -0.99619472,
	      0.0871557444,
	      0.988605797,
	      0.150383726,
	      0.00657843612,
	      -0.977276683,
	      0.211460009,
	      0.014653855,
	      0.000523393159
	    ],
	    [
	      -0.994521916,
	      0.104528464,
	      0.98361069,
	      0.18005681,
	      0.00946236681,
	      -0.967356,
	      0.252544463,
	      0.0210425854,
	      0.000902908447
	    ],
	    [
	      -0.992546141,
	      0.121869341,
	      0.97772181,
	      0.209510505,
	      0.0128623275,
	      -0.955692589,
	      0.292975664,
	      0.0285466593,
	      0.00143094664
	    ],
	    [
	      -0.990268052,
	      0.139173105,
	      0.970946252,
	      0.238708958,
	      0.0167741776,
	      -0.942316413,
	      0.33264932,
	      0.0371431746,
	      0.00213111029
	    ],
	    [
	      -0.987688363,
	      0.156434461,
	      0.96329236,
	      0.26761657,
	      0.0211931504,
	      -0.927262187,
	      0.37146312,
	      0.0468058847,
	      0.0030264766
	    ],
	    [
	      -0.98480773,
	      0.173648179,
	      0.954769492,
	      0.29619813,
	      0.0261138603,
	      -0.910568774,
	      0.409317106,
	      0.0575052574,
	      0.00413952675
	    ],
	    [
	      -0.981627166,
	      0.190809,
	      0.9453879,
	      0.324418813,
	      0.0315303169,
	      -0.892279327,
	      0.446113944,
	      0.0692085773,
	      0.00549207628
	    ],
	    [
	      -0.978147626,
	      0.207911685,
	      0.935159087,
	      0.352244258,
	      0.0374359153,
	      -0.872441,
	      0.481759191,
	      0.08188,
	      0.00710520707
	    ],
	    [
	      -0.974370062,
	      0.224951059,
	      0.924095511,
	      0.379640549,
	      0.043823462,
	      -0.851105,
	      0.516161561,
	      0.0954807103,
	      0.00899920426
	    ],
	    [
	      -0.970295727,
	      0.241921902,
	      0.912210703,
	      0.406574309,
	      0.0506851785,
	      -0.828326404,
	      0.549233,
	      0.10996896,
	      0.0111934906
	    ],
	    [
	      -0.965925813,
	      0.258819044,
	      0.899519,
	      0.433012694,
	      0.0580127,
	      -0.804163933,
	      0.580889285,
	      0.125300229,
	      0.0137065668
	    ],
	    [
	      -0.96126169,
	      0.275637358,
	      0.886036098,
	      0.458923548,
	      0.0657971054,
	      -0.778679788,
	      0.61104995,
	      0.141427353,
	      0.0165559556
	    ],
	    [
	      -0.956304729,
	      0.29237169,
	      0.87177819,
	      0.484275252,
	      0.0740289,
	      -0.751939535,
	      0.639638543,
	      0.158300623,
	      0.0197581388
	    ],
	    [
	      -0.95105654,
	      0.309017,
	      0.856762767,
	      0.509036958,
	      0.0826980695,
	      -0.724011958,
	      0.666583,
	      0.175867945,
	      0.0233285148
	    ],
	    [
	      -0.945518553,
	      0.325568169,
	      0.841008067,
	      0.533178449,
	      0.0917940363,
	      -0.694968879,
	      0.691815674,
	      0.194074973,
	      0.0272813439
	    ],
	    [
	      -0.939692616,
	      0.342020154,
	      0.824533343,
	      0.556670427,
	      0.101305731,
	      -0.664884746,
	      0.715273559,
	      0.212865278,
	      0.0316297
	    ],
	    [
	      -0.933580399,
	      0.35836795,
	      0.807358623,
	      0.579484105,
	      0.111221552,
	      -0.633836746,
	      0.736898482,
	      0.232180476,
	      0.0363854282
	    ],
	    [
	      -0.927183867,
	      0.37460658,
	      0.789504826,
	      0.601591825,
	      0.12152943,
	      -0.601904333,
	      0.756637275,
	      0.251960427,
	      0.0415591113
	    ],
	    [
	      -0.920504868,
	      0.390731126,
	      0.770993769,
	      0.622966528,
	      0.132216811,
	      -0.569169283,
	      0.774441898,
	      0.272143364,
	      0.0471600257
	    ],
	    [
	      -0.91354543,
	      0.406736642,
	      0.751848,
	      0.643582284,
	      0.143270656,
	      -0.535715163,
	      0.790269554,
	      0.292666078,
	      0.0531961136
	    ],
	    [
	      -0.906307817,
	      0.42261827,
	      0.732090712,
	      0.663413942,
	      0.154677495,
	      -0.501627326,
	      0.80408287,
	      0.313464135,
	      0.0596739501
	    ],
	    [
	      -0.898794055,
	      0.438371152,
	      0.711746097,
	      0.68243736,
	      0.16642347,
	      -0.466992587,
	      0.8158499,
	      0.334471971,
	      0.0665987208
	    ],
	    [
	      -0.891006529,
	      0.453990489,
	      0.690838933,
	      0.700629294,
	      0.178494215,
	      -0.431898981,
	      0.825544238,
	      0.355623156,
	      0.073974207
	    ],
	    [
	      -0.882947564,
	      0.469471574,
	      0.669394672,
	      0.71796757,
	      0.190875068,
	      -0.396435648,
	      0.833145082,
	      0.376850545,
	      0.0818027481
	    ],
	    [
	      -0.874619722,
	      0.484809607,
	      0.64743942,
	      0.734431207,
	      0.203550935,
	      -0.360692352,
	      0.838637531,
	      0.398086399,
	      0.0900852531
	    ],
	    [
	      -0.866025388,
	      0.5,
	      0.625,
	      0.75,
	      0.216506347,
	      -0.324759513,
	      0.842012107,
	      0.419262737,
	      0.0988211781
	    ],
	    [
	      -0.857167304,
	      0.515038073,
	      0.602103651,
	      0.764655054,
	      0.229725555,
	      -0.28872776,
	      0.843265295,
	      0.440311372,
	      0.108008519
	    ],
	    [
	      -0.848048091,
	      0.529919267,
	      0.578778386,
	      0.778378487,
	      0.243192434,
	      -0.252687752,
	      0.84239924,
	      0.461164147,
	      0.117643826
	    ],
	    [
	      -0.838670552,
	      0.544639051,
	      0.555052459,
	      0.79115355,
	      0.256890565,
	      -0.216729924,
	      0.839421868,
	      0.481753141,
	      0.127722174
	    ],
	    [
	      -0.829037547,
	      0.559192896,
	      0.530954957,
	      0.802964747,
	      0.270803303,
	      -0.180944279,
	      0.83434689,
	      0.502010882,
	      0.138237208
	    ],
	    [
	      -0.819152057,
	      0.57357645,
	      0.506515086,
	      0.813797653,
	      0.284913629,
	      -0.145420119,
	      0.827193558,
	      0.521870494,
	      0.149181142
	    ],
	    [
	      -0.809017,
	      0.587785244,
	      0.481762737,
	      0.823639095,
	      0.299204409,
	      -0.110245749,
	      0.817986846,
	      0.541265905,
	      0.160544738
	    ],
	    [
	      -0.798635483,
	      0.601815045,
	      0.456728,
	      0.832477033,
	      0.313658237,
	      -0.0755083486,
	      0.80675739,
	      0.560131907,
	      0.172317386
	    ],
	    [
	      -0.788010776,
	      0.615661502,
	      0.431441426,
	      0.840300739,
	      0.328257442,
	      -0.0412936322,
	      0.793541074,
	      0.578404605,
	      0.184487075
	    ],
	    [
	      -0.777146,
	      0.629320383,
	      0.405933768,
	      0.847100675,
	      0.342984289,
	      -0.00768567342,
	      0.778379381,
	      0.596021354,
	      0.197040468
	    ],
	    [
	      -0.766044438,
	      0.642787635,
	      0.380236119,
	      0.852868557,
	      0.357820839,
	      0.0252333339,
	      0.761319,
	      0.612921119,
	      0.209962875
	    ],
	    [
	      -0.754709601,
	      0.656059,
	      0.354379833,
	      0.857597291,
	      0.372748971,
	      0.0573833026,
	      0.742411554,
	      0.629044473,
	      0.223238334
	    ],
	    [
	      -0.74314481,
	      0.669130623,
	      0.32839635,
	      0.861281216,
	      0.387750536,
	      0.0886864737,
	      0.721713901,
	      0.64433378,
	      0.236849621
	    ],
	    [
	      -0.7313537,
	      0.681998372,
	      0.302317351,
	      0.863915801,
	      0.402807266,
	      0.119067609,
	      0.699287713,
	      0.658733487,
	      0.250778317
	    ],
	    [
	      -0.719339788,
	      0.694658399,
	      0.276174635,
	      0.865497828,
	      0.417900771,
	      0.148454204,
	      0.675199151,
	      0.672190368,
	      0.265004843
	    ],
	    [
	      -0.707106769,
	      0.707106769,
	      0.25,
	      0.866025388,
	      0.433012694,
	      0.176776692,
	      0.649519,
	      0.684653223,
	      0.279508501
	    ],
	    [
	      -0.694658399,
	      0.719339788,
	      0.22382538,
	      0.865497828,
	      0.448124617,
	      0.203968629,
	      0.622322381,
	      0.696073472,
	      0.294267476
	    ],
	    [
	      -0.681998372,
	      0.7313537,
	      0.197682649,
	      0.863915801,
	      0.463218153,
	      0.229966834,
	      0.593688309,
	      0.706405222,
	      0.309259027
	    ],
	    [
	      -0.669130623,
	      0.74314481,
	      0.17160365,
	      0.861281216,
	      0.478274852,
	      0.254711658,
	      0.563699722,
	      0.71560514,
	      0.324459404
	    ],
	    [
	      -0.656059,
	      0.754709601,
	      0.145620167,
	      0.857597291,
	      0.493276417,
	      0.278146982,
	      0.532443225,
	      0.723632872,
	      0.339844
	    ],
	    [
	      -0.642787635,
	      0.766044438,
	      0.119763866,
	      0.852868557,
	      0.508204579,
	      0.300220519,
	      0.500008881,
	      0.730451,
	      0.3553873
	    ],
	    [
	      -0.629320383,
	      0.777146,
	      0.0940662324,
	      0.847100675,
	      0.523041129,
	      0.32088393,
	      0.466489762,
	      0.736025095,
	      0.371063113
	    ],
	    [
	      -0.615661502,
	      0.788010776,
	      0.0685585812,
	      0.840300739,
	      0.537767947,
	      0.340092868,
	      0.431981891,
	      0.74032414,
	      0.386844516
	    ],
	    [
	      -0.601815045,
	      0.798635483,
	      0.0432719849,
	      0.832477033,
	      0.552367151,
	      0.35780713,
	      0.396583915,
	      0.743320107,
	      0.402703911
	    ],
	    [
	      -0.587785244,
	      0.809017,
	      0.0182372537,
	      0.823639095,
	      0.566821,
	      0.373990864,
	      0.360396802,
	      0.744988561,
	      0.418613225
	    ],
	    [
	      -0.57357645,
	      0.819152057,
	      -0.00651510758,
	      0.813797653,
	      0.581111789,
	      0.388612479,
	      0.323523581,
	      0.74530834,
	      0.434543818
	    ],
	    [
	      -0.559192896,
	      0.829037547,
	      -0.0309549458,
	      0.802964747,
	      0.595222116,
	      0.401644915,
	      0.286069185,
	      0.744261742,
	      0.450466663
	    ],
	    [
	      -0.544639051,
	      0.838670552,
	      -0.0550524816,
	      0.79115355,
	      0.609134853,
	      0.413065583,
	      0.248139873,
	      0.741834819,
	      0.466352403
	    ],
	    [
	      -0.529919267,
	      0.848048091,
	      -0.0787783638,
	      0.778378487,
	      0.622832954,
	      0.42285645,
	      0.209843263,
	      0.738016903,
	      0.482171416
	    ],
	    [
	      -0.515038073,
	      0.857167304,
	      -0.102103673,
	      0.764655054,
	      0.636299849,
	      0.431004167,
	      0.171287775,
	      0.732801199,
	      0.4978939
	    ],
	    [
	      -0.5,
	      0.866025388,
	      -0.125,
	      0.75,
	      0.649519,
	      0.4375,
	      0.132582515,
	      0.726184368,
	      0.513489902
	    ],
	    [
	      -0.484809607,
	      0.874619722,
	      -0.14743945,
	      0.734431207,
	      0.662474453,
	      0.442339838,
	      0.0938368812,
	      0.718166888,
	      0.528929472
	    ],
	    [
	      -0.469471574,
	      0.882947564,
	      -0.169394672,
	      0.71796757,
	      0.675150335,
	      0.445524335,
	      0.0551602542,
	      0.708752811,
	      0.544182777
	    ],
	    [
	      -0.453990489,
	      0.891006529,
	      -0.190838933,
	      0.700629294,
	      0.687531173,
	      0.447058767,
	      0.0166617651,
	      0.697949767,
	      0.559219956
	    ],
	    [
	      -0.438371152,
	      0.898794055,
	      -0.211746112,
	      0.68243736,
	      0.699601948,
	      0.446953058,
	      -0.0215500612,
	      0.6857692,
	      0.574011445
	    ],
	    [
	      -0.42261827,
	      0.906307817,
	      -0.232090712,
	      0.663413942,
	      0.711347878,
	      0.445221782,
	      -0.0593675859,
	      0.672226,
	      0.588528037
	    ],
	    [
	      -0.406736642,
	      0.91354543,
	      -0.251847953,
	      0.643582284,
	      0.722754776,
	      0.441884071,
	      -0.0966843441,
	      0.657338798,
	      0.602740645
	    ],
	    [
	      -0.390731126,
	      0.920504868,
	      -0.270993769,
	      0.622966528,
	      0.733808577,
	      0.436963588,
	      -0.133395374,
	      0.641129553,
	      0.616620898
	    ],
	    [
	      -0.37460658,
	      0.927183867,
	      -0.289504856,
	      0.601591825,
	      0.744496,
	      0.430488437,
	      -0.169397429,
	      0.623623908,
	      0.630140781
	    ],
	    [
	      -0.35836795,
	      0.933580399,
	      -0.307358623,
	      0.579484105,
	      0.754803836,
	      0.422491103,
	      -0.204589352,
	      0.604850829,
	      0.643272877
	    ],
	    [
	      -0.342020154,
	      0.939692616,
	      -0.324533343,
	      0.556670427,
	      0.764719665,
	      0.413008332,
	      -0.238872305,
	      0.584842563,
	      0.655990362
	    ],
	    [
	      -0.325568169,
	      0.945518553,
	      -0.341008067,
	      0.533178449,
	      0.774231374,
	      0.402081043,
	      -0.27215004,
	      0.563634634,
	      0.66826731
	    ],
	    [
	      -0.309017,
	      0.95105654,
	      -0.356762737,
	      0.509036958,
	      0.783327341,
	      0.389754236,
	      -0.304329157,
	      0.541265905,
	      0.680078387
	    ],
	    [
	      -0.29237169,
	      0.956304729,
	      -0.37177819,
	      0.484275252,
	      0.791996479,
	      0.376076847,
	      -0.3353194,
	      0.517778039,
	      0.691399336
	    ],
	    [
	      -0.275637358,
	      0.96126169,
	      -0.386036068,
	      0.458923548,
	      0.800228298,
	      0.361101508,
	      -0.365033895,
	      0.493215799,
	      0.702206612
	    ],
	    [
	      -0.258819044,
	      0.965925813,
	      -0.399519056,
	      0.433012694,
	      0.808012724,
	      0.344884604,
	      -0.393389285,
	      0.46762684,
	      0.712477803
	    ],
	    [
	      -0.241921902,
	      0.970295727,
	      -0.412210703,
	      0.406574309,
	      0.815340221,
	      0.327485919,
	      -0.420306176,
	      0.441061407,
	      0.722191513
	    ],
	    [
	      -0.224951059,
	      0.974370062,
	      -0.424095541,
	      0.379640549,
	      0.822201967,
	      0.308968604,
	      -0.445709109,
	      0.413572371,
	      0.731327355
	    ],
	    [
	      -0.207911685,
	      0.978147626,
	      -0.435159087,
	      0.352244258,
	      0.828589499,
	      0.289398909,
	      -0.469526976,
	      0.385215133,
	      0.739866197
	    ],
	    [
	      -0.190809,
	      0.981627166,
	      -0.4453879,
	      0.324418813,
	      0.834495068,
	      0.268846035,
	      -0.491693079,
	      0.356047243,
	      0.747790158
	    ],
	    [
	      -0.173648179,
	      0.98480773,
	      -0.454769462,
	      0.29619813,
	      0.83991152,
	      0.24738194,
	      -0.51214534,
	      0.326128513,
	      0.755082488
	    ],
	    [
	      -0.156434461,
	      0.987688363,
	      -0.46329239,
	      0.26761657,
	      0.844832242,
	      0.225081131,
	      -0.530826509,
	      0.295520723,
	      0.76172775
	    ],
	    [
	      -0.139173105,
	      0.990268052,
	      -0.470946282,
	      0.238708958,
	      0.849251211,
	      0.202020496,
	      -0.547684371,
	      0.264287412,
	      0.767712
	    ],
	    [
	      -0.121869341,
	      0.992546141,
	      -0.477721781,
	      0.209510505,
	      0.853163064,
	      0.178278968,
	      -0.562671661,
	      0.232493877,
	      0.773022532
	    ],
	    [
	      -0.104528464,
	      0.994521916,
	      -0.48361069,
	      0.18005681,
	      0.856563032,
	      0.153937444,
	      -0.575746536,
	      0.200206831,
	      0.777648
	    ],
	    [
	      -0.0871557444,
	      0.99619472,
	      -0.488605827,
	      0.150383726,
	      0.859446943,
	      0.129078493,
	      -0.586872399,
	      0.167494327,
	      0.78157866
	    ],
	    [
	      -0.0697564706,
	      0.997564077,
	      -0.492701054,
	      0.120527439,
	      0.86181134,
	      0.103786126,
	      -0.596018076,
	      0.134425521,
	      0.784806132
	    ],
	    [
	      -0.0523359552,
	      0.99862951,
	      -0.495891422,
	      0.0905243,
	      0.863653302,
	      0.0781455562,
	      -0.603158116,
	      0.101070546,
	      0.787323534
	    ],
	    [
	      -0.0348994955,
	      0.999390841,
	      -0.498173028,
	      0.0604108796,
	      0.864970624,
	      0.0522429794,
	      -0.608272374,
	      0.0675002709,
	      0.789125502
	    ],
	    [
	      -0.0174524058,
	      0.99984771,
	      -0.49954313,
	      0.0302238502,
	      0.865761638,
	      0.0261653196,
	      -0.611346722,
	      0.0337861441,
	      0.79020822
	    ],
	    [
	      0,
	      1,
	      -0.5,
	      0,
	      0.866025388,
	      0,
	      -0.612372458,
	      0,
	      0.790569425
	    ],
	    [
	      0.0174524058,
	      0.99984771,
	      -0.49954313,
	      -0.0302238502,
	      0.865761638,
	      -0.0261653196,
	      -0.611346722,
	      -0.0337861441,
	      0.79020822
	    ],
	    [
	      0.0348994955,
	      0.999390841,
	      -0.498173028,
	      -0.0604108796,
	      0.864970624,
	      -0.0522429794,
	      -0.608272374,
	      -0.0675002709,
	      0.789125502
	    ],
	    [
	      0.0523359552,
	      0.99862951,
	      -0.495891422,
	      -0.0905243,
	      0.863653302,
	      -0.0781455562,
	      -0.603158116,
	      -0.101070546,
	      0.787323534
	    ],
	    [
	      0.0697564706,
	      0.997564077,
	      -0.492701054,
	      -0.120527439,
	      0.86181134,
	      -0.103786126,
	      -0.596018076,
	      -0.134425521,
	      0.784806132
	    ],
	    [
	      0.0871557444,
	      0.99619472,
	      -0.488605827,
	      -0.150383726,
	      0.859446943,
	      -0.129078493,
	      -0.586872399,
	      -0.167494327,
	      0.78157866
	    ],
	    [
	      0.104528464,
	      0.994521916,
	      -0.48361069,
	      -0.18005681,
	      0.856563032,
	      -0.153937444,
	      -0.575746536,
	      -0.200206831,
	      0.777648
	    ],
	    [
	      0.121869341,
	      0.992546141,
	      -0.477721781,
	      -0.209510505,
	      0.853163064,
	      -0.178278968,
	      -0.562671661,
	      -0.232493877,
	      0.773022532
	    ],
	    [
	      0.139173105,
	      0.990268052,
	      -0.470946282,
	      -0.238708958,
	      0.849251211,
	      -0.202020496,
	      -0.547684371,
	      -0.264287412,
	      0.767712
	    ],
	    [
	      0.156434461,
	      0.987688363,
	      -0.46329239,
	      -0.26761657,
	      0.844832242,
	      -0.225081131,
	      -0.530826509,
	      -0.295520723,
	      0.76172775
	    ],
	    [
	      0.173648179,
	      0.98480773,
	      -0.454769462,
	      -0.29619813,
	      0.83991152,
	      -0.24738194,
	      -0.51214534,
	      -0.326128513,
	      0.755082488
	    ],
	    [
	      0.190809,
	      0.981627166,
	      -0.4453879,
	      -0.324418813,
	      0.834495068,
	      -0.268846035,
	      -0.491693079,
	      -0.356047243,
	      0.747790158
	    ],
	    [
	      0.207911685,
	      0.978147626,
	      -0.435159087,
	      -0.352244258,
	      0.828589499,
	      -0.289398909,
	      -0.469526976,
	      -0.385215133,
	      0.739866197
	    ],
	    [
	      0.224951059,
	      0.974370062,
	      -0.424095541,
	      -0.379640549,
	      0.822201967,
	      -0.308968604,
	      -0.445709109,
	      -0.413572371,
	      0.731327355
	    ],
	    [
	      0.241921902,
	      0.970295727,
	      -0.412210703,
	      -0.406574309,
	      0.815340221,
	      -0.327485919,
	      -0.420306176,
	      -0.441061407,
	      0.722191513
	    ],
	    [
	      0.258819044,
	      0.965925813,
	      -0.399519056,
	      -0.433012694,
	      0.808012724,
	      -0.344884604,
	      -0.393389285,
	      -0.46762684,
	      0.712477803
	    ],
	    [
	      0.275637358,
	      0.96126169,
	      -0.386036068,
	      -0.458923548,
	      0.800228298,
	      -0.361101508,
	      -0.365033895,
	      -0.493215799,
	      0.702206612
	    ],
	    [
	      0.29237169,
	      0.956304729,
	      -0.37177819,
	      -0.484275252,
	      0.791996479,
	      -0.376076847,
	      -0.3353194,
	      -0.517778039,
	      0.691399336
	    ],
	    [
	      0.309017,
	      0.95105654,
	      -0.356762737,
	      -0.509036958,
	      0.783327341,
	      -0.389754236,
	      -0.304329157,
	      -0.541265905,
	      0.680078387
	    ],
	    [
	      0.325568169,
	      0.945518553,
	      -0.341008067,
	      -0.533178449,
	      0.774231374,
	      -0.402081043,
	      -0.27215004,
	      -0.563634634,
	      0.66826731
	    ],
	    [
	      0.342020154,
	      0.939692616,
	      -0.324533343,
	      -0.556670427,
	      0.764719665,
	      -0.413008332,
	      -0.238872305,
	      -0.584842563,
	      0.655990362
	    ],
	    [
	      0.35836795,
	      0.933580399,
	      -0.307358623,
	      -0.579484105,
	      0.754803836,
	      -0.422491103,
	      -0.204589352,
	      -0.604850829,
	      0.643272877
	    ],
	    [
	      0.37460658,
	      0.927183867,
	      -0.289504856,
	      -0.601591825,
	      0.744496,
	      -0.430488437,
	      -0.169397429,
	      -0.623623908,
	      0.630140781
	    ],
	    [
	      0.390731126,
	      0.920504868,
	      -0.270993769,
	      -0.622966528,
	      0.733808577,
	      -0.436963588,
	      -0.133395374,
	      -0.641129553,
	      0.616620898
	    ],
	    [
	      0.406736642,
	      0.91354543,
	      -0.251847953,
	      -0.643582284,
	      0.722754776,
	      -0.441884071,
	      -0.0966843441,
	      -0.657338798,
	      0.602740645
	    ],
	    [
	      0.42261827,
	      0.906307817,
	      -0.232090712,
	      -0.663413942,
	      0.711347878,
	      -0.445221782,
	      -0.0593675859,
	      -0.672226,
	      0.588528037
	    ],
	    [
	      0.438371152,
	      0.898794055,
	      -0.211746112,
	      -0.68243736,
	      0.699601948,
	      -0.446953058,
	      -0.0215500612,
	      -0.6857692,
	      0.574011445
	    ],
	    [
	      0.453990489,
	      0.891006529,
	      -0.190838933,
	      -0.700629294,
	      0.687531173,
	      -0.447058767,
	      0.0166617651,
	      -0.697949767,
	      0.559219956
	    ],
	    [
	      0.469471574,
	      0.882947564,
	      -0.169394672,
	      -0.71796757,
	      0.675150335,
	      -0.445524335,
	      0.0551602542,
	      -0.708752811,
	      0.544182777
	    ],
	    [
	      0.484809607,
	      0.874619722,
	      -0.14743945,
	      -0.734431207,
	      0.662474453,
	      -0.442339838,
	      0.0938368812,
	      -0.718166888,
	      0.528929472
	    ],
	    [
	      0.5,
	      0.866025388,
	      -0.125,
	      -0.75,
	      0.649519,
	      -0.4375,
	      0.132582515,
	      -0.726184368,
	      0.513489902
	    ],
	    [
	      0.515038073,
	      0.857167304,
	      -0.102103673,
	      -0.764655054,
	      0.636299849,
	      -0.431004167,
	      0.171287775,
	      -0.732801199,
	      0.4978939
	    ],
	    [
	      0.529919267,
	      0.848048091,
	      -0.0787783638,
	      -0.778378487,
	      0.622832954,
	      -0.42285645,
	      0.209843263,
	      -0.738016903,
	      0.482171416
	    ],
	    [
	      0.544639051,
	      0.838670552,
	      -0.0550524816,
	      -0.79115355,
	      0.609134853,
	      -0.413065583,
	      0.248139873,
	      -0.741834819,
	      0.466352403
	    ],
	    [
	      0.559192896,
	      0.829037547,
	      -0.0309549458,
	      -0.802964747,
	      0.595222116,
	      -0.401644915,
	      0.286069185,
	      -0.744261742,
	      0.450466663
	    ],
	    [
	      0.57357645,
	      0.819152057,
	      -0.00651510758,
	      -0.813797653,
	      0.581111789,
	      -0.388612479,
	      0.323523581,
	      -0.74530834,
	      0.434543818
	    ],
	    [
	      0.587785244,
	      0.809017,
	      0.0182372537,
	      -0.823639095,
	      0.566821,
	      -0.373990864,
	      0.360396802,
	      -0.744988561,
	      0.418613225
	    ],
	    [
	      0.601815045,
	      0.798635483,
	      0.0432719849,
	      -0.832477033,
	      0.552367151,
	      -0.35780713,
	      0.396583915,
	      -0.743320107,
	      0.402703911
	    ],
	    [
	      0.615661502,
	      0.788010776,
	      0.0685585812,
	      -0.840300739,
	      0.537767947,
	      -0.340092868,
	      0.431981891,
	      -0.74032414,
	      0.386844516
	    ],
	    [
	      0.629320383,
	      0.777146,
	      0.0940662324,
	      -0.847100675,
	      0.523041129,
	      -0.32088393,
	      0.466489762,
	      -0.736025095,
	      0.371063113
	    ],
	    [
	      0.642787635,
	      0.766044438,
	      0.119763866,
	      -0.852868557,
	      0.508204579,
	      -0.300220519,
	      0.500008881,
	      -0.730451,
	      0.3553873
	    ],
	    [
	      0.656059,
	      0.754709601,
	      0.145620167,
	      -0.857597291,
	      0.493276417,
	      -0.278146982,
	      0.532443225,
	      -0.723632872,
	      0.339844
	    ],
	    [
	      0.669130623,
	      0.74314481,
	      0.17160365,
	      -0.861281216,
	      0.478274852,
	      -0.254711658,
	      0.563699722,
	      -0.71560514,
	      0.324459404
	    ],
	    [
	      0.681998372,
	      0.7313537,
	      0.197682649,
	      -0.863915801,
	      0.463218153,
	      -0.229966834,
	      0.593688309,
	      -0.706405222,
	      0.309259027
	    ],
	    [
	      0.694658399,
	      0.719339788,
	      0.22382538,
	      -0.865497828,
	      0.448124617,
	      -0.203968629,
	      0.622322381,
	      -0.696073472,
	      0.294267476
	    ],
	    [
	      0.707106769,
	      0.707106769,
	      0.25,
	      -0.866025388,
	      0.433012694,
	      -0.176776692,
	      0.649519,
	      -0.684653223,
	      0.279508501
	    ],
	    [
	      0.719339788,
	      0.694658399,
	      0.276174635,
	      -0.865497828,
	      0.417900771,
	      -0.148454204,
	      0.675199151,
	      -0.672190368,
	      0.265004843
	    ],
	    [
	      0.7313537,
	      0.681998372,
	      0.302317351,
	      -0.863915801,
	      0.402807266,
	      -0.119067609,
	      0.699287713,
	      -0.658733487,
	      0.250778317
	    ],
	    [
	      0.74314481,
	      0.669130623,
	      0.32839635,
	      -0.861281216,
	      0.387750536,
	      -0.0886864737,
	      0.721713901,
	      -0.64433378,
	      0.236849621
	    ],
	    [
	      0.754709601,
	      0.656059,
	      0.354379833,
	      -0.857597291,
	      0.372748971,
	      -0.0573833026,
	      0.742411554,
	      -0.629044473,
	      0.223238334
	    ],
	    [
	      0.766044438,
	      0.642787635,
	      0.380236119,
	      -0.852868557,
	      0.357820839,
	      -0.0252333339,
	      0.761319,
	      -0.612921119,
	      0.209962875
	    ],
	    [
	      0.777146,
	      0.629320383,
	      0.405933768,
	      -0.847100675,
	      0.342984289,
	      0.00768567342,
	      0.778379381,
	      -0.596021354,
	      0.197040468
	    ],
	    [
	      0.788010776,
	      0.615661502,
	      0.431441426,
	      -0.840300739,
	      0.328257442,
	      0.0412936322,
	      0.793541074,
	      -0.578404605,
	      0.184487075
	    ],
	    [
	      0.798635483,
	      0.601815045,
	      0.456728,
	      -0.832477033,
	      0.313658237,
	      0.0755083486,
	      0.80675739,
	      -0.560131907,
	      0.172317386
	    ],
	    [
	      0.809017,
	      0.587785244,
	      0.481762737,
	      -0.823639095,
	      0.299204409,
	      0.110245749,
	      0.817986846,
	      -0.541265905,
	      0.160544738
	    ],
	    [
	      0.819152057,
	      0.57357645,
	      0.506515086,
	      -0.813797653,
	      0.284913629,
	      0.145420119,
	      0.827193558,
	      -0.521870494,
	      0.149181142
	    ],
	    [
	      0.829037547,
	      0.559192896,
	      0.530954957,
	      -0.802964747,
	      0.270803303,
	      0.180944279,
	      0.83434689,
	      -0.502010882,
	      0.138237208
	    ],
	    [
	      0.838670552,
	      0.544639051,
	      0.555052459,
	      -0.79115355,
	      0.256890565,
	      0.216729924,
	      0.839421868,
	      -0.481753141,
	      0.127722174
	    ],
	    [
	      0.848048091,
	      0.529919267,
	      0.578778386,
	      -0.778378487,
	      0.243192434,
	      0.252687752,
	      0.84239924,
	      -0.461164147,
	      0.117643826
	    ],
	    [
	      0.857167304,
	      0.515038073,
	      0.602103651,
	      -0.764655054,
	      0.229725555,
	      0.28872776,
	      0.843265295,
	      -0.440311372,
	      0.108008519
	    ],
	    [
	      0.866025388,
	      0.5,
	      0.625,
	      -0.75,
	      0.216506347,
	      0.324759513,
	      0.842012107,
	      -0.419262737,
	      0.0988211781
	    ],
	    [
	      0.874619722,
	      0.484809607,
	      0.64743942,
	      -0.734431207,
	      0.203550935,
	      0.360692352,
	      0.838637531,
	      -0.398086399,
	      0.0900852531
	    ],
	    [
	      0.882947564,
	      0.469471574,
	      0.669394672,
	      -0.71796757,
	      0.190875068,
	      0.396435648,
	      0.833145082,
	      -0.376850545,
	      0.0818027481
	    ],
	    [
	      0.891006529,
	      0.453990489,
	      0.690838933,
	      -0.700629294,
	      0.178494215,
	      0.431898981,
	      0.825544238,
	      -0.355623156,
	      0.073974207
	    ],
	    [
	      0.898794055,
	      0.438371152,
	      0.711746097,
	      -0.68243736,
	      0.16642347,
	      0.466992587,
	      0.8158499,
	      -0.334471971,
	      0.0665987208
	    ],
	    [
	      0.906307817,
	      0.42261827,
	      0.732090712,
	      -0.663413942,
	      0.154677495,
	      0.501627326,
	      0.80408287,
	      -0.313464135,
	      0.0596739501
	    ],
	    [
	      0.91354543,
	      0.406736642,
	      0.751848,
	      -0.643582284,
	      0.143270656,
	      0.535715163,
	      0.790269554,
	      -0.292666078,
	      0.0531961136
	    ],
	    [
	      0.920504868,
	      0.390731126,
	      0.770993769,
	      -0.622966528,
	      0.132216811,
	      0.569169283,
	      0.774441898,
	      -0.272143364,
	      0.0471600257
	    ],
	    [
	      0.927183867,
	      0.37460658,
	      0.789504826,
	      -0.601591825,
	      0.12152943,
	      0.601904333,
	      0.756637275,
	      -0.251960427,
	      0.0415591113
	    ],
	    [
	      0.933580399,
	      0.35836795,
	      0.807358623,
	      -0.579484105,
	      0.111221552,
	      0.633836746,
	      0.736898482,
	      -0.232180476,
	      0.0363854282
	    ],
	    [
	      0.939692616,
	      0.342020154,
	      0.824533343,
	      -0.556670427,
	      0.101305731,
	      0.664884746,
	      0.715273559,
	      -0.212865278,
	      0.0316297
	    ],
	    [
	      0.945518553,
	      0.325568169,
	      0.841008067,
	      -0.533178449,
	      0.0917940363,
	      0.694968879,
	      0.691815674,
	      -0.194074973,
	      0.0272813439
	    ],
	    [
	      0.95105654,
	      0.309017,
	      0.856762767,
	      -0.509036958,
	      0.0826980695,
	      0.724011958,
	      0.666583,
	      -0.175867945,
	      0.0233285148
	    ],
	    [
	      0.956304729,
	      0.29237169,
	      0.87177819,
	      -0.484275252,
	      0.0740289,
	      0.751939535,
	      0.639638543,
	      -0.158300623,
	      0.0197581388
	    ],
	    [
	      0.96126169,
	      0.275637358,
	      0.886036098,
	      -0.458923548,
	      0.0657971054,
	      0.778679788,
	      0.61104995,
	      -0.141427353,
	      0.0165559556
	    ],
	    [
	      0.965925813,
	      0.258819044,
	      0.899519,
	      -0.433012694,
	      0.0580127,
	      0.804163933,
	      0.580889285,
	      -0.125300229,
	      0.0137065668
	    ],
	    [
	      0.970295727,
	      0.241921902,
	      0.912210703,
	      -0.406574309,
	      0.0506851785,
	      0.828326404,
	      0.549233,
	      -0.10996896,
	      0.0111934906
	    ],
	    [
	      0.974370062,
	      0.224951059,
	      0.924095511,
	      -0.379640549,
	      0.043823462,
	      0.851105,
	      0.516161561,
	      -0.0954807103,
	      0.00899920426
	    ],
	    [
	      0.978147626,
	      0.207911685,
	      0.935159087,
	      -0.352244258,
	      0.0374359153,
	      0.872441,
	      0.481759191,
	      -0.08188,
	      0.00710520707
	    ],
	    [
	      0.981627166,
	      0.190809,
	      0.9453879,
	      -0.324418813,
	      0.0315303169,
	      0.892279327,
	      0.446113944,
	      -0.0692085773,
	      0.00549207628
	    ],
	    [
	      0.98480773,
	      0.173648179,
	      0.954769492,
	      -0.29619813,
	      0.0261138603,
	      0.910568774,
	      0.409317106,
	      -0.0575052574,
	      0.00413952675
	    ],
	    [
	      0.987688363,
	      0.156434461,
	      0.96329236,
	      -0.26761657,
	      0.0211931504,
	      0.927262187,
	      0.37146312,
	      -0.0468058847,
	      0.0030264766
	    ],
	    [
	      0.990268052,
	      0.139173105,
	      0.970946252,
	      -0.238708958,
	      0.0167741776,
	      0.942316413,
	      0.33264932,
	      -0.0371431746,
	      0.00213111029
	    ],
	    [
	      0.992546141,
	      0.121869341,
	      0.97772181,
	      -0.209510505,
	      0.0128623275,
	      0.955692589,
	      0.292975664,
	      -0.0285466593,
	      0.00143094664
	    ],
	    [
	      0.994521916,
	      0.104528464,
	      0.98361069,
	      -0.18005681,
	      0.00946236681,
	      0.967356,
	      0.252544463,
	      -0.0210425854,
	      0.000902908447
	    ],
	    [
	      0.99619472,
	      0.0871557444,
	      0.988605797,
	      -0.150383726,
	      0.00657843612,
	      0.977276683,
	      0.211460009,
	      -0.014653855,
	      0.000523393159
	    ],
	    [
	      0.997564077,
	      0.0697564706,
	      0.992701054,
	      -0.120527439,
	      0.00421405,
	      0.985428751,
	      0.169828475,
	      -0.00939994864,
	      0.000268345029
	    ],
	    [
	      0.99862951,
	      0.0523359552,
	      0.995891392,
	      -0.0905243,
	      0.00237208884,
	      0.991791308,
	      0.12775746,
	      -0.00529688271,
	      0.000113328853
	    ],
	    [
	      0.999390841,
	      0.0348994955,
	      0.998173058,
	      -0.0604108796,
	      0.00105479721,
	      0.996347725,
	      0.0853558108,
	      -0.00235716137,
	      0.000033604505
	    ],
	    [
	      0.99984771,
	      0.0174524058,
	      0.99954313,
	      -0.0302238502,
	      0.000263779628,
	      0.99908632,
	      0.0427332148,
	      -0.000589739357,
	      0.00000420248307
	    ],
	    [
	      1,
	      0,
	      1,
	      0,
	      0,
	      1,
	      0,
	      0,
	      0
	    ]
	  ]
	];

	module.exports = AmbisonicEncoderTable;

/***/ }),
/* 8 */
/***/ (function(module, exports) {

	/**
	 * Copyright 2016 Google Inc. All Rights Reserved.
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

	/**
	 * @fileOverview Junco library common utilities.
	 */

	'use strict';

	/**
	 * Junco library logging function.
	 * @type {Function}
	 * @param {any} Message to be printed out.
	 */
	exports.log = function () {
	  window.console.log.apply(window.console, [
	    '%c[Junco]%c '
	      + Array.prototype.slice.call(arguments).join(' ') + ' %c(@'
	      + performance.now().toFixed(2) + 'ms)',
	    'background: #BBDEFB; color: #FF5722; font-weight: 700',
	    'font-weight: 400',
	    'color: #AAA'
	  ]);
	};


/***/ }),
/* 9 */
/***/ (function(module, exports) {

	/**
	 * @license
	 * Copyright 2016 Google Inc. All Rights Reserved.
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

	/**
	 * @fileOverview Late Reverberation Filter for ambisonic content.
	 */

	'use strict';

	var MAX_T60 = 3;

	/**
	 * @class LateReverbFilter
	 * @description Late Reverberation Filter for ambisonic content.
	 * @param {AudioContext} context            Associated AudioContext.
	 * @param {Object} options
	 * @param {Number} options.speedOfSound     Speed of Sound (in meters / second).
	 * @param {Array} options.roomDimensions    Size dimensions in meters (w, h, d).
	 * @param {Array} options.roomMaterials     Absorption coeffs (L,R,U,D,F,B).
	 */
	function LateReverbFilter (context, options) {
	  var t60, k, V, A;
	  var decayRate = 0;
	  var recipSampleRate = 1 / context.sampleRate;

	  this._context = context;

	  // Acoustic constant.
	  if (options.speedOfSound > 0) {
	    k = 55.262042231857102 / options.speedOfSound;
	  } else {
	    k = 0.161113825748855;
	  }

	  // Room volume.
	  V = options.roomDimensions[0] * options.roomDimensions[1] * options.roomDimensions[2];

	  var xy = options.roomDimensions[0] * options.roomDimensions[1];
	  var xz = options.roomDimensions[0] * options.roomDimensions[2];
	  var yz = options.roomDimensions[1] * options.roomDimensions[2];

	  // Effective absorptive area.
	  A = (options.roomMaterials[0] + options.roomMaterials[1]) * xy +
	      (options.roomMaterials[0] + options.roomMaterials[2]) * xz +
	      (options.roomMaterials[1] + options.roomMaterials[2]) * yz;

	  // Reverberation time.
	  t60 = k * V / A;
	  if (t60 > MAX_T60) {
	    t60 = MAX_T60;
	  }

	  // Over-sample beyond T60 to ensure no artificial dropout.
	  var t60_samples = Math.round(t60 * this._context.sampleRate * 1.25);
	  if (t60_samples < 1) {
	    t60_samples = 1;
	  }
	  this._buffer =
	    this._context.createBuffer(1, t60_samples, this._context.sampleRate);

	  // Compute IR (single-band T60 for now).
	  if (this.T60 > 0) {
	    decayRate = -6.907755278982137 / this.T60;
	  }
	  var bufferData = this._buffer.getChannelData(0);
	  for (var i = 0; i < t60_samples; i++) {
	    bufferData[i] = (Math.random()* 2 - 1) *
	      Math.exp(decayRate * i * recipSampleRate);
	  }

	  // Create ConvolverNode.
	  this._convolver = context.createConvolver();
	  this._convolver.buffer = this._buffer;

	  // Input/Output proxy.
	  this.input = this._convolver;
	  this.output = this._convolver;
	}

	module.exports = LateReverbFilter;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @license
	 * Copyright 2016 Google Inc. All Rights Reserved.
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

	/**
	 * @fileOverview Source model to spatialize an AudioBuffer.
	 */

	'use strict';

	// Internal dependencies.
	var AttenuationFilter = __webpack_require__(4);
	var AmbisonicEncoder = __webpack_require__(6);

	/**
	 * @class Source
	 * @description Source model to spatialize an AudioBuffer.
	 * @param {Listener} listener               Associated Listener.
	 * @param {Object} options
	 * @param {Number} options.ambisonicOrder   Desired Ambisonic Order.
	 * @param {Number} options.minDistance      Min. distance (in meters).
	 * @param {Number} options.maxDistance      Max. distance (in meters).
	 * @param {Number} options.gain             Gain (linear).
	 */
	function Source (listener, options) {
	  this._context = listener._context;

	  this._listener = listener;
	  this.input = listener._context.createGain();
	  this.input.gain.value = options.gain;
	  this._attenuation =
	    new AttenuationFilter(listener._context, options.minDistance, options.maxDistance);
	  this._encoder = new AmbisonicEncoder(listener._context, options.ambisonicOrder);
	  this.position = [0,0,0];

	  this.input.connect(this._attenuation.input);
	  this._attenuation.output.connect(this._encoder.input);

	  this.input.connect(this._listener.late);
	  this._attenuation.output.connect(this._listener.early);
	  this._encoder.output.connect(this._listener.output);

	  this.setPosition(this.position[0], this.position[1], this.position[2]);

	  // Output proxy.
	  this.output = this._encoder.output;
	}

	Source.prototype.setPosition = function(x, y, z) {
	  var dx = new Float32Array(3);
	  this.position[0] = x;
	  this.position[1] = y;
	  this.position[2] = z;
	  for (var i = 0; i < 3; i++) {
	    dx[i] = this.position[i] - this._listener.position[i];
	  }
	  var radius = Math.sqrt(dx[0] * dx[0] + dx[1] * dx[1] + dx[2] * dx[2]);

	  // Normalize direction vector.
	  dx[0] /= radius;
	  dx[1] /= radius;
	  dx[2] /= radius;

	  var azimuth = Math.atan2(-dx[0], -dx[2]) * 57.295779513082323;
	  var elevation = Math.atan2(dx[1],
	    Math.sqrt(dx[0] * dx[0] + dx[2] * dx[2])) * 57.295779513082323;
	  this._attenuation.setDistance(radius);
	  this._encoder.setDirection(azimuth, elevation);
	}

	module.exports = Source;

/***/ })
/******/ ])
});
;