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
var AmbisonicEncoderTable = require('./ambisonic-encoder-table.js');
var AmbisonicEncoderTableMaxOrder = AmbisonicEncoderTable[0][0].length / 2;
var Utils = require('./utils.js');

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